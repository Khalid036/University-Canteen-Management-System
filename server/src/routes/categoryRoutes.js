import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, requireRole('MANAGER'), createCategory);
router.put('/:id', authenticate, requireRole('MANAGER'), updateCategory);
router.delete('/:id', authenticate, requireRole('MANAGER'), deleteCategory);

export default router;
