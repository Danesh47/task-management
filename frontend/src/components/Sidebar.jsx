import { Check, LayoutList, Circle, CircleDashed, CircleCheck, ArrowUpRight } from 'lucide-react';

const filters = [
  { label: 'All tasks', value: 'All', Icon: LayoutList },
  { label: 'Pending', value: 'Pending', Icon: Circle },
  { label: 'In Progress', value: 'In Progress', Icon: CircleDashed },
  { label: 'Completed', value: 'Completed', Icon: CircleCheck },
];
export default function Sidebar({ filter, setFilter, tasks, disabled }) {
  const done = tasks.filter(task => task.status === 'Completed').length;
  const percentage = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  return <aside className="sidebar">
    <a className="brand" href="#main" aria-label="Taskline home"><span className="brand-mark"><Check size={23} strokeWidth={2.7} /></span>taskline<span className="brand-period">.</span></a>
    <nav aria-label="Task status filters" className="side-nav">
      {filters.map(({ label, value, Icon }) => <button key={value} className={`nav-item ${filter === value ? 'active' : ''}`} aria-pressed={filter === value} disabled={disabled} onClick={() => setFilter(value)}>
        <Icon size={18} /><span>{label}</span><span className="nav-count">{value === 'All' ? tasks.length : tasks.filter(task => task.status === value).length}</span>
      </button>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="completion-copy"><span>Making progress</span><ArrowUpRight size={16} /></div>
      <strong>{done}<span> / {tasks.length} completed</span></strong>
      <progress value={percentage} max="100" aria-label={`${percentage}% of tasks completed`} />
      <p>One task at a time.</p>
    </div>
    <div className="rail-footer"><span className="rail-dot" />A clearer way to work.</div>
  </aside>;
}
