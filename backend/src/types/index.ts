export interface User {
  id: string;
  email: string;
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  isKycVerified: boolean;
  isAccredited: boolean;
  role: 'investor' | 'creator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  contractAddress: string;
  creatorId: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  fundingGoal: string;
  equityPercentage: number;
  minInvestment: string;
  maxInvestment: string;
  fundingDuration: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'successful' | 'failed';
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface Investment {
  id: string;
  projectId: string;
  investorId: string;
  amount: string;
  equityTokens: string;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  confirmedAt?: Date;
}

export interface KycDocument {
  id: string;
  userId: string;
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address';
  fileName: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  description: string;
  targetAmount: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  symbol: string;
  description: string;
  category: string;
  fundingGoal: string;
  equityPercentage: number;
  minInvestment: string;
  maxInvestment: string;
  fundingDuration: number;
  teamSize?: number;
  website?: string;
  businessPlan?: string;
}

export interface InvestmentRequest {
  projectId: string;
  amount: string;
  transactionHash: string;
}

export interface BlockchainEvent {
  id: string;
  eventType: 'ProjectCreated' | 'InvestmentMade' | 'FundingGoalReached' | 'MilestoneCompleted';
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  eventData: any;
  processed: boolean;
  createdAt: Date;
}