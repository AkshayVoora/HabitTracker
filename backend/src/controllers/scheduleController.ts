import { Request, Response } from 'express';
import { superMemoryService } from '@/services/SuperMemoryService';
import { openAIService } from '@/services/OpenAIService';
import { ApiResponse, CreateScheduleRequest, ScheduleResponse, RescheduleRequest } from '@/models';

export class ScheduleController {
  async createSchedule(req: Request, res: Response): Promise<void> {
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

      const { habit_id, start_date, end_date, user_history }: CreateScheduleRequest = req.body;

      // Verify that the habit belongs to the user
      const habit = await superMemoryService.getHabitById(habit_id);
      if (habit.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Habit not found',
          error: 'HABIT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      // Generate AI-powered schedule
      const aiSchedule = await openAIService.generateSchedule({
        habit_name: habit.habit_name,
        user_history: user_history || habit.user_history,
        start_date,
        end_date
      });

      // Create schedule in database
      const scheduleData: CreateScheduleRequest = {
        habit_id,
        start_date,
        end_date,
        user_history
      };

      const schedule = await superMemoryService.createSchedule(userId, scheduleData);

      // Update schedule with AI-generated tasks
      const updatedSchedule = await superMemoryService.updateSchedule(schedule.id, {
        schedule_data: aiSchedule.tasks,
        generated_by_ai: true
      });

      const response: ApiResponse<ScheduleResponse> = {
        success: true,
        message: 'Schedule created successfully',
        data: {
          ...updatedSchedule,
          ai_reasoning: aiSchedule.reasoning,
          ai_recommendations: aiSchedule.recommendations
        } as any
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create schedule error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create schedule',
        error: 'CREATE_SCHEDULE_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getSchedules(req: Request, res: Response): Promise<void> {
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

      const schedules = await superMemoryService.getSchedulesByUserId(userId);

      const response: ApiResponse<ScheduleResponse[]> = {
        success: true,
        message: 'Schedules retrieved successfully',
        data: schedules
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get schedules error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve schedules',
        error: 'GET_SCHEDULES_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async getScheduleById(req: Request, res: Response): Promise<void> {
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

      const schedule = await superMemoryService.getScheduleById(scheduleId);

      // Verify that the schedule belongs to the authenticated user
      if (schedule.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Schedule not found',
          error: 'SCHEDULE_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<ScheduleResponse> = {
        success: true,
        message: 'Schedule retrieved successfully',
        data: schedule
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get schedule by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve schedule',
        error: 'GET_SCHEDULE_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async rescheduleTasks(req: Request, res: Response): Promise<void> {
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
      const { missed_dates, current_progress }: RescheduleRequest = req.body;

      // Get the existing schedule
      const existingSchedule = await superMemoryService.getScheduleById(scheduleId);
      if (existingSchedule.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Schedule not found',
          error: 'SCHEDULE_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      // Get the associated habit
      const habit = await superMemoryService.getHabitById(existingSchedule.habit_id);

      // Generate AI-powered reschedule
      const aiReschedule = await openAIService.rescheduleTasks({
        habit_name: habit.habit_name,
        user_history: habit.user_history,
        start_date: existingSchedule.start_date,
        end_date: existingSchedule.end_date,
        current_progress: {
          ...current_progress,
          missed_dates: missed_dates
        }
      });

      // Update the schedule with new tasks
      const updatedSchedule = await superMemoryService.updateSchedule(scheduleId, {
        schedule_data: aiReschedule.tasks,
        generated_by_ai: true
      });

      const response: ApiResponse<ScheduleResponse> = {
        success: true,
        message: 'Schedule rescheduled successfully',
        data: {
          ...updatedSchedule,
          ai_reasoning: aiReschedule.reasoning,
          ai_recommendations: aiReschedule.recommendations
        } as any
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Reschedule tasks error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to reschedule tasks',
        error: 'RESCHEDULE_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async updateSchedule(req: Request, res: Response): Promise<void> {
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
      const updateData = req.body;

      // Verify that the schedule belongs to the user
      const existingSchedule = await superMemoryService.getScheduleById(scheduleId);
      if (existingSchedule.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Schedule not found',
          error: 'SCHEDULE_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      const updatedSchedule = await superMemoryService.updateSchedule(scheduleId, updateData);

      const response: ApiResponse<ScheduleResponse> = {
        success: true,
        message: 'Schedule updated successfully',
        data: updatedSchedule
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update schedule error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update schedule',
        error: 'UPDATE_SCHEDULE_ERROR'
      };
      res.status(500).json(response);
    }
  }

  async deleteSchedule(req: Request, res: Response): Promise<void> {
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

      // Verify that the schedule belongs to the user
      const existingSchedule = await superMemoryService.getScheduleById(scheduleId);
      if (existingSchedule.user_id !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Schedule not found',
          error: 'SCHEDULE_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
      }

      await superMemoryService.deleteSchedule(scheduleId);

      const response: ApiResponse = {
        success: true,
        message: 'Schedule deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete schedule error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete schedule',
        error: 'DELETE_SCHEDULE_ERROR'
      };
      res.status(500).json(response);
    }
  }
}

export const scheduleController = new ScheduleController();
