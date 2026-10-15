const sequelize = require('../config/database');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const serialize = require('../utils/serializeTask');
const notFound = () => new AppError(404, 'TASK_NOT_FOUND', 'This task no longer exists. Refresh your task list.');

exports.list = async query => {
  const where = query.status ? { status: query.status } : {};
  const paginated = query.page !== undefined || query.pageSize !== undefined;
  const page = paginated ? query.page || 1 : null;
  const pageSize = paginated ? query.pageSize || 20 : null;
  const options = { where, order: [['id', 'DESC']] };
  if (paginated) Object.assign(options, { limit: pageSize, offset: (page - 1) * pageSize });
  const { count, rows } = await Task.findAndCountAll(options);
  return { data: rows.map(serialize), meta: { total: count, page, pageSize, totalPages: paginated ? Math.ceil(count / pageSize) : null } };
};
exports.get = async id => {
  const task = await Task.findByPk(id);
  if (!task) throw notFound();
  return serialize(task);
};
exports.create = async input => serialize(await Task.create(input, { fields: ['title', 'description', 'status', 'due_date'] }));
exports.update = async (id, input) => sequelize.transaction(async transaction => {
  const task = await Task.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
  if (!task) throw notFound();
  await task.update(input, { transaction, fields: ['title', 'description', 'status', 'due_date'] });
  return serialize(task);
});
exports.remove = async id => {
  const count = await Task.destroy({ where: { id } });
  if (!count) throw notFound();
  return { id };
};
