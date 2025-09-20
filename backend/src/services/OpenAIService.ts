import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DailyTask } from '@/models/Schedule';

export interface OpenAIScheduleRequest {
  habit_name: string;
  user_history?: string;
  start_date: string;
  end_date: string;
  current_progress?: {
    completed_tasks: number;
    total_tasks: number;
    missed_dates: string[];
  };
}

export interface OpenAIScheduleResponse {
  tasks: DailyTask[];
  reasoning: string;
  recommendations: string[];
}

export interface OpenAIPromptData {
  habit_name: string;
  user_history?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  current_progress?: {
    completed_tasks: number;
    total_tasks: number;
    missed_dates: string[];
  };
}

export class OpenAIService {
  private api: AxiosInstance;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    this.api = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 30000, // 30 seconds timeout for AI requests
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[OpenAI API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[OpenAI API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[OpenAI API] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async generateSchedule(request: OpenAIScheduleRequest): Promise<OpenAIScheduleResponse> {
    try {
      const prompt = this.buildSchedulePrompt(request);
      const response = await this.callOpenAI(prompt);
      return this.parseScheduleResponse(response);
    } catch (error) {
      throw new Error(`Failed to generate schedule: ${this.getErrorMessage(error)}`);
    }
  }

  async rescheduleTasks(request: OpenAIScheduleRequest): Promise<OpenAIScheduleResponse> {
    try {
      const prompt = this.buildReschedulePrompt(request);
      const response = await this.callOpenAI(prompt);
      return this.parseScheduleResponse(response);
    } catch (error) {
      throw new Error(`Failed to reschedule tasks: ${this.getErrorMessage(error)}`);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response: AxiosResponse<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }> = await this.api.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert habit formation coach and schedule optimizer. You help users create realistic, achievable habit schedules and adapt them based on their progress.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`OpenAI API call failed: ${this.getErrorMessage(error)}`);
    }
  }

  private buildSchedulePrompt(data: OpenAIScheduleRequest): string {
    const totalDays = this.calculateDaysBetween(data.start_date, data.end_date);
    
    return `
Create a personalized habit schedule for the following:

HABIT: ${data.habit_name}
DURATION: ${totalDays} days (${data.start_date} to ${data.end_date})
${data.user_history ? `USER HISTORY: ${data.user_history}` : ''}

REQUIREMENTS:
1. Create ${totalDays} daily tasks that progressively build the habit
2. Start with easy, achievable tasks and gradually increase difficulty
3. Consider the user's history and any mentioned challenges
4. Make tasks specific, measurable, and time-bound
5. Include variety to maintain engagement
6. Account for potential setbacks and provide flexibility

OUTPUT FORMAT (JSON only):
{
  "tasks": [
    {
      "id": "unique-id",
      "date": "YYYY-MM-DD",
      "task_description": "Specific task description",
      "is_completed": false,
      "priority": 1-5
    }
  ],
  "reasoning": "Brief explanation of the schedule strategy",
  "recommendations": ["Tip 1", "Tip 2", "Tip 3"]
}

Generate the schedule now:
    `.trim();
  }

  private buildReschedulePrompt(data: OpenAIScheduleRequest): string {
    const totalDays = this.calculateDaysBetween(data.start_date, data.end_date);
    const progress = data.current_progress;
    
    return `
Reschedule the remaining habit tasks based on current progress:

HABIT: ${data.habit_name}
ORIGINAL DURATION: ${totalDays} days (${data.start_date} to ${data.end_date})
CURRENT PROGRESS: ${progress?.completed_tasks || 0}/${progress?.total_tasks || totalDays} tasks completed
MISSED DATES: ${progress?.missed_dates?.join(', ') || 'None'}
${data.user_history ? `USER HISTORY: ${data.user_history}` : ''}

REQUIREMENTS:
1. Redistribute remaining tasks across the remaining days
2. Maintain the progressive difficulty curve
3. Account for the user's current progress and missed days
4. Adjust task difficulty based on performance
5. Provide encouragement and realistic expectations
6. Don't overload any single day

OUTPUT FORMAT (JSON only):
{
  "tasks": [
    {
      "id": "unique-id",
      "date": "YYYY-MM-DD",
      "task_description": "Specific task description",
      "is_completed": false,
      "priority": 1-5
    }
  ],
  "reasoning": "Brief explanation of the rescheduling strategy",
  "recommendations": ["Encouragement tip 1", "Strategy tip 2", "Motivation tip 3"]
}

Generate the rescheduled plan now:
    `.trim();
  }

  private parseScheduleResponse(response: string): OpenAIScheduleResponse {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in OpenAI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid response structure: tasks array missing');
      }

      // Generate unique IDs for tasks if not provided
      const tasks: DailyTask[] = parsed.tasks.map((task: any, index: number) => ({
        id: task.id || `task-${Date.now()}-${index}`,
        date: task.date,
        task_description: task.task_description,
        is_completed: task.is_completed || false,
        priority: task.priority || 3,
      }));

      return {
        tasks,
        reasoning: parsed.reasoning || 'Schedule generated based on habit formation principles',
        recommendations: parsed.recommendations || ['Stay consistent', 'Track your progress', 'Be patient with yourself'],
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse AI-generated schedule');
    }
  }

  private calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
