module.exports = function serializeTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    due_date: task.due_date,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
  };
};
