import { CircleCheck, CircleAlert, X } from 'lucide-react';

export default function FeedbackMessage({ notice, onDismiss }) {
  if (!notice) return null;
  const Icon = notice.kind === 'success' ? CircleCheck : CircleAlert;
  return <div className={`feedback ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
    <Icon size={18} /><span>{notice.message}</span><button className="icon-button" aria-label="Dismiss message" onClick={onDismiss}><X size={16} /></button>
  </div>;
}
