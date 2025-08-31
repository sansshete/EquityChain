import { Router } from 'express';
import { BlockchainController } from '../controllers/blockchainController';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();
const blockchainController = new BlockchainController();

// Get projects from specific blockchain network
router.get('/networks/:chainId/projects',
  [
    param('chainId').isInt().withMessage('Chain ID must be an integer'),
  ],
  validateRequest,
  blockchainController.getNetworkProjects
);

// Get project details from blockchain
router.get('/projects/:contractAddress',
  [
    param('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
    query('chainId').optional().isInt().withMessage('Chain ID must be an integer'),
  ],
  validateRequest,
  blockchainController.getProjectDetails
);

// Get investor data from blockchain
router.get('/projects/:contractAddress/investors/:investorAddress',
  [
    param('contractAddress').isEthereumAddress().withMessage('Invalid contract address'),
    param('investorAddress').isEthereumAddress().withMessage('Invalid investor address'),
    query('chainId').optional().isInt().withMessage('Chain ID must be an integer'),
  ],
  validateRequest,
  blockchainController.getInvestorData
);

// Verify transaction
router.get('/transactions/:transactionHash/verify',
  [
    param('transactionHash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash'),
    query('chainId').optional().isInt().withMessage('Chain ID must be an integer'),
  ],
  validateRequest,
  blockchainController.verifyTransaction
);

// Get supported networks
router.get('/networks', blockchainController.getNetworkInfo);

export default router;