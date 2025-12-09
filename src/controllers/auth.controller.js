import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class AuthController {
  // Register - Receive request and call service
  async register(req, res, next) {
    try {
      console.log('🔐 Register endpoint hit');
      const user = await authService.register(req.body);
      const response = ApiResponse.created('User registered successfully', user);
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ Register error:', error);
      next(error); // Pass to error handler
    }
  }

  // Login - Login with email and password
  async login(req, res, next) {
    try {
      console.log('🔐 Login endpoint hit');
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      const response = ApiResponse.success('Login successful', result);
      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Login error:', error);
      next(error);
    }
  }

  // Profile - Get user details
  async getProfile(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await authService.getProfile(userId);
      const response = ApiResponse.success('Profile fetched successfully', user);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

