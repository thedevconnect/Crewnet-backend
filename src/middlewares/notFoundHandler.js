import ApiError from '../utils/ApiError.js';

const notFoundHandler = (req, res, next) => {
  throw new ApiError(404, `Route ${req.originalUrl} not found`);
};

export default notFoundHandler;

