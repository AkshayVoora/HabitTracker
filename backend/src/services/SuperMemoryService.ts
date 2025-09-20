import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, CreateUserRequest, LoginRequest, UserResponse, AuthResponse } from '@/models/User';
import { Habit, CreateHabitRequest, HabitResponse } from '@/models/Habit';
import { Schedule, CreateScheduleRequest, ScheduleResponse, RescheduleRequest } from '@/models/Schedule';
import { TaskCompletion, UpdateTaskCompletionRequest, TaskCompletionResponse } from '@/models/TaskCompletion';

export class SuperMemoryService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SUPERMEMORY_API_KEY || '';
    this.api = axios.create({
      baseURL: process.env.SUPERMEMORY_API_URL || 'https://api.supermemory.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 10000,
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[SuperMemory API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[SuperMemory API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[SuperMemory API] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // User operations
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      // Hash the password before sending to API
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(userData.password, 12);
      
      const userPayload = {
        email: userData.email,
        username: userData.username,
        password_hash,
        is_setup_complete: false
      };
      
      const response: AxiosResponse<UserResponse> = await this.api.post('/users', userPayload);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${this.getErrorMessage(error)}`);
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response: AxiosResponse<UserResponse> = await this.api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user: ${this.getErrorMessage(error)}`);
    }
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    try {
      const response: AxiosResponse<UserResponse> = await this.api.get(`/users/email/${email}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to get user by email: ${this.getErrorMessage(error)}`);
    }
  }

  async getUserWithPasswordByEmail(email: string): Promise<User | null> {
    try {
      const response: AxiosResponse<User> = await this.api.get(`/users/email/${email}/with-password`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to get user by email: ${this.getErrorMessage(error)}`);
    }
  }

  async updateUser(userId: string, updateData: Partial<UserResponse>): Promise<UserResponse> {
    try {
      const response: AxiosResponse<UserResponse> = await this.api.patch(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update user: ${this.getErrorMessage(error)}`);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.api.delete(`/users/${userId}`);
    } catch (error) {
      throw new Error(`Failed to delete user: ${this.getErrorMessage(error)}`);
    }
  }

  // Habit operations
  async createHabit(userId: string, habitData: CreateHabitRequest): Promise<HabitResponse> {
    try {
      const response: AxiosResponse<HabitResponse> = await this.api.post('/habits', {
        ...habitData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create habit: ${this.getErrorMessage(error)}`);
    }
  }

  async getHabitsByUserId(userId: string): Promise<HabitResponse[]> {
    try {
      const response: AxiosResponse<HabitResponse[]> = await this.api.get(`/habits/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get habits: ${this.getErrorMessage(error)}`);
    }
  }

  async getHabitById(habitId: string): Promise<HabitResponse> {
    try {
      const response: AxiosResponse<HabitResponse> = await this.api.get(`/habits/${habitId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get habit: ${this.getErrorMessage(error)}`);
    }
  }

  async updateHabit(habitId: string, updateData: Partial<CreateHabitRequest>): Promise<HabitResponse> {
    try {
      const response: AxiosResponse<HabitResponse> = await this.api.patch(`/habits/${habitId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update habit: ${this.getErrorMessage(error)}`);
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    try {
      await this.api.delete(`/habits/${habitId}`);
    } catch (error) {
      throw new Error(`Failed to delete habit: ${this.getErrorMessage(error)}`);
    }
  }

  // Schedule operations
  async createSchedule(userId: string, scheduleData: CreateScheduleRequest): Promise<ScheduleResponse> {
    try {
      const response: AxiosResponse<ScheduleResponse> = await this.api.post('/schedules', {
        ...scheduleData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create schedule: ${this.getErrorMessage(error)}`);
    }
  }

  async getSchedulesByUserId(userId: string): Promise<ScheduleResponse[]> {
    try {
      const response: AxiosResponse<ScheduleResponse[]> = await this.api.get(`/schedules/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get schedules: ${this.getErrorMessage(error)}`);
    }
  }

  async getScheduleById(scheduleId: string): Promise<ScheduleResponse> {
    try {
      const response: AxiosResponse<ScheduleResponse> = await this.api.get(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get schedule: ${this.getErrorMessage(error)}`);
    }
  }

  async updateSchedule(scheduleId: string, updateData: Partial<ScheduleResponse>): Promise<ScheduleResponse> {
    try {
      const response: AxiosResponse<ScheduleResponse> = await this.api.patch(`/schedules/${scheduleId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update schedule: ${this.getErrorMessage(error)}`);
    }
  }

  async rescheduleTasks(scheduleId: string, rescheduleData: RescheduleRequest): Promise<ScheduleResponse> {
    try {
      const response: AxiosResponse<ScheduleResponse> = await this.api.post(`/schedules/${scheduleId}/reschedule`, rescheduleData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to reschedule tasks: ${this.getErrorMessage(error)}`);
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await this.api.delete(`/schedules/${scheduleId}`);
    } catch (error) {
      throw new Error(`Failed to delete schedule: ${this.getErrorMessage(error)}`);
    }
  }

  // Task completion operations
  async updateTaskCompletion(userId: string, taskData: UpdateTaskCompletionRequest): Promise<TaskCompletionResponse> {
    try {
      const response: AxiosResponse<TaskCompletionResponse> = await this.api.patch('/tasks', {
        ...taskData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update task completion: ${this.getErrorMessage(error)}`);
    }
  }

  async getTaskCompletionsByUserId(userId: string, startDate?: string, endDate?: string): Promise<TaskCompletionResponse[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response: AxiosResponse<TaskCompletionResponse[]> = await this.api.get(`/tasks/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get task completions: ${this.getErrorMessage(error)}`);
    }
  }

  async getTaskCompletionById(taskId: string): Promise<TaskCompletionResponse> {
    try {
      const response: AxiosResponse<TaskCompletionResponse> = await this.api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get task completion: ${this.getErrorMessage(error)}`);
    }
  }

  // Helper method to extract error messages
  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

// Export singleton instance
export const superMemoryService = new SuperMemoryService();
