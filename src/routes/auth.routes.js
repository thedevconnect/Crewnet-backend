import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// Routes - Simple rakha hai, validation service me handle hogi
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/profile/:id', authController.getProfile.bind(authController));

export default router;

