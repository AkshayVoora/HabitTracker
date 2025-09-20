import { Request, Response } from 'express';
import { superMemoryService } from '@/services/SuperMemoryService';
import { ApiResponse, UpdateTaskCompletionRequest, TaskCompletionResponse } from '@/models';

export class TaskController {
  async updateTaskCompletion(req: Request, res: Response): Promise<void> {
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

      const { task_id, is_completed, notes }: UpdateTaskCompletionRequest = req.body;

      const taskData: UpdateTaskCompletionRequest = {
        task_id,
        is_completed,
        notes
      };

      const taskCompletion = await superMemoryService.updateTaskCompletion(userId, taskData);

      const response: ApiResponse<TaskCompletionResponse> = {
        success: true,
        message: 'Task completion updated successfully',
        data: taskCompletion
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update task completion error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update task completion',
        error: 'UPDATE_TASK_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getTaskCompletions(req: Request, res: Response): Promise<void> {
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

      const { start_date, end_date } = req.query;

      const taskCompletions = await superMemoryService.getTaskCompletionsByUserId(
        userId,
        start_date as string,
        end_date as string
      );

      const response: ApiResponse<TaskCompletionResponse[]> = {
        success: true,
        message: 'Task completions retrieved successfully',
        data: taskCompletions
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get task completions error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve task completions',
        error: 'GET_TASK_COMPLETIONS_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getTaskCompletionById(req: Request, res: Response): Promise<void> {
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

      const { taskId } = req.params;

      const taskCompletion = await superMemoryService.getTaskCompletionById(taskId);

      // Verify that the task completion belongs to the authenticated user
      if (taskCompletion.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Task completion not found',
          error: 'TASK_COMPLETION_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<TaskCompletionResponse> = {
        success: true,
        message: 'Task completion retrieved successfully',
        data: taskCompletion
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get task completion by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve task completion',
        error: 'GET_TASK_COMPLETION_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getTaskProgress(req: Request, res: Response): Promise<void> {
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

      const { scheduleId } = req.params;

      // Get the schedule
      const schedule = await superMemoryService.getScheduleById(scheduleId);
      if (schedule.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Schedule not found',
          error: 'SCHEDULE_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      // Get task completions for this schedule
      const taskCompletions = await superMemoryService.getTaskCompletionsByUserId(userId);

      // Calculate progress statistics
      const totalTasks = schedule.schedule_data.length;
      const completedTasks = schedule.schedule_data.filter(task => task.is_completed).length;
      const missedTasks = schedule.schedule_data.filter(task => {
        const taskDate = new Date(task.date);
        const today = new Date();
        return !task.is_completed && taskDate < today;
      }).length;

      const progressData = {
        schedule_id: scheduleId,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        missed_tasks: missedTasks,
        completion_rate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        tasks: schedule.schedule_data.map(task => ({
          id: task.id,
          date: task.date,
          description: task.task_description,
          is_completed: task.is_completed,
          priority: task.priority
        }))
      };

      const response: ApiResponse = {
        success: true,
        message: 'Task progress retrieved successfully',
        data: progressData
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get task progress error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve task progress',
        error: 'GET_TASK_PROGRESS_ERROR'
      };
      res.status(500).json(response);
    }
  }
}

export const taskController = new TaskController();
