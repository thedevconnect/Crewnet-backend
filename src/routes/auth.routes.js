import express from 'express';
import authLoginController from '../controllers/auth-login.controller.js';

const router = express.Router();

router.post('/login', authLoginController.login.bind(authLoginController));

export default router;
