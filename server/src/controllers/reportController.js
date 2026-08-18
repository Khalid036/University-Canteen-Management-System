import prisma from '../config/db.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      activeOrders,
      lowStockItems,
      totalUsers,
      revenueResult
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } } }),
      prisma.menuItem.count({ where: { stockQuantity: { lte: 5 } } }),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
      })
    ]);

    const todayRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: today }
      }
    });

    res.json({
      success: true,
      data: {
        totalRevenue: revenueResult._sum.totalAmount || 0,
        todayRevenue: todayRevenueResult._sum.totalAmount || 0,
        totalOrders,
        todayOrders,
        activeOrders,
        lowStockItems,
        totalUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesAnalytics = async (req, res, next) => {
  try {
    // 1. Orders by Status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // 2. Top 5 selling items
    const topOrderItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const itemDetails = await Promise.all(
      topOrderItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { name: true, price: true, imageUrl: true, category: { select: { name: true } } }
        });
        return {
          menuItemId: item.menuItemId,
          name: menuItem ? menuItem.name : 'Unknown Item',
          category: menuItem?.category?.name || 'General',
          totalSold: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (menuItem?.price || 0)
        };
      })
    );

    // 3. Category distribution
    const categoryStats = await prisma.category.findMany({
      include: {
        menuItems: {
          include: {
            orderItems: true
          }
        }
      }
    });

    const categoryData = categoryStats.map((c) => {
      const totalSold = c.menuItems.reduce((acc, mi) => {
        return acc + mi.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
      }, 0);
      const totalRevenue = c.menuItems.reduce((acc, mi) => {
        return acc + mi.orderItems.reduce((sum, oi) => sum + (oi.quantity * mi.price), 0);
      }, 0);
      return {
        id: c.id,
        category: c.name,
        totalItems: c.menuItems.length,
        totalSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      };
    });

    // 4. Daily sales (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayRevenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      const dayName = startOfDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      last7Days.push({
        date: dayName,
        revenue: dayRevenue._sum.totalAmount || 0,
        orders: dayRevenue._count.id || 0
      });
    }

    res.json({
      success: true,
      data: {
        ordersByStatus,
        topSellingItems: itemDetails,
        categoryData,
        last7Days
      }
    });
  } catch (error) {
    next(error);
  }
};
