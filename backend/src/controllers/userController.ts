import { Response } from 'express';
import { UserService } from '../services/userService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await this.userService.getUserById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(200).json(response);
  });

  public updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { firstName, lastName, email } = req.body;
    
    const updatedUser = await this.userService.updateUser(req.user.id, {
      firstName,
      lastName,
      email,
    });

    const response: ApiResponse = {
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    };

    res.status(200).json(response);
  });

  public uploadKycDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // This would handle file upload for KYC documents
    // Implementation would include multer middleware for file handling
    
    const response: ApiResponse = {
      success: true,
      message: 'KYC document uploaded successfully',
    };

    res.status(200).json(response);
  });

  public getKycStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Mock KYC status for now
    const response: ApiResponse = {
      success: true,
      data: {
        kycStatus: req.user.isKycVerified ? 'approved' : 'pending',
        documentsUploaded: req.user.isKycVerified,
        verificationDate: req.user.isKycVerified ? new Date() : null,
      },
    };

    res.status(200).json(response);
  });

  public getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Admin-only endpoint to get all users
    const response: ApiResponse = {
      success: true,
      data: { users: [] }, // Implementation would fetch from database
      message: 'Users retrieved successfully',
    };

    res.status(200).json(response);
  });

  public approveKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    
    const updatedUser = await this.userService.updateUser(userId, {
      isKycVerified: true,
    });

    const response: ApiResponse = {
      success: true,
      data: { user: updatedUser },
      message: 'KYC approved successfully',
    };

    res.status(200).json(response);
  });

  public rejectKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const updatedUser = await this.userService.updateUser(userId, {
      isKycVerified: false,
    });

    const response: ApiResponse = {
      success: true,
      data: { user: updatedUser },
      message: 'KYC rejected',
    };

    res.status(200).json(response);
  });
}