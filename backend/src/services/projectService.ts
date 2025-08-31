import { db } from '../config/database';
import { Project, CreateProjectRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { BlockchainService } from './blockchainService';

export class ProjectService {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  async createProject(creatorId: string, projectData: CreateProjectRequest): Promise<Project> {
    try {
      const query = `
        INSERT INTO projects (
          creator_id, name, symbol, description, category, funding_goal,
          equity_percentage, min_investment, max_investment, funding_duration,
          team_size, website, business_plan, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', NOW(), NOW())
        RETURNING *
      `;

      const values = [
        creatorId,
        projectData.name,
        projectData.symbol,
        projectData.description,
        projectData.category,
        projectData.fundingGoal,
        projectData.equityPercentage,
        projectData.minInvestment,
        projectData.maxInvestment,
        projectData.fundingDuration,
        projectData.teamSize,
        projectData.website,
        projectData.businessPlan,
      ];

      const result = await db.query(query, values);
      return this.mapDbProjectToProject(result.rows[0]);
    } catch (error) {
      logger.error('Error creating project:', error);
      throw new AppError('Failed to create project', 500);
    }
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const query = 'SELECT * FROM projects WHERE id = $1';
      const result = await db.query(query, [projectId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbProjectToProject(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching project by ID:', error);
      throw new AppError('Failed to fetch project', 500);
    }
  }

  async getProjectByContractAddress(contractAddress: string): Promise<Project | null> {
    try {
      const query = 'SELECT * FROM projects WHERE contract_address = $1';
      const result = await db.query(query, [contractAddress]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbProjectToProject(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching project by contract address:', error);
      throw new AppError('Failed to fetch project', 500);
    }
  }

  async getProjectsByCreator(creatorId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const countQuery = 'SELECT COUNT(*) FROM projects WHERE creator_id = $1';
      const countResult = await db.query(countQuery, [creatorId]);
      const total = parseInt(countResult.rows[0].count);

      const query = `
        SELECT * FROM projects 
        WHERE creator_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [creatorId, limit, offset]);
      const projects = result.rows.map(row => this.mapDbProjectToProject(row));

      return {
        success: true,
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching projects by creator:', error);
      throw new AppError('Failed to fetch projects', 500);
    }
  }

  async getApprovedProjects(page: number = 1, limit: number = 10, category?: string) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE is_approved = true AND status = \'active\'';
      const queryParams: any[] = [limit, offset];
      let paramIndex = 3;

      if (category) {
        whereClause += ` AND category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }

      const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;
      const countResult = await db.query(countQuery, queryParams.slice(2));
      const total = parseInt(countResult.rows[0].count);

      const query = `
        SELECT * FROM projects 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await db.query(query, queryParams);
      const projects = result.rows.map(row => this.mapDbProjectToProject(row));

      return {
        success: true,
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching approved projects:', error);
      throw new AppError('Failed to fetch projects', 500);
    }
  }

  async approveProject(projectId: string, approvedBy: string): Promise<Project> {
    try {
      const query = `
        UPDATE projects 
        SET is_approved = true, status = 'approved', approved_at = NOW(), approved_by = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [projectId, approvedBy]);
      
      if (result.rows.length === 0) {
        throw new AppError('Project not found', 404);
      }

      return this.mapDbProjectToProject(result.rows[0]);
    } catch (error) {
      logger.error('Error approving project:', error);
      throw error;
    }
  }

  async rejectProject(projectId: string, rejectedBy: string, reason?: string): Promise<Project> {
    try {
      const query = `
        UPDATE projects 
        SET status = 'rejected', approved_by = $2, rejection_reason = $3, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [projectId, rejectedBy, reason]);
      
      if (result.rows.length === 0) {
        throw new AppError('Project not found', 404);
      }

      return this.mapDbProjectToProject(result.rows[0]);
    } catch (error) {
      logger.error('Error rejecting project:', error);
      throw error;
    }
  }

  async updateProjectContractAddress(projectId: string, contractAddress: string): Promise<Project> {
    try {
      const query = `
        UPDATE projects 
        SET contract_address = $2, status = 'active', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [projectId, contractAddress]);
      
      if (result.rows.length === 0) {
        throw new AppError('Project not found', 404);
      }

      return this.mapDbProjectToProject(result.rows[0]);
    } catch (error) {
      logger.error('Error updating project contract address:', error);
      throw error;
    }
  }

  async syncProjectWithBlockchain(contractAddress: string, chainId: number): Promise<void> {
    try {
      const blockchainData = await this.blockchainService.getProjectDetails(contractAddress, chainId);
      
      if (!blockchainData.success) {
        throw new AppError('Failed to fetch blockchain data', 500);
      }

      const project = blockchainData.project;
      
      const query = `
        UPDATE projects 
        SET 
          current_funding = $2,
          investor_count = $3,
          funding_active = $4,
          funding_successful = $5,
          updated_at = NOW()
        WHERE contract_address = $1
      `;

      await db.query(query, [
        contractAddress,
        project.currentFunding,
        project.investors,
        project.fundingActive,
        project.fundingSuccessful,
      ]);

      logger.info(`Project ${contractAddress} synced with blockchain`);
    } catch (error) {
      logger.error('Error syncing project with blockchain:', error);
      throw error;
    }
  }

  private mapDbProjectToProject(dbProject: any): Project {
    return {
      id: dbProject.id,
      contractAddress: dbProject.contract_address,
      creatorId: dbProject.creator_id,
      name: dbProject.name,
      symbol: dbProject.symbol,
      description: dbProject.description,
      category: dbProject.category,
      fundingGoal: dbProject.funding_goal,
      equityPercentage: dbProject.equity_percentage,
      minInvestment: dbProject.min_investment,
      maxInvestment: dbProject.max_investment,
      fundingDuration: dbProject.funding_duration,
      status: dbProject.status,
      isApproved: dbProject.is_approved,
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
      approvedAt: dbProject.approved_at,
      approvedBy: dbProject.approved_by,
    };
  }
}