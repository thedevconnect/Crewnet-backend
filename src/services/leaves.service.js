import LeavesModel from '../models/leaves.model.js';

class LeavesService {
  async getAllLeaves(query) {
    try {
      return await LeavesModel.findAll(query);
    } catch (error) {
      console.error('Get all leaves service error:', error);
      throw error;
    }
  }

  async getLeaveById(id) {
    const leave = await LeavesModel.findById(id);
    if (!leave) {
      throw new Error('Leave not found');
    }
    return leave;
  }

  async createLeave(data) {
    const mappedData = {
      from_date: data.fromDate,
      to_date: data.toDate,
      session_from: data.sessionFrom,
      session_to: data.sessionTo,
      leave_type: data.leaveType,
      reason: data.reason,
      cc_to: data.ccTo || null
    };

    const requiredFields = ['fromDate', 'toDate', 'sessionFrom', 'sessionTo', 'leaveType', 'reason'];
    const missingFields = requiredFields.filter(field => !data[field] || (typeof data[field] === 'string' && !data[field].trim()));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const insertedId = await LeavesModel.create(mappedData);
    const leave = await LeavesModel.findById(insertedId);
    return leave;
  }

  async updateLeave(id, data) {
    const existingLeave = await LeavesModel.findById(id);
    if (!existingLeave) {
      throw new Error('Leave not found');
    }

    const mappedData = {};
    if (data.fromDate !== undefined) mappedData.from_date = data.fromDate;
    if (data.toDate !== undefined) mappedData.to_date = data.toDate;
    if (data.sessionFrom !== undefined) mappedData.session_from = data.sessionFrom;
    if (data.sessionTo !== undefined) mappedData.session_to = data.sessionTo;
    if (data.leaveType !== undefined) mappedData.leave_type = data.leaveType;
    if (data.reason !== undefined) mappedData.reason = data.reason;
    if (data.ccTo !== undefined) mappedData.cc_to = data.ccTo;

    return await LeavesModel.update(id, mappedData);
  }

  async deleteLeave(id) {
    const existingLeave = await LeavesModel.findById(id);
    if (!existingLeave) {
      throw new Error('Leave not found');
    }

    const deleted = await LeavesModel.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete leave');
    }
    return { message: 'Leave deleted successfully' };
  }
}

export default new LeavesService();
