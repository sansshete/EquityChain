import { db } from '../config/database';
import { Investment, InvestmentRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { BlockchainService } from './blockchainService';

export class InvestmentService {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  async createInvestment(investorId: string, investmentData: InvestmentRequest): Promise<Investment> {
    try {
      const { projectId, amount, transactionHash } = investmentData;

      // Verify the transaction exists on blockchain
      const verification = await this.blockchainService.verifyTransaction(transactionHash, 1); // Default to mainnet
      
      if (!verification.success) {
        throw new AppError('Transaction verification failed', 400);
      }

      const query = `
        INSERT INTO investments (
          project_id, investor_id, amount, transaction_hash, 
          block_number, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
        RETURNING *
      `;

      const values = [
        projectId,
        investorId,
        amount,
        transactionHash,
        verification.receipt?.blockNumber || 0,
      ];

      const result = await db.query(query, values);
      return this.mapDbInvestmentToInvestment(result.rows[0]);
    } catch (error) {
      logger.error('Error creating investment:', error);
      throw error;
    }
  }

  async getInvestmentsByInvestor(investorId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const countQuery = 'SELECT COUNT(*) FROM investments WHERE investor_id = $1';
      const countResult = await db.query(countQuery, [investorId]);
      const total = parseInt(countResult.rows[0].count);

      const query = `
        SELECT i.*, p.name as project_name, p.category as project_category
        FROM investments i
        JOIN projects p ON i.project_id = p.id
        WHERE i.investor_id = $1 
        ORDER BY i.created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [investorId, limit, offset]);
      const investments = result.rows.map(row => ({
        ...this.mapDbInvestmentToInvestment(row),
        projectName: row.project_name,
        projectCategory: row.project_category,
      }));

      return {
        success: true,
        investments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching investments by investor:', error);
      throw new AppError('Failed to fetch investments', 500);
    }
  }

  async getInvestmentsByProject(projectId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const countQuery = 'SELECT COUNT(*) FROM investments WHERE project_id = $1';
      const countResult = await db.query(countQuery, [projectId]);
      const total = parseInt(countResult.rows[0].count);

      const query = `
        SELECT i.*, u.email as investor_email, u.wallet_address as investor_wallet
        FROM investments i
        JOIN users u ON i.investor_id = u.id
        WHERE i.project_id = $1 
        ORDER BY i.created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [projectId, limit, offset]);
      const investments = result.rows.map(row => ({
        ...this.mapDbInvestmentToInvestment(row),
        investorEmail: row.investor_email,
        investorWallet: row.investor_wallet,
      }));

      return {
        success: true,
        investments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching investments by project:', error);
      throw new AppError('Failed to fetch investments', 500);
    }
  }

  async confirmInvestment(investmentId: string, equityTokens: string): Promise<Investment> {
    try {
      const query = `
        UPDATE investments 
        SET equity_tokens = $2, status = 'confirmed', confirmed_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [investmentId, equityTokens]);
      
      if (result.rows.length === 0) {
        throw new AppError('Investment not found', 404);
      }

      return this.mapDbInvestmentToInvestment(result.rows[0]);
    } catch (error) {
      logger.error('Error confirming investment:', error);
      throw error;
    }
  }

  async getInvestmentStats(investorId: string) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_investments,
          SUM(CASE WHEN status = 'confirmed' THEN CAST(amount AS DECIMAL) ELSE 0 END) as total_invested,
          SUM(CASE WHEN status = 'confirmed' THEN CAST(equity_tokens AS DECIMAL) ELSE 0 END) as total_equity_tokens,
          COUNT(DISTINCT project_id) as unique_projects
        FROM investments 
        WHERE investor_id = $1
      `;
      
      const result = await db.query(query, [investorId]);
      const stats = result.rows[0];

      return {
        success: true,
        stats: {
          totalInvestments: parseInt(stats.total_investments),
          totalInvested: parseFloat(stats.total_invested || '0'),
          totalEquityTokens: parseFloat(stats.total_equity_tokens || '0'),
          uniqueProjects: parseInt(stats.unique_projects),
        },
      };
    } catch (error) {
      logger.error('Error fetching investment stats:', error);
      throw new AppError('Failed to fetch investment statistics', 500);
    }
  }

  private mapDbInvestmentToInvestment(dbInvestment: any): Investment {
    return {
      id: dbInvestment.id,
      projectId: dbInvestment.project_id,
      investorId: dbInvestment.investor_id,
      amount: dbInvestment.amount,
      equityTokens: dbInvestment.equity_tokens,
      transactionHash: dbInvestment.transaction_hash,
      blockNumber: dbInvestment.block_number,
      status: dbInvestment.status,
      createdAt: dbInvestment.created_at,
      confirmedAt: dbInvestment.confirmed_at,
    };
  }
}