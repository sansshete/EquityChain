import { Response } from 'express';
import { InvestmentService } from '../services/investmentService';
import { BlockchainService } from '../services/blockchainService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, InvestmentRequest } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export class InvestmentController {
  private investmentService: InvestmentService;
  private blockchainService: BlockchainService;

  constructor() {
    this.investmentService = new InvestmentService();
    this.blockchainService = new BlockchainService();
  }

  public createInvestment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const investmentData: InvestmentRequest = req.body;

    if (!investmentData.projectId || !investmentData.amount || !investmentData.transactionHash) {
      throw new AppError('Project ID, amount, and transaction hash are required', 400);
    }

    const investment = await this.investmentService.createInvestment(req.user.id, investmentData);

    const response: ApiResponse = {
      success: true,
      data: { investment },
      message: 'Investment recorded successfully',
    };

    res.status(201).json(response);
  });

  public getMyInvestments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.investmentService.getInvestmentsByInvestor(req.user.id, page, limit);

    const response: ApiResponse = {
      success: true,
      data: result.investments,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  });

  public getProjectInvestments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.investmentService.getInvestmentsByProject(projectId, page, limit);

    const response: ApiResponse = {
      success: true,
      data: result.investments,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  });

  public getInvestmentStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const result = await this.investmentService.getInvestmentStats(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: result.stats,
    };

    res.status(200).json(response);
  });

  public verifyInvestment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { transactionHash, chainId } = req.body;

    if (!transactionHash || !chainId) {
      throw new AppError('Transaction hash and chain ID are required', 400);
    }

    const verification = await this.blockchainService.verifyTransaction(transactionHash, chainId);

    const response: ApiResponse = {
      success: verification.success,
      data: verification.receipt,
      message: verification.success ? 'Transaction verified' : 'Transaction verification failed',
      error: verification.error,
    };

    res.status(verification.success ? 200 : 400).json(response);
  });

  public getPortfolioSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Get investment stats
    const statsResult = await this.investmentService.getInvestmentStats(req.user.id);
    
    // Get recent investments
    const investmentsResult = await this.investmentService.getInvestmentsByInvestor(req.user.id, 1, 5);

    const response: ApiResponse = {
      success: true,
      data: {
        stats: statsResult.stats,
        recentInvestments: investmentsResult.investments,
      },
    };

    res.status(200).json(response);
  });
}