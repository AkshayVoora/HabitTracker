import { Router } from 'express';
import { habitController } from '@/controllers/habitController';
import { authenticateToken } from '@/middleware/auth';
import { validateCreateHabit, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All habit routes require authentication
router.use(authenticateToken);

// Habit CRUD operations
router.post('/', validateCreateHabit, handleValidationErrors, habitController.createHabit);
router.get('/', habitController.getHabits);
router.get('/:habitId', habitController.getHabitById);
router.patch('/:habitId', validateCreateHabit, handleValidationErrors, habitController.updateHabit);
router.delete('/:habitId', habitController.deleteHabit);

export default router;
