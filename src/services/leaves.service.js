import LeavesModel from '../models/leaves.model.js';

class LeavesService {
  async createLeave(data) {
    // Map camelCase request fields to snake_case database columns
    const mappedData = {
      from_date: data.fromDate,
      to_date: data.toDate,
      session_from: data.sessionFrom,
      session_to: data.sessionTo,
      leave_type: data.leaveType,
      reason: data.reason,
      cc_to: data.ccTo || null
    };

    // Validate required fields
    const requiredFields = ['fromDate', 'toDate', 'sessionFrom', 'sessionTo', 'leaveType', 'reason'];
    const missingFields = requiredFields.filter(field => !data[field] || (typeof data[field] === 'string' && !data[field].trim()));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Insert into database
    const insertedId = await LeavesModel.create(mappedData);
    return { id: insertedId };
  }
}

export default new LeavesService();

