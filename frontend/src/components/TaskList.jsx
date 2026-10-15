import { CalendarDays, Pencil, Trash2, Circle, CircleDashed, CircleCheck, ArrowUpRight, ListTodo } from 'lucide-react';
import { STATUSES, statusClass } from '../constants/taskStatus';
import { formatDueDate, isOverdue } from '../utils/date';

function StatusControl({ task, disabled, onChange, saving }) {
  const Icon = task.status === 'Completed' ? CircleCheck : task.status === 'In Progress' ? CircleDashed : Circle;
  return <div className={`status-control ${statusClass(task.status)}`}>
    <Icon size={13} aria-hidden="true" />
    <select value={task.status} disabled={disabled} aria-label={`Status of ${task.title}`} onChange={event => onChange(task, event.target.value)}>
      {STATUSES.map(status => <option key={status}>{status}</option>)}
    </select>
    {saving && <span className="sr-only">Updating status</span>}
  </div>;
}
function Actions({ task, disabled, onEdit, onDelete }) {
  return <div className="row-actions">
    <button className="icon-button" onClick={() => onEdit(task)} disabled={disabled} aria-label={`Edit ${task.title}`} title="Edit task"><Pencil size={16} /></button>
    <button className="icon-button danger-hover" onClick={() => onDelete(task)} disabled={disabled} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 size={16} /></button>
  </div>;
}
export function LoadingTasks() {
  return <div className="list-skeleton" role="status" aria-label="Loading tasks" aria-busy="true">
    {[1, 2, 3, 4].map(item => <div className="skeleton-row" key={item}><span /><span /><span /></div>)}
    <span className="sr-only">Loading tasks…</span>
  </div>;
}
export function EmptyTasks({ filter, onAdd, onShowAll, disabled }) {
  const all = filter === 'All';
  return <div className="empty-state">
    <div className="empty-symbol"><ListTodo size={30} strokeWidth={1.4} /></div>
    <h2>{all ? 'A clear space. A fresh start.' : `No ${filter.toLowerCase()} tasks.`}</h2>
    <p>{all ? 'Turn what’s on your mind into a plan. Add your first task and take it from there.' : 'Tasks with this status will appear here. Keep going, or take a look at all your tasks.'}</p>
    <button className="button primary" disabled={disabled} onClick={all ? onAdd : onShowAll}>{all ? 'Create your first task' : 'View all tasks'}<ArrowUpRight size={17} /></button>
  </div>;
}
export default function TaskList({ tasks, disabled, busy, onEdit, onDelete, onStatusChange }) {
  const statusProps = task => ({ task, disabled, onChange: onStatusChange, saving: busy?.kind === 'status' && busy.id === task.id });
  const actionProps = task => ({ task, disabled, onEdit, onDelete });
  return <>
    <table className="task-table"><caption className="sr-only">Task list with status, due date and actions</caption>
      <thead><tr><th scope="col">Task</th><th scope="col">Status</th><th scope="col">Due date</th><th scope="col" className="actions-heading">Actions</th></tr></thead>
      <tbody>{tasks.map(task => <tr key={task.id} className={task.status === 'Completed' ? 'done-row' : ''}>
        <td><div className="task-title"><span className={`task-indicator ${statusClass(task.status)}`}>{task.status === 'Completed' && <CircleCheck size={16} />}</span><div><strong>{task.title}</strong><p className="description-preview">{task.description || 'No description added'}</p></div></div></td>
        <td><StatusControl {...statusProps(task)} /></td>
        <td><span className={`due-date ${isOverdue(task) ? 'overdue' : ''}`}><CalendarDays size={14} />{formatDueDate(task.due_date)}{isOverdue(task) && <span className="sr-only"> — overdue</span>}</span></td>
        <td><Actions {...actionProps(task)} /></td>
      </tr>)}</tbody>
    </table>
    <div className="mobile-tasks">{tasks.map(task => <article className="task-card" key={task.id}>
      <div className="mobile-task-heading"><h2>{task.title}</h2><Actions {...actionProps(task)} /></div>
      <p className="mobile-description">{task.description || 'No description added'}</p>
      <div className="mobile-task-meta"><div><span className="mobile-label">Status</span><StatusControl {...statusProps(task)} /></div><div><span className="mobile-label">Due date</span><span className={`due-date ${isOverdue(task) ? 'overdue' : ''}`}>{formatDueDate(task.due_date)}{isOverdue(task) && <span className="sr-only"> — overdue</span>}</span></div></div>
    </article>)}</div>
  </>;
}
