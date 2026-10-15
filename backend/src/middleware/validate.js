const AppError = require('../utils/AppError');
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || source;
      (fields[key] ||= []).push(issue.message);
    }
    if (source === 'params') return next(new AppError(400, 'INVALID_TASK_ID', 'Enter a valid task ID.', fields));
    return next(new AppError(422, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', fields));
  }
  req.validated ||= {};
  req.validated[source] = result.data;
  next();
};
