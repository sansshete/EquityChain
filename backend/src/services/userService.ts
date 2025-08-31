import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { config } from '../config/config';
import { User } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UserService {
  async createUser(userData: {
    email: string;
    walletAddress: string;
    firstName?: string;
    lastName?: string;
    role?: 'investor' | 'creator';
  }): Promise<User> {
    try {
      const { email, walletAddress, firstName, lastName, role = 'investor' } = userData;

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new AppError('User already exists with this email', 400);
      }

      const existingWallet = await this.getUserByWallet(walletAddress);
      if (existingWallet) {
        throw new AppError('User already exists with this wallet address', 400);
      }

      const query = `
        INSERT INTO users (email, wallet_address, first_name, last_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;

      const result = await db.query(query, [email, walletAddress, firstName, lastName, role]);
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw new AppError('Failed to fetch user', 500);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw new AppError('Failed to fetch user', 500);
    }
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE wallet_address = $1';
      const result = await db.query(query, [walletAddress.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching user by wallet:', error);
      throw new AppError('Failed to fetch user', 500);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id' && key !== 'createdAt') {
          const dbKey = this.camelToSnake(key);
          setClause.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (setClause.length === 0) {
        throw new AppError('No valid fields to update', 400);
      }

      setClause.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async generateAuthToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  async verifyWalletSignature(walletAddress: string, signature: string, message: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      logger.error('Error verifying wallet signature:', error);
      return false;
    }
  }

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      walletAddress: dbUser.wallet_address,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      isKycVerified: dbUser.is_kyc_verified,
      isAccredited: dbUser.is_accredited,
      role: dbUser.role,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}