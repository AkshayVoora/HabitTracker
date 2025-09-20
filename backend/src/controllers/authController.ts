import { Request, Response } from 'express';
import { superMemoryService } from '@/services/SuperMemoryService';
import { generateToken } from '@/utils/jwt';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password';
import { ApiResponse, CreateUserRequest, LoginRequest, UserResponse, AuthResponse } from '@/models';

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, confirm_password }: CreateUserRequest = req.body;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Password validation failed',
          error: 'PASSWORD_VALIDATION_ERROR',
          data: passwordValidation.errors
        };
        res.status(400).json(response);
        return;
      }

      // Check if user already exists
      const existingUser = await superMemoryService.getUserByEmail(email);
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User with this email already exists',
          error: 'USER_EXISTS'
        };
        res.status(409).json(response);
        return;
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Create user
      const userData: CreateUserRequest = {
        email,
        username,
        password,
        confirm_password
      };

      const user = await superMemoryService.createUser(userData);
      const token = generateToken(user as any);

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
          is_setup_complete: user.is_setup_complete
        },
        token
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'User created successfully',
        data: authResponse
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Signup error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create user account',
        error: 'SIGNUP_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Get user by email (with password hash for verification)
      const user = await superMemoryService.getUserWithPasswordByEmail(email);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        };
        res.status(401).json(response);
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        };
        res.status(401).json(response);
        return;
      }

      // Generate token
      const token = generateToken(user as any);

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
          is_setup_complete: user.is_setup_complete
        },
        token
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Login successful',
        data: authResponse
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to authenticate user',
        error: 'LOGIN_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        };
        res.status(401).json(response);
        return;
      }

      const user = await superMemoryService.getUserById(userId);
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
        is_setup_complete: user.is_setup_complete
      };

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: 'Profile retrieved successfully',
        data: userResponse
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve user profile',
        error: 'PROFILE_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        };
        res.status(401).json(response);
        return;
      }

      const { username, is_setup_complete } = req.body;
      const updateData: Partial<UserResponse> = {};

      if (username !== undefined) updateData.username = username;
      if (is_setup_complete !== undefined) updateData.is_setup_complete = is_setup_complete;

      const updatedUser = await superMemoryService.updateUser(userId, updateData);
      const userResponse: UserResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        created_at: updatedUser.created_at,
        is_setup_complete: updatedUser.is_setup_complete
      };

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: 'Profile updated successfully',
        data: userResponse
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update user profile',
        error: 'UPDATE_PROFILE_ERROR'
      };
      res.status(500).json(response);
    }
  }
}

export const authController = new AuthController();
