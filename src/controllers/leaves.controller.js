import leavesService from '../services/leaves.service.js';

class LeavesController {
  async createLeave(req, res) {
    try {
      const result = await leavesService.createLeave(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('Missing required fields') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new LeavesController();

