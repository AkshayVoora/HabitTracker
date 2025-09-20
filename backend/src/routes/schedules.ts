import { Router } from 'express';
import { scheduleController } from '@/controllers/scheduleController';
import { authenticateToken } from '@/middleware/auth';
import { validateCreateSchedule, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All schedule routes require authentication
router.use(authenticateToken);

// Schedule CRUD operations
router.post('/', validateCreateSchedule, handleValidationErrors, scheduleController.createSchedule);
router.get('/', scheduleController.getSchedules);
router.get('/:scheduleId', scheduleController.getScheduleById);
router.patch('/:scheduleId', scheduleController.updateSchedule);
router.delete('/:scheduleId', scheduleController.deleteSchedule);

// Special schedule operations
router.post('/:scheduleId/reschedule', scheduleController.rescheduleTasks);

export default router;
