import { ApiError, request } from './client';
import { STATUSES } from '../constants/taskStatus';

function task(value) {
  if (!value || !Number.isInteger(value.id) || typeof value.title !== 'string' || !STATUSES.includes(value.status)
    || !(value.description === null || typeof value.description === 'string')
    || !(value.due_date === null || /^\d{4}-\d{2}-\d{2}$/.test(value.due_date))
    || typeof value.created_at !== 'string' || typeof value.updated_at !== 'string') {
    throw new ApiError('The service returned incomplete task data. Refresh tasks.');
  }
  return value;
}
export const tasksApi = {
  async list(signal) {
    const response = await request('/tasks', { signal });
    if (!Array.isArray(response.data)) throw new ApiError('The task list response was invalid.');
    return response.data.map(task);
  },
  async get(id, signal) { return task((await request(`/tasks/${id}`, { signal })).data); },
  async create(body) { return task((await request('/tasks', { method: 'POST', body })).data); },
  async update(id, body) { return task((await request(`/tasks/${id}`, { method: 'PUT', body })).data); },
  async remove(id) {
    const data = (await request(`/tasks/${id}`, { method: 'DELETE' })).data;
    if (data?.id !== id) throw new ApiError('Deletion could not be confirmed. Refresh tasks before trying again.', { unknownOutcome: true });
    return data;
  },
};
export const editableTask = task => ({ title: task.title, description: task.description, status: task.status, due_date: task.due_date });
