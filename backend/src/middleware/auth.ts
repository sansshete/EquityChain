import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError } from './errorHandler';
import { UserService } from '../services/userService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    walletAddress: string;
    role: string;
    isKycVerified: boolean;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      const userService = new UserService();
      const user = await userService.getUserById(decoded.userId);
      
      if (!user) {
        throw new AppError('User not found', 401);
      }

      req.user = {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        isKycVerified: user.isKycVerified
      };

      next();
    } catch (jwtError) {
      throw new AppError('Invalid or expired token', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requireKyc = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isKycVerified) {
    return next(new AppError('KYC verification required', 403));
  }

  next();
};