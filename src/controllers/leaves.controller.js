import leavesService from '../services/leaves.service.js';
import ApiError from '../utils/ApiError.js';

class LeavesController {
  async getAllLeaves(req, res) {
    try {
      const result = await leavesService.getAllLeaves(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all leaves error:', error);
      // Use ApiError statusCode if available, otherwise default to 500
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getLeaveById(req, res) {
    try {
      const leave = await leavesService.getLeaveById(req.params.id);
      res.status(200).json({
        success: true,
        data: leave
      });
    } catch (error) {
      // Use ApiError statusCode if available, otherwise check message
      const statusCode = error instanceof ApiError ? error.statusCode : (error.message.includes('not found') ? 404 : 500);
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async createLeave(req, res) {
    try {
      const leave = await leavesService.createLeave(req.body);
      res.status(201).json({
        success: true,
        data: leave
      });
    } catch (error) {
      // Use ApiError statusCode if available, otherwise check message
      const statusCode = error instanceof ApiError ? error.statusCode : (error.message.includes('Missing required fields') ? 400 : 500);
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateLeave(req, res) {
    try {
      const leave = await leavesService.updateLeave(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: leave
      });
    } catch (error) {
      // Use ApiError statusCode if available, otherwise check message
      const statusCode = error instanceof ApiError ? error.statusCode : (error.message.includes('not found') ? 404 : 500);
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteLeave(req, res) {
    try {
      const result = await leavesService.deleteLeave(req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      // Use ApiError statusCode if available, otherwise check message
      const statusCode = error instanceof ApiError ? error.statusCode : (error.message.includes('not found') ? 404 : 500);
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new LeavesController();
