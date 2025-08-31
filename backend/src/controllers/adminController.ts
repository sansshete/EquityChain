import { Response } from 'express';
import { ProjectService } from '../services/projectService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/database';

export class AdminController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  public getPendingProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) FROM projects WHERE status = 'pending'";
    const countResult = await db.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT p.*, u.email as creator_email, u.first_name, u.last_name
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, [limit, offset]);

    const response: ApiResponse = {
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  });

  public approveProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { projectId } = req.params;
    const project = await this.projectService.approveProject(projectId, req.user.id);

    const response: ApiResponse = {
      success: true,
      data: { project },
      message: 'Project approved successfully',
    };

    res.status(200).json(response);
  });

  public rejectProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { projectId } = req.params;
    const { reason } = req.body;
    
    const project = await this.projectService.rejectProject(projectId, req.user.id, reason);

    const response: ApiResponse = {
      success: true,
      data: { project },
      message: 'Project rejected',
    };

    res.status(200).json(response);
  });

  public getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const kycStatus = req.query.kycStatus as string;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [limit, offset];
    let paramIndex = 3;

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    if (kycStatus === 'approved') {
      whereClause += ` AND is_kyc_verified = true`;
    } else if (kycStatus === 'pending') {
      whereClause += ` AND is_kyc_verified = false`;
    }

    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams.slice(2));
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT id, email, wallet_address, first_name, last_name, 
             is_kyc_verified, is_accredited, role, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, queryParams);

    const response: ApiResponse = {
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  });

  public getPendingKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) FROM users WHERE is_kyc_verified = false";
    const countResult = await db.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT id, email, wallet_address, first_name, last_name, created_at
      FROM users 
      WHERE is_kyc_verified = false
      ORDER BY created_at ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, [limit, offset]);

    const response: ApiResponse = {
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  });

  public getPlatformStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM projects WHERE is_approved = true) as approved_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'pending') as pending_projects,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_kyc_verified = true) as verified_users,
        (SELECT SUM(CAST(amount AS DECIMAL)) FROM investments WHERE status = 'confirmed') as total_invested,
        (SELECT COUNT(*) FROM investments WHERE status = 'confirmed') as total_investments
    `;

    const result = await db.query(statsQuery);
    const stats = result.rows[0];

    const response: ApiResponse = {
      success: true,
      data: {
        stats: {
          approvedProjects: parseInt(stats.approved_projects || '0'),
          pendingProjects: parseInt(stats.pending_projects || '0'),
          totalUsers: parseInt(stats.total_users || '0'),
          verifiedUsers: parseInt(stats.verified_users || '0'),
          totalInvested: parseFloat(stats.total_invested || '0'),
          totalInvestments: parseInt(stats.total_investments || '0'),
        },
      },
    };

    res.status(200).json(response);
  });

  public getSystemHealth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: process.version,
      },
    };

    res.status(200).json(response);
  });
}