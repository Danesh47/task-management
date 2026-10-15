const { ConnectionError, ConnectionAcquireTimeoutError, ValidationError } = require('sequelize');
const AppError = require('../utils/AppError');

module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let problem = error;
  if (error.type === 'entity.parse.failed') problem = new AppError(400, 'INVALID_JSON', 'The request body must contain valid JSON.');
  else if (error.type === 'entity.too.large') problem = new AppError(413, 'PAYLOAD_TOO_LARGE', 'The request is too large.');
  else if (error instanceof ConnectionError || error instanceof ConnectionAcquireTimeoutError) {
    problem = new AppError(503, 'DATABASE_UNAVAILABLE', 'The database is unavailable. Please try again shortly.');
  } else if (error instanceof ValidationError) {
    const fields = {};
    for (const item of error.errors) (fields[item.path || 'body'] ||= []).push(item.message);
    problem = new AppError(422, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', fields);
  }
  if (!(problem instanceof AppError)) {
    console.error(JSON.stringify({ requestId: req.requestId, category: error.name || 'Error', message: 'Unhandled request failure' }));
    problem = new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  }
  res.status(problem.status).json({ success: false, error: { code: problem.code, message: problem.message, fields: problem.fields } });
};
