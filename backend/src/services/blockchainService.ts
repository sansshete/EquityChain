import { ethers } from 'ethers';
import { config, getNetworkConfig } from '../config/config';
import { logger } from '../utils/logger';
import { PROJECT_FACTORY_ABI, EQUITY_TOKEN_ABI } from '../contracts/abis';

export class BlockchainService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private signer: ethers.Wallet | null = null;

  constructor() {
    this.initializeProviders();
    this.initializeSigner();
  }

  private initializeProviders() {
    // Initialize providers for supported networks
    if (config.ethereumRpcUrl) {
      this.providers.set(1, new ethers.JsonRpcProvider(config.ethereumRpcUrl));
    }
    if (config.polygonRpcUrl) {
      this.providers.set(137, new ethers.JsonRpcProvider(config.polygonRpcUrl));
    }
    if (config.sepoliaRpcUrl) {
      this.providers.set(11155111, new ethers.JsonRpcProvider(config.sepoliaRpcUrl));
    }
  }

  private initializeSigner() {
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey);
    }
  }

  public getProvider(chainId: number): ethers.JsonRpcProvider {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not configured for chain ID: ${chainId}`);
    }
    return provider;
  }

  public getSigner(chainId: number): ethers.Wallet {
    if (!this.signer) {
      throw new Error('Signer not configured');
    }
    const provider = this.getProvider(chainId);
    return this.signer.connect(provider);
  }

  public getFactoryContract(chainId: number, withSigner: boolean = false) {
    const networkConfig = getNetworkConfig(chainId);
    const provider = this.getProvider(chainId);
    const signerOrProvider = withSigner ? this.getSigner(chainId) : provider;
    
    return new ethers.Contract(
      networkConfig.factoryAddress,
      PROJECT_FACTORY_ABI,
      signerOrProvider
    );
  }

  public getEquityTokenContract(contractAddress: string, chainId: number, withSigner: boolean = false) {
    const provider = this.getProvider(chainId);
    const signerOrProvider = withSigner ? this.getSigner(chainId) : provider;
    
    return new ethers.Contract(
      contractAddress,
      EQUITY_TOKEN_ABI,
      signerOrProvider
    );
  }

  public async getProjectsFromBlockchain(chainId: number) {
    try {
      const factory = this.getFactoryContract(chainId);
      const projectAddresses = await factory.getApprovedProjects();
      
      const projects = [];
      for (const address of projectAddresses) {
        try {
          const projectInfo = await factory.projects(address);
          const equityToken = this.getEquityTokenContract(address, chainId);
          
          const [fundingProgress, timeRemaining, investorCount, description] = await Promise.all([
            equityToken.getFundingProgress(),
            equityToken.getTimeRemaining(),
            equityToken.getInvestorCount(),
            equityToken.projectDescription(),
          ]);

          projects.push({
            contractAddress: address,
            name: projectInfo.name,
            category: projectInfo.category,
            creator: projectInfo.creator,
            fundingGoal: ethers.formatEther(projectInfo.fundingGoal),
            equityPercentage: Number(projectInfo.equityPercentage),
            currentFunding: ethers.formatEther(fundingProgress.raised),
            investors: Number(investorCount),
            daysLeft: Math.ceil(Number(timeRemaining) / (24 * 60 * 60)),
            description,
            isActive: projectInfo.isActive,
            isApproved: projectInfo.isApproved,
            createdAt: new Date(Number(projectInfo.createdAt) * 1000),
          });
        } catch (error) {
          logger.error(`Error fetching project details for ${address}:`, error);
        }
      }

      return { success: true, projects };
    } catch (error: any) {
      logger.error('Error fetching projects from blockchain:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch projects',
        projects: [],
      };
    }
  }

  public async getProjectDetails(contractAddress: string, chainId: number) {
    try {
      const factory = this.getFactoryContract(chainId);
      const equityToken = this.getEquityTokenContract(contractAddress, chainId);

      const [
        projectInfo,
        fundingProgress,
        timeRemaining,
        investorCount,
        minInvestment,
        maxInvestment,
        tokenPrice,
        fundingActive,
        fundingSuccessful,
        description,
      ] = await Promise.all([
        factory.projects(contractAddress),
        equityToken.getFundingProgress(),
        equityToken.getTimeRemaining(),
        equityToken.getInvestorCount(),
        equityToken.minInvestment(),
        equityToken.maxInvestment(),
        equityToken.tokenPrice(),
        equityToken.fundingActive(),
        equityToken.fundingSuccessful(),
        equityToken.projectDescription(),
      ]);

      return {
        success: true,
        project: {
          contractAddress,
          name: projectInfo.name,
          description,
          category: projectInfo.category,
          creator: projectInfo.creator,
          fundingGoal: ethers.formatEther(projectInfo.fundingGoal),
          currentFunding: ethers.formatEther(fundingProgress.raised),
          equityPercentage: Number(projectInfo.equityPercentage),
          investors: Number(investorCount),
          daysLeft: Math.ceil(Number(timeRemaining) / (24 * 60 * 60)),
          minInvestment: ethers.formatEther(minInvestment),
          maxInvestment: ethers.formatEther(maxInvestment),
          tokenPrice: ethers.formatEther(tokenPrice),
          fundingActive,
          fundingSuccessful,
          fundingPercentage: Number(fundingProgress.percentage),
          isActive: projectInfo.isActive,
          isApproved: projectInfo.isApproved,
          createdAt: new Date(Number(projectInfo.createdAt) * 1000),
        },
      };
    } catch (error: any) {
      logger.error('Error fetching project details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch project details',
      };
    }
  }

  public async verifyTransaction(transactionHash: string, chainId: number) {
    try {
      const provider = this.getProvider(chainId);
      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { success: false, error: 'Transaction not found' };
      }

      return {
        success: true,
        receipt: {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.gasPrice?.toString(),
        },
      };
    } catch (error: any) {
      logger.error('Error verifying transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify transaction',
      };
    }
  }

  public async getInvestorData(projectAddress: string, investorAddress: string, chainId: number) {
    try {
      const equityToken = this.getEquityTokenContract(projectAddress, chainId);

      const [investorInfo, tokenBalance] = await Promise.all([
        equityToken.investors(investorAddress),
        equityToken.balanceOf(investorAddress),
      ]);

      return {
        success: true,
        data: {
          investment: ethers.formatEther(investorInfo.investment),
          tokens: ethers.formatEther(investorInfo.tokens),
          tokenBalance: ethers.formatEther(tokenBalance),
          timestamp: new Date(Number(investorInfo.timestamp) * 1000),
          isActive: investorInfo.isActive,
        },
      };
    } catch (error: any) {
      logger.error('Error fetching investor data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch investor data',
      };
    }
  }
}