# Habit Tracker Backend API

A Node.js/Express/TypeScript backend API for the Habit Tracker Web Application that integrates with SUPERMEMORY API for data storage and OpenAI API for intelligent schedule generation.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Habit Management**: CRUD operations for user habits
- **AI-Powered Scheduling**: OpenAI integration for personalized habit schedules
- **Dynamic Rescheduling**: Automatic task redistribution when users miss days
- **Task Tracking**: Complete task completion tracking and progress monitoring
- **Data Persistence**: Integration with SUPERMEMORY API for reliable data storage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **HTTP Client**: axios
- **Security**: helmet, cors

## API Integrations

- **SUPERMEMORY API**: Data storage and retrieval
- **OpenAI API**: AI-powered schedule generation and optimization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- SUPERMEMORY API key
- OpenAI API key

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# SUPERMEMORY API Configuration
SUPERMEMORY_API_URL=https://api.supermemory.com
SUPERMEMORY_API_KEY=your-supermemory-api-key-here

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PATCH /api/v1/auth/profile` - Update user profile (protected)

### Habits
- `POST /api/v1/habits` - Create new habit (protected)
- `GET /api/v1/habits` - Get user's habits (protected)
- `GET /api/v1/habits/:habitId` - Get specific habit (protected)
- `PATCH /api/v1/habits/:habitId` - Update habit (protected)
- `DELETE /api/v1/habits/:habitId` - Delete habit (protected)

### Schedules
- `POST /api/v1/schedules` - Create AI-generated schedule (protected)
- `GET /api/v1/schedules` - Get user's schedules (protected)
- `GET /api/v1/schedules/:scheduleId` - Get specific schedule (protected)
- `PATCH /api/v1/schedules/:scheduleId` - Update schedule (protected)
- `DELETE /api/v1/schedules/:scheduleId` - Delete schedule (protected)
- `POST /api/v1/schedules/:scheduleId/reschedule` - Reschedule tasks (protected)

### Tasks
- `PATCH /api/v1/tasks/completion` - Update task completion status (protected)
- `GET /api/v1/tasks/completions` - Get task completions (protected)
- `GET /api/v1/tasks/completion/:taskId` - Get specific task completion (protected)
- `GET /api/v1/tasks/progress/:scheduleId` - Get task progress (protected)

### Health Check
- `GET /health` - API health status
- `GET /` - API information and available endpoints

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  is_setup_complete: boolean;
}
```

### Habit
```typescript
interface Habit {
  id: string;
  user_id: string;
  habit_name: string;
  user_history?: string;
  created_at: Date;
}
```

### Schedule
```typescript
interface Schedule {
  id: string;
  user_id: string;
  habit_id: string;
  schedule_data: DailyTask[];
  generated_by_ai: boolean;
  last_updated: Date;
  start_date: string;
  end_date: string;
}
```

### Task Completion
```typescript
interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  task_date: string;
  is_completed: boolean;
  completed_at?: Date;
  notes?: string;
}
```

## Error Handling

The API uses consistent error response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Rate limiting (can be added)

## Development Notes

- All routes are prefixed with `/api/v1`
- Protected routes require valid JWT token in Authorization header
- Input validation is handled by express-validator
- Error handling is centralized in middleware
- Logging is implemented for debugging

## Testing

Run tests (when implemented):
```bash
npm test
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## License

MIT License
