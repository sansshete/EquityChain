import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public walletAuth = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      throw new AppError('Wallet address, signature, and message are required', 400);
    }

    // Verify the signature
    const isValidSignature = await this.userService.verifyWalletSignature(
      walletAddress,
      signature,
      message
    );

    if (!isValidSignature) {
      throw new AppError('Invalid signature', 401);
    }

    // Check if user exists
    let user = await this.userService.getUserByWallet(walletAddress);

    if (!user) {
      // Create new user
      user = await this.userService.createUser({
        email: `${walletAddress}@wallet.local`, // Temporary email
        walletAddress,
        role: 'investor',
      });
    }

    // Generate JWT token
    const token = await this.userService.generateAuthToken(user);

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          isKycVerified: user.isKycVerified,
          isAccredited: user.isAccredited,
          role: user.role,
        },
        token,
      },
      message: 'Authentication successful',
    };

    res.status(200).json(response);
  });

  public register = asyncHandler(async (req: Request, res: Response) => {
    const { email, walletAddress, firstName, lastName, role } = req.body;

    if (!email || !walletAddress) {
      throw new AppError('Email and wallet address are required', 400);
    }

    const user = await this.userService.createUser({
      email,
      walletAddress,
      firstName,
      lastName,
      role: role || 'investor',
    });

    const token = await this.userService.generateAuthToken(user);

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          isKycVerified: user.isKycVerified,
          isAccredited: user.isAccredited,
          role: user.role,
        },
        token,
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  });

  public getProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await this.userService.getUserById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          isKycVerified: user.isKycVerified,
          isAccredited: user.isAccredited,
          role: user.role,
        },
      },
    };

    res.status(200).json(response);
  });

  public updateProfile = asyncHandler(async (req: any, res: Response) => {
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
}