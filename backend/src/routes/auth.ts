import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

// Wallet-based authentication
router.post('/wallet',
  [
    body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('signature').notEmpty().withMessage('Signature is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  authController.walletAuth
);

// Traditional registration
router.post('/register',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('role').optional().isIn(['investor', 'creator']).withMessage('Role must be investor or creator'),
  ],
  validateRequest,
  authController.register
);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', 
  authMiddleware,
  [
    body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
  ],
  validateRequest,
  authController.updateProfile
);

export default router;