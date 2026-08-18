import { Router } from 'express';
import { getAllUsers, toggleUserStatus, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', authenticate, requireRole('MANAGER'), getAllUsers);
router.patch('/:id/toggle-status', authenticate, requireRole('MANAGER'), toggleUserStatus);
router.put('/profile', authenticate, updateProfile);

export default router;
