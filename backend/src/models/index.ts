// Export all models from a central location
export * from './User';
export * from './Habit';
export * from './Schedule';
export * from './TaskCompletion';

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
