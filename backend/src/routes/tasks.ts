import { Router } from 'express';
import { taskController } from '@/controllers/taskController';
import { authenticateToken } from '@/middleware/auth';
import { validateUpdateTaskCompletion, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Task completion operations
router.patch('/completion', validateUpdateTaskCompletion, handleValidationErrors, taskController.updateTaskCompletion);
router.get('/completions', taskController.getTaskCompletions);
router.get('/completion/:taskId', taskController.getTaskCompletionById);

// Task progress operations
router.get('/progress/:scheduleId', taskController.getTaskProgress);

export default router;
