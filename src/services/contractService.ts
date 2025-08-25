import { ethers } from 'ethers';
import { CROWDFUNDING_FACTORY_ABI, EQUITY_CROWDFUNDING_PROJECT_ABI } from '../contracts/abis';
import { getContractAddress } from '../contracts/contractAddresses';

export class ContractService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner;
  private chainId: number;

  constructor(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, chainId: number) {
    this.provider = provider;
    this.signer = signer;
    this.chainId = chainId;
  }

  // Factory Contract Methods
  async createProject(projectData: {
    title: string;
    description: string;
    fundingGoal: string;
    milestoneDescriptions: string[];
    milestoneAmounts: string[];
    tokenName: string;
    tokenSymbol: string;
    totalSupply: string;
    fundingDuration: string;
  }) {
    try {
      const factoryAddress = getContractAddress(this.chainId, 'crowdfundingFactory');
      const factory = new ethers.Contract(factoryAddress, CROWDFUNDING_FACTORY_ABI, this.signer);

      const milestoneAmountsWei = projectData.milestoneAmounts.map(amount => 
        ethers.parseEther(amount)
      );

      const tx = await factory.createProject(
        projectData.title,
        projectData.description,
        ethers.parseEther(projectData.fundingGoal),
        projectData.milestoneDescriptions,
        milestoneAmountsWei,
        projectData.tokenName,
        projectData.tokenSymbol,
        ethers.parseEther(projectData.totalSupply),
        parseInt(projectData.fundingDuration) * 24 * 60 * 60 // Convert days to seconds
      );

      const receipt = await tx.wait();
      
      // Extract the project address from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === 'ProjectCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = factory.interface.parseLog(event);
        return {
          success: true,
          projectAddress: parsed?.args[0],
          transactionHash: receipt.hash,
        };
      }

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error creating project:', error);
      return {
        success: false,
        error: error.message || 'Failed to create project',
      };
    }
  }

  async approveProject(projectAddress: string) {
    try {
      const factoryAddress = getContractAddress(this.chainId, 'crowdfundingFactory');
      const factory = new ethers.Contract(factoryAddress, CROWDFUNDING_FACTORY_ABI, this.signer);

      const tx = await factory.approveProject(projectAddress);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error approving project:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve project',
      };
    }
  }

  async rejectProject(projectAddress: string) {
    try {
      const factoryAddress = getContractAddress(this.chainId, 'crowdfundingFactory');
      const factory = new ethers.Contract(factoryAddress, CROWDFUNDING_FACTORY_ABI, this.signer);

      const tx = await factory.rejectProject(projectAddress);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject project',
      };
    }
  }

  async getAllProjects() {
    try {
      const factoryAddress = getContractAddress(this.chainId, 'crowdfundingFactory');
      const factory = new ethers.Contract(factoryAddress, CROWDFUNDING_FACTORY_ABI, this.provider);

      const projectAddresses = await factory.getAllProjects();
      const projects = [];

      for (const address of projectAddresses) {
        const projectInfo = await factory.projects(address);
        const projectContract = new ethers.Contract(address, EQUITY_CROWDFUNDING_PROJECT_ABI, this.provider);
        
        const [projectDetails, backerCount] = await Promise.all([
          projectContract.getProjectInfo(),
          projectContract.getBackerCount(),
        ]);

        projects.push({
          contractAddress: address,
          title: projectInfo.title,
          description: projectInfo.description,
          creator: projectInfo.creator,
          fundingGoal: ethers.formatEther(projectInfo.fundingGoal),
          createdAt: new Date(Number(projectInfo.createdAt) * 1000),
          isApproved: projectInfo.isApproved,
          isActive: projectInfo.isActive,
          totalRaised: ethers.formatEther(projectDetails.raised),
          fundingDeadline: new Date(Number(projectDetails.deadline) * 1000),
          backerCount: Number(backerCount),
          fundingSuccessful: projectDetails.successful,
          projectCompleted: projectDetails.completed,
          milestoneCount: Number(projectDetails.milestones),
          currentMilestone: Number(projectDetails.currentMilestoneIndex),
        });
      }

      return { success: true, projects };
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch projects',
        projects: [],
      };
    }
  }

  async getApprovedProjects() {
    try {
      const factoryAddress = getContractAddress(this.chainId, 'crowdfundingFactory');
      const factory = new ethers.Contract(factoryAddress, CROWDFUNDING_FACTORY_ABI, this.provider);

      const projectAddresses = await factory.getApprovedProjects();
      const projects = [];

      for (const address of projectAddresses) {
        const projectContract = new ethers.Contract(address, EQUITY_CROWDFUNDING_PROJECT_ABI, this.provider);
        
        const [projectDetails, backerCount] = await Promise.all([
          projectContract.getProjectInfo(),
          projectContract.getBackerCount(),
        ]);

        projects.push({
          contractAddress: address,
          title: projectDetails.title,
          description: projectDetails.description,
          fundingGoal: ethers.formatEther(projectDetails.goal),
          totalRaised: ethers.formatEther(projectDetails.raised),
          fundingDeadline: new Date(Number(projectDetails.deadline) * 1000),
          backerCount: Number(backerCount),
          isActive: projectDetails.active,
          fundingSuccessful: projectDetails.successful,
          projectCompleted: projectDetails.completed,
          milestoneCount: Number(projectDetails.milestones),
          currentMilestone: Number(projectDetails.currentMilestoneIndex),
        });
      }

      return { success: true, projects };
    } catch (error: any) {
      console.error('Error fetching approved projects:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch approved projects',
        projects: [],
      };
    }
  }

  // Project Contract Methods
  async contributeToProject(projectAddress: string, amount: string) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.signer);

      const tx = await project.contribute({
        value: ethers.parseEther(amount),
      });

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error contributing to project:', error);
      return {
        success: false,
        error: error.message || 'Failed to contribute to project',
      };
    }
  }

  async submitMilestone(projectAddress: string, milestoneId: number) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.signer);

      const tx = await project.submitMilestone(milestoneId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error submitting milestone:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit milestone',
      };
    }
  }

  async voteOnMilestone(projectAddress: string, milestoneId: number, vote: boolean) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.signer);

      const tx = await project.voteOnMilestone(milestoneId, vote);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error voting on milestone:', error);
      return {
        success: false,
        error: error.message || 'Failed to vote on milestone',
      };
    }
  }

  async releaseFunds(projectAddress: string, milestoneId: number) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.signer);

      const tx = await project.releaseFunds(milestoneId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      return {
        success: false,
        error: error.message || 'Failed to release funds',
      };
    }
  }

  async requestRefund(projectAddress: string) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.signer);

      const tx = await project.refund();
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error requesting refund:', error);
      return {
        success: false,
        error: error.message || 'Failed to request refund',
      };
    }
  }

  async getProjectDetails(projectAddress: string) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.provider);

      const [projectInfo, backerCount] = await Promise.all([
        project.getProjectInfo(),
        project.getBackerCount(),
      ]);

      return {
        success: true,
        project: {
          contractAddress: projectAddress,
          title: projectInfo.title,
          description: projectInfo.description,
          fundingGoal: ethers.formatEther(projectInfo.goal),
          totalRaised: ethers.formatEther(projectInfo.raised),
          fundingDeadline: new Date(Number(projectInfo.deadline) * 1000),
          backerCount: Number(backerCount),
          isActive: projectInfo.active,
          fundingSuccessful: projectInfo.successful,
          projectCompleted: projectInfo.completed,
          milestoneCount: Number(projectInfo.milestones),
          currentMilestone: Number(projectInfo.currentMilestoneIndex),
        },
      };
    } catch (error: any) {
      console.error('Error fetching project details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch project details',
      };
    }
  }

  async getMilestone(projectAddress: string, milestoneId: number) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.provider);

      const milestone = await project.getMilestone(milestoneId);

      return {
        success: true,
        milestone: {
          description: milestone.description,
          amount: ethers.formatEther(milestone.amount),
          isSubmitted: milestone.isSubmitted,
          isApproved: milestone.isApproved,
          isRejected: milestone.isRejected,
          yesVotes: ethers.formatEther(milestone.yesVotes),
          noVotes: ethers.formatEther(milestone.noVotes),
          submittedAt: milestone.submittedAt > 0 ? new Date(Number(milestone.submittedAt) * 1000) : null,
          votingDeadline: milestone.votingDeadline > 0 ? new Date(Number(milestone.votingDeadline) * 1000) : null,
        },
      };
    } catch (error: any) {
      console.error('Error fetching milestone:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch milestone',
      };
    }
  }

  async getBackerInfo(projectAddress: string, backerAddress: string) {
    try {
      const project = new ethers.Contract(projectAddress, EQUITY_CROWDFUNDING_PROJECT_ABI, this.provider);

      const [backerInfo, tokenBalance] = await Promise.all([
        project.getBackerInfo(backerAddress),
        project.balanceOf(backerAddress),
      ]);

      return {
        success: true,
        backer: {
          contribution: ethers.formatEther(backerInfo.contribution),
          tokens: ethers.formatEther(backerInfo.tokens),
          tokenBalance: ethers.formatEther(tokenBalance),
          contributedAt: backerInfo.contributedAt > 0 ? new Date(Number(backerInfo.contributedAt) * 1000) : null,
          hasRefunded: backerInfo.hasRefunded,
        },
      };
    } catch (error: any) {
      console.error('Error fetching backer info:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch backer info',
      };
    }
  }
}