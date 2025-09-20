import { Request, Response } from 'express';
import { superMemoryService } from '@/services/SuperMemoryService';
import { ApiResponse, CreateHabitRequest, HabitResponse } from '@/models';

export class HabitController {
  async createHabit(req: Request, res: Response): Promise<void> {
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

      const { habit_name, user_history }: CreateHabitRequest = req.body;

      const habitData: CreateHabitRequest = {
        habit_name,
        user_history
      };

      const habit = await superMemoryService.createHabit(userId, habitData);

      const response: ApiResponse<HabitResponse> = {
        success: true,
        message: 'Habit created successfully',
        data: habit
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create habit error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create habit',
        error: 'CREATE_HABIT_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getHabits(req: Request, res: Response): Promise<void> {
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

      const habits = await superMemoryService.getHabitsByUserId(userId);

      const response: ApiResponse<HabitResponse[]> = {
        success: true,
        message: 'Habits retrieved successfully',
        data: habits
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get habits error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve habits',
        error: 'GET_HABITS_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getHabitById(req: Request, res: Response): Promise<void> {
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

      const { habitId } = req.params;

      const habit = await superMemoryService.getHabitById(habitId);

      // Verify that the habit belongs to the authenticated user
      if (habit.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Habit not found',
          error: 'HABIT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<HabitResponse> = {
        success: true,
        message: 'Habit retrieved successfully',
        data: habit
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get habit by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve habit',
        error: 'GET_HABIT_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async updateHabit(req: Request, res: Response): Promise<void> {
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

      const { habitId } = req.params;
      const { habit_name, user_history } = req.body;

      // First verify that the habit belongs to the user
      const existingHabit = await superMemoryService.getHabitById(habitId);
      if (existingHabit.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Habit not found',
          error: 'HABIT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      const updateData: Partial<CreateHabitRequest> = {};
      if (habit_name !== undefined) updateData.habit_name = habit_name;
      if (user_history !== undefined) updateData.user_history = user_history;

      const updatedHabit = await superMemoryService.updateHabit(habitId, updateData);

      const response: ApiResponse<HabitResponse> = {
        success: true,
        message: 'Habit updated successfully',
        data: updatedHabit
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update habit error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update habit',
        error: 'UPDATE_HABIT_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async deleteHabit(req: Request, res: Response): Promise<void> {
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

      const { habitId } = req.params;

      // First verify that the habit belongs to the user
      const existingHabit = await superMemoryService.getHabitById(habitId);
      if (existingHabit.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Habit not found',
          error: 'HABIT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      await superMemoryService.deleteHabit(habitId);

      const response: ApiResponse = {
        success: true,
        message: 'Habit deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete habit error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete habit',
        error: 'DELETE_HABIT_ERROR'
      };
      res.status(500).json(response);
    }
  }
}

export const habitController = new HabitController();
