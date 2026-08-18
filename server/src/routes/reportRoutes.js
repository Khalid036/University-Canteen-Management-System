import { Router } from 'express';
import { getDashboardSummary, getSalesAnalytics } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.get('/summary', authenticate, requireRole('MANAGER'), getDashboardSummary);
router.get('/sales', authenticate, requireRole('MANAGER'), getSalesAnalytics);

export default router;
