export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD format
  task_description: string;
  is_completed: boolean;
  completed_at?: Date;
  priority: number; // 1-5 scale for task importance
}

export interface Schedule {
  id: string;
  user_id: string;
  habit_id: string;
  schedule_data: DailyTask[];
  generated_by_ai: boolean;
  last_updated: Date;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
}

export interface CreateScheduleRequest {
  habit_id: string;
  start_date: string;
  end_date: string;
  user_history?: string;
}

export interface ScheduleResponse {
  id: string;
  user_id: string;
  habit_id: string;
  schedule_data: DailyTask[];
  generated_by_ai: boolean;
  last_updated: Date;
  start_date: string;
  end_date: string;
}

export interface RescheduleRequest {
  schedule_id: string;
  missed_dates: string[]; // Array of dates that were missed
  current_progress: {
    completed_tasks: number;
    total_tasks: number;
  };
}
