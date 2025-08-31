import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { BlockchainService } from '../services/blockchainService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, CreateProjectRequest } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export class ProjectController {
  private projectService: ProjectService;
  private blockchainService: BlockchainService;

  constructor() {
    this.projectService = new ProjectService();
    this.blockchainService = new BlockchainService();
  }

  public createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projectData: CreateProjectRequest = req.body;

    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'fundingGoal', 'equityPercentage', 'minInvestment'];
    for (const field of requiredFields) {
      if (!projectData[field as keyof CreateProjectRequest]) {
        throw new AppError(`${field} is required`, 400);
      }
    }

    // Validate funding goal range
    const fundingGoal = parseFloat(projectData.fundingGoal);
    if (fundingGoal < 10000 || fundingGoal > 10000000) {
      throw new AppError('Funding goal must be between $10,000 and $10,000,000', 400);
    }

    // Validate equity percentage
    if (projectData.equityPercentage < 1 || projectData.equityPercentage > 100) {
      throw new AppError('Equity percentage must be between 1% and 100%', 400);
    }

    const project = await this.projectService.createProject(req.user.id, projectData);

    const response: ApiResponse = {
      success: true,
      data: { project },
      message: 'Project created successfully and submitted for review',
    };

    res.status(201).json(response);
  });

  public getProjects = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    const result = await this.projectService.getApprovedProjects(page, limit, category);

    const response: ApiResponse = {
      success: true,
      data: result.projects,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  });

  public getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const project = await this.projectService.getProjectById(id);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: { project },
    };

    res.status(200).json(response);
  });

  public getProjectByContract = asyncHandler(async (req: Request, res: Response) => {
    const { contractAddress } = req.params;
    const chainId = parseInt(req.query.chainId as string) || 1;

    // Get project from database
    const project = await this.projectService.getProjectByContractAddress(contractAddress);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get real-time data from blockchain
    const blockchainData = await this.blockchainService.getProjectDetails(contractAddress, chainId);

    const response: ApiResponse = {
      success: true,
      data: {
        project: {
          ...project,
          blockchainData: blockchainData.success ? blockchainData.project : null,
        },
      },
    };

    res.status(200).json(response);
  });

  public getCreatorProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.projectService.getProjectsByCreator(req.user.id, page, limit);

    const response: ApiResponse = {
      success: true,
      data: result.projects,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  });

  public syncProject = asyncHandler(async (req: Request, res: Response) => {
    const { contractAddress } = req.params;
    const chainId = parseInt(req.body.chainId) || 1;

    await this.projectService.syncProjectWithBlockchain(contractAddress, chainId);

    const response: ApiResponse = {
      success: true,
      message: 'Project synced with blockchain successfully',
    };

    res.status(200).json(response);
  });

  public getProjectCategories = asyncHandler(async (req: Request, res: Response) => {
    const query = `
      SELECT category, COUNT(*) as project_count
      FROM projects 
      WHERE is_approved = true AND status = 'active'
      GROUP BY category
      ORDER BY project_count DESC
    `;

    const result = await db.query(query);
    const categories = result.rows.map((row: any) => ({
      name: row.category,
      count: parseInt(row.project_count),
    }));

    const response: ApiResponse = {
      success: true,
      data: { categories },
    };

    res.status(200).json(response);
  });
}