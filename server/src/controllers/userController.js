import { z } from 'zod';
import prisma from '../config/db.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role && role !== 'ALL') {
      where.role = role.toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { institutionId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institutionId: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own manager account'
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: `User account ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  institutionId: z.string().optional(),
  avatarUrl: z.string().optional()
});

export const updateProfile = async (req, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: validated,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institutionId: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated
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
