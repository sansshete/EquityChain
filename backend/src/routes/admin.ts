import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireRole } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const adminController = new AdminController();

// All routes require admin role
router.use(requireRole(['admin']));

// Project management
router.get('/projects/pending',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  adminController.getPendingProjects
);

router.put('/projects/:projectId/approve',
  [
    param('projectId').isUUID().withMessage('Invalid project ID'),
  ],
  validateRequest,
  adminController.approveProject
);

router.put('/projects/:projectId/reject',
  [
    param('projectId').isUUID().withMessage('Invalid project ID'),
    body('reason').notEmpty().withMessage('Rejection reason is required'),
  ],
  validateRequest,
  adminController.rejectProject
);

// User management
router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['investor', 'creator', 'admin']).withMessage('Invalid role'),
    query('kycStatus').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid KYC status'),
  ],
  validateRequest,
  adminController.getUsers
);

// KYC management
router.get('/kyc/pending',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  adminController.getPendingKyc
);

// Platform statistics
router.get('/stats', adminController.getPlatformStats);

// System health
router.get('/health', adminController.getSystemHealth);

export default router;