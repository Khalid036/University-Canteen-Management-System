import { z } from 'zod';
import prisma from '../config/db.js';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative').default(0),
  isAvailable: z.coerce.boolean().default(true),
  isVeg: z.coerce.boolean().default(true),
  prepTimeMinutes: z.coerce.number().int().min(1).default(10),
  calories: z.coerce.number().int().optional()
});

export const getMenu = async (req, res, next) => {
  try {
    const { categoryId, search, isVeg, isAvailable, sort } = req.query;

    const where = {};

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isVeg !== undefined && isVeg !== '') {
      where.isVeg = isVeg === 'true';
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      where.isAvailable = isAvailable === 'true';
    }

    let orderBy = { name: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { orderItems: { _count: 'desc' } };

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy
    });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const payload = { ...req.body, imageUrl };
    const validated = menuItemSchema.parse(payload);

    const item = await prisma.menuItem.create({
      data: validated,
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: item
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const payload = { ...req.body };
    if (imageUrl) payload.imageUrl = imageUrl;

    const validated = menuItemSchema.parse(payload);

    const item = await prisma.menuItem.update({
      where: { id },
      data: validated,
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: item
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.menuItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stockQuantity, isAvailable } = req.body;

    const current = await prisma.menuItem.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const newStock = Number(stockQuantity);
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        stockQuantity: newStock,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : (newStock > 0)
      }
    });

    res.json({
      success: true,
      message: 'Stock updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
