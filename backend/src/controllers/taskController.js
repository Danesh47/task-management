const tasks = require('../services/taskService');

exports.list = async (req, res) => {
  const result = await tasks.list(req.validated.query);
  res.json({ success: true, message: 'Tasks retrieved successfully.', ...result });
};
exports.get = async (req, res) => res.json({ success: true, message: 'Task retrieved successfully.', data: await tasks.get(req.validated.params.id) });
exports.create = async (req, res) => {
  const task = await tasks.create(req.validated.body);
  res.location(`/api/tasks/${task.id}`).status(201).json({ success: true, message: 'Task created successfully.', data: task });
};
exports.update = async (req, res) => res.json({ success: true, message: 'Task updated successfully.', data: await tasks.update(req.validated.params.id, req.validated.body) });
exports.remove = async (req, res) => res.json({ success: true, message: 'Task deleted successfully.', data: await tasks.remove(req.validated.params.id) });
