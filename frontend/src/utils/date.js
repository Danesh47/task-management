export function formatDueDate(value) {
  if (!value) return 'No due date';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
}
export function isOverdue(task) {
  if (!task.due_date || task.status === 'Completed') return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return task.due_date < today;
}
