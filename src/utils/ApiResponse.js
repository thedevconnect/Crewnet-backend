class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }

  static success(message, data = null, statusCode = 200) {
    return new ApiResponse(statusCode, message, data);
  }

  static created(message, data = null) {
    return new ApiResponse(201, message, data);
  }

  static error(message, statusCode = 500) {
    return new ApiResponse(statusCode, message);
  }
}

export default ApiResponse;

