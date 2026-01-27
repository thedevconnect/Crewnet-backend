import authLoginService from '../services/auth-login.service.js';

class AuthLoginController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await authLoginService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Login error:', error.message);

      if (error.message === 'Email not found') {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }

      if (error.message === 'Invalid password') {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

export default new AuthLoginController();
