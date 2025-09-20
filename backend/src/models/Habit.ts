export interface Habit {
  id: string;
  user_id: string;
  habit_name: string;
  user_history?: string;
  created_at: Date;
}

export interface CreateHabitRequest {
  habit_name: string;
  user_history?: string;
}

export interface HabitResponse {
  id: string;
  user_id: string;
  habit_name: string;
  user_history?: string;
  created_at: Date;
}
