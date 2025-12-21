import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(ApiResponse.created('User registered successfully', user));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(ApiResponse.success('Login successful', result));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.params.id);
      res.status(200).json(ApiResponse.success('Profile fetched successfully', user));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

