import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { requireRole } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile',
  [
    body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
  ],
  validateRequest,
  userController.updateProfile
);

// KYC document upload
router.post('/kyc/upload', userController.uploadKycDocument);

// Get KYC status
router.get('/kyc/status', userController.getKycStatus);

// Admin only routes
router.get('/',
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['investor', 'creator', 'admin']).withMessage('Invalid role'),
  ],
  validateRequest,
  userController.getAllUsers
);

router.put('/:userId/kyc/approve',
  requireRole(['admin']),
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
  ],
  validateRequest,
  userController.approveKyc
);

router.put('/:userId/kyc/reject',
  requireRole(['admin']),
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('reason').notEmpty().withMessage('Rejection reason is required'),
  ],
  validateRequest,
  userController.rejectKyc
);

export default router;