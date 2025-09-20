import { Router } from 'express';
import authRoutes from './auth';
import habitRoutes from './habits';
import scheduleRoutes from './schedules';
import taskRoutes from './tasks';

const router = Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Route definitions
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/habits`, habitRoutes);
router.use(`${API_PREFIX}/schedules`, scheduleRoutes);
router.use(`${API_PREFIX}/tasks`, taskRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Habit Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Habit Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      habits: `${API_PREFIX}/habits`,
      schedules: `${API_PREFIX}/schedules`,
      tasks: `${API_PREFIX}/tasks`,
      health: '/health'
    }
  });
});

export default router;
