import { z } from 'zod';
import prisma from '../config/db.js';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1')
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  pickupTime: z.string().optional(),
  notes: z.string().optional(),
  isPriority: z.boolean().optional().default(false)
});

export const createOrder = async (req, res, next) => {
  try {
    const validated = createOrderSchema.parse(req.body);
    const userId = req.user.id;
    const isTeacher = req.user.role === 'TEACHER';

    // Priority flag is granted for teachers or if explicitly set for faculty
    const isPriority = isTeacher ? (validated.isPriority ?? true) : false;

    // Transaction to verify stock, compute totals, create order, decrement stock
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const item of validated.items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId }
        });

        if (!menuItem) {
          throw new Error(`Menu item with ID ${item.menuItemId} not found`);
        }

        if (!menuItem.isAvailable) {
          throw new Error(`"${menuItem.name}" is currently unavailable`);
        }

        if (menuItem.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${menuItem.name}". Available: ${menuItem.stockQuantity}, Requested: ${item.quantity}`
          );
        }

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;

        orderItemsToCreate.push({
          menuItemId: menuItem.id,
          quantity: item.quantity,
          priceAtOrder: menuItem.price
        });

        // Decrement stock
        const newStock = menuItem.stockQuantity - item.quantity;
        await tx.menuItem.update({
          where: { id: menuItem.id },
          data: {
            stockQuantity: newStock,
            isAvailable: newStock > 0
          }
        });
      }

      // Generate order number ORD-XXXXXX
      const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          totalAmount: Math.round(totalAmount * 100) / 100,
          pickupTime: validated.pickupTime || 'Immediate (ASAP)',
          isPriority,
          notes: validated.notes || null,
          items: {
            create: orderItemsToCreate
          }
        },
        include: {
          items: {
            include: {
              menuItem: {
                select: { id: true, name: true, imageUrl: true, price: true, isVeg: true }
              }
            }
          },
          user: {
            select: { id: true, name: true, email: true, role: true, department: true, phone: true }
          }
        }
      });

      return order;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order'
    });
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, price: true, isVeg: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, priorityOnly, date } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (priorityOnly === 'true') {
      where.isPriority = true;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, institutionId: true, department: true, phone: true }
        },
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, price: true, isVeg: true }
            }
          }
        }
      },
      orderBy: [
        { isPriority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancelledReason } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If transitioning to CANCELLED and was not previously cancelled, restore stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              stockQuantity: { increment: item.quantity },
              isAvailable: true
            }
          });
        }

        await tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledReason: cancelledReason || 'Cancelled by manager'
          }
        });
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: {
          status,
          cancelledReason: status === 'CANCELLED' ? (cancelledReason || 'Cancelled by manager') : null
        }
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { menuItem: true } }
      }
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Must be order owner unless manager
    if (order.userId !== userId && req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this order'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}`
      });
    }

    // Restore stock and cancel
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.menuItem.update({
          where: { id: item.menuItemId },
          data: {
            stockQuantity: { increment: item.quantity },
            isAvailable: true
          }
        });
      }

      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledReason: 'Cancelled by customer'
        }
      });
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
