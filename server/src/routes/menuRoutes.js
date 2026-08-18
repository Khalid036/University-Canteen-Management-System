import { Router } from 'express';
import {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateStock
} from '../controllers/menuController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.get('/', getMenu);
router.get('/:id', getMenuItem);
router.post('/', authenticate, requireRole('MANAGER'), uploadImage.single('image'), createMenuItem);
router.put('/:id', authenticate, requireRole('MANAGER'), uploadImage.single('image'), updateMenuItem);
router.delete('/:id', authenticate, requireRole('MANAGER'), deleteMenuItem);
router.patch('/:id/stock', authenticate, requireRole('MANAGER'), updateStock);

export default router;
