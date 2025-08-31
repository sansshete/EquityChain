import { Request, Response } from 'express';
import { BlockchainService } from '../services/blockchainService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

export class BlockchainController {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  public getNetworkProjects = asyncHandler(async (req: Request, res: Response) => {
    const chainId = parseInt(req.params.chainId);

    if (!chainId) {
      throw new AppError('Chain ID is required', 400);
    }

    const result = await this.blockchainService.getProjectsFromBlockchain(chainId);

    const response: ApiResponse = {
      success: result.success,
      data: result.projects,
      error: result.error,
    };

    res.status(result.success ? 200 : 400).json(response);
  });

  public getProjectDetails = asyncHandler(async (req: Request, res: Response) => {
    const { contractAddress } = req.params;
    const chainId = parseInt(req.query.chainId as string) || 1;

    if (!contractAddress) {
      throw new AppError('Contract address is required', 400);
    }

    const result = await this.blockchainService.getProjectDetails(contractAddress, chainId);

    const response: ApiResponse = {
      success: result.success,
      data: result.project,
      error: result.error,
    };

    res.status(result.success ? 200 : 400).json(response);
  });

  public getInvestorData = asyncHandler(async (req: Request, res: Response) => {
    const { contractAddress, investorAddress } = req.params;
    const chainId = parseInt(req.query.chainId as string) || 1;

    if (!contractAddress || !investorAddress) {
      throw new AppError('Contract address and investor address are required', 400);
    }

    const result = await this.blockchainService.getInvestorData(contractAddress, investorAddress, chainId);

    const response: ApiResponse = {
      success: result.success,
      data: result.data,
      error: result.error,
    };

    res.status(result.success ? 200 : 400).json(response);
  });

  public verifyTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { transactionHash } = req.params;
    const chainId = parseInt(req.query.chainId as string) || 1;

    if (!transactionHash) {
      throw new AppError('Transaction hash is required', 400);
    }

    const result = await this.blockchainService.verifyTransaction(transactionHash, chainId);

    const response: ApiResponse = {
      success: result.success,
      data: result.receipt,
      error: result.error,
    };

    res.status(result.success ? 200 : 400).json(response);
  });

  public getNetworkInfo = asyncHandler(async (req: Request, res: Response) => {
    const supportedNetworks = [
      { chainId: 1, name: 'Ethereum Mainnet', currency: 'ETH' },
      { chainId: 137, name: 'Polygon Mainnet', currency: 'MATIC' },
      { chainId: 11155111, name: 'Sepolia Testnet', currency: 'SepoliaETH' },
    ];

    const response: ApiResponse = {
      success: true,
      data: { networks: supportedNetworks },
    };

    res.status(200).json(response);
  });
}