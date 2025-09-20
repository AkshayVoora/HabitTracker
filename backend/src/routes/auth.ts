import { Router } from 'express';
import { authController } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validateSignup, validateLogin, handleValidationErrors } from '@/middleware/validation';

const router = Router();

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, authController.signup);
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.patch('/profile', authenticateToken, authController.updateProfile);

export default router;
