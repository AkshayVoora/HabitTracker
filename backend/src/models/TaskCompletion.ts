export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  task_date: string; // YYYY-MM-DD format
  is_completed: boolean;
  completed_at?: Date;
  notes?: string;
}

export interface UpdateTaskCompletionRequest {
  task_id: string;
  is_completed: boolean;
  notes?: string;
}

export interface TaskCompletionResponse {
  id: string;
  user_id: string;
  task_id: string;
  task_date: string;
  is_completed: boolean;
  completed_at?: Date;
  notes?: string;
}
