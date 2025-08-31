import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authMiddleware, requireKyc } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const projectController = new ProjectController();

// Public routes
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isLength({ min: 1, max: 50 }).withMessage('Category must be 1-50 characters'),
  ],
  validateRequest,
  projectController.getProjects
);

router.get('/categories', projectController.getProjectCategories);

router.get('/:id',
  [
    param('id').isUUID().withMessage('Invalid project ID'),
  ],
  validateRequest,
  projectController.getProjectById
);

router.get('/contract/:contractAddress',
  [
    param('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
    query('chainId').optional().isInt().withMessage('Chain ID must be an integer'),
  ],
  validateRequest,
  projectController.getProjectByContract
);

// Protected routes
router.post('/',
  authMiddleware,
  requireKyc,
  [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('symbol').isLength({ min: 1, max: 10 }).withMessage('Symbol must be 1-10 characters'),
    body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('category').isLength({ min: 1, max: 50 }).withMessage('Category is required'),
    body('fundingGoal').isNumeric().withMessage('Funding goal must be a number'),
    body('equityPercentage').isInt({ min: 1, max: 100 }).withMessage('Equity percentage must be 1-100'),
    body('minInvestment').isNumeric().withMessage('Minimum investment must be a number'),
    body('maxInvestment').isNumeric().withMessage('Maximum investment must be a number'),
    body('fundingDuration').isInt({ min: 7, max: 365 }).withMessage('Funding duration must be 7-365 days'),
    body('teamSize').optional().isInt({ min: 1 }).withMessage('Team size must be a positive integer'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
  ],
  validateRequest,
  projectController.createProject
);

router.get('/creator/my-projects',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  projectController.getCreatorProjects
);

router.post('/sync/:contractAddress',
  authMiddleware,
  [
    param('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
    body('chainId').isInt().withMessage('Chain ID is required'),
  ],
  validateRequest,
  projectController.syncProject
);

export default router;