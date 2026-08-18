import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/me', authenticate, getMyOrders);
router.get('/', authenticate, requireRole('MANAGER'), getAllOrders);
router.patch('/:id/status', authenticate, requireRole('MANAGER'), updateOrderStatus);
router.patch('/:id/cancel', authenticate, cancelOrder);

export default router;
