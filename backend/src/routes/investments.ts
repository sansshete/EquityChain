import { Router } from 'express';
import { InvestmentController } from '../controllers/investmentController';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const investmentController = new InvestmentController();

// Create new investment
router.post('/',
  [
    body('projectId').isUUID().withMessage('Invalid project ID'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('transactionHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
  ],
  validateRequest,
  investmentController.createInvestment
);

// Get user's investments
router.get('/my-investments',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  investmentController.getMyInvestments
);

// Get investments for a specific project
router.get('/project/:projectId',
  [
    param('projectId').isUUID().withMessage('Invalid project ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  investmentController.getProjectInvestments
);

// Get investment statistics
router.get('/stats', investmentController.getInvestmentStats);

// Verify investment transaction
router.post('/verify',
  [
    body('transactionHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
    body('chainId').isInt().withMessage('Chain ID must be an integer'),
  ],
  validateRequest,
  investmentController.verifyInvestment
);

// Get portfolio summary
router.get('/portfolio', investmentController.getPortfolioSummary);

export default router;