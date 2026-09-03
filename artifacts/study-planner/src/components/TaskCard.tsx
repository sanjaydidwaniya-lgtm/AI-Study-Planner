import { Check, Clock3, LockKeyhole, Minus, RotateCcw, X } from 'lucide-react';
import { minutesLabel, type Task, type TaskStatus } from '@/lib/study-data';
type TaskCardProps = { task: Task; locked?: boolean; onStatusChange?: (status: TaskStatus) => void; onReschedule?: () => void; actionLabels?: boolean };
const options: { status: TaskStatus; label: string; icon: typeof Check; className: string }[] = [
  { status: 'completed', label: 'Done', icon: Check, className: 'text-[#397c68] bg-[#397c68]/10' },
  { status: 'partial', label: 'Partial', icon: Minus, className: 'text-[#a9781d] bg-[#d29b39]/15' },
  { status: 'not_completed', label: 'Missed', icon: X, className: 'text-[#b55744] bg-[#c76852]/10' },
];
export function TaskCard({ task, locked = false, onStatusChange, onReschedule, actionLabels = false }: TaskCardProps) {
  const isLocked = locked || task.locked;
  return <article className={`rounded-2xl border bg-card p-4 transition-all ${task.status === 'completed' ? 'border-[#397c68]/30 bg-[#397c68]/[.035]' : ''}`} data-testid={`task-card-${task.id}`}>
    <div className="flex items-start gap-3">
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: task.status === 'completed' ? '#397c68' : task.status === 'partial' ? '#d29b39' : task.status === 'not_completed' ? '#c76852' : '#b8b8ad' }} />
      <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold leading-tight">{task.topicName}</p><p className="mt-1 text-xs text-muted-foreground">{task.subjectName}</p></div><span className="flex shrink-0 items-center gap-1 text-xs font-mono-app text-muted-foreground"><Clock3 size={13} />{minutesLabel(task.plannedMinutes)}</span></div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">{isLocked ? <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground"><LockKeyhole size={12} />Locked</span> : options.map(({ status, label, icon: Icon, className }) => <button key={status} type="button" disabled={!onStatusChange} onClick={() => onStatusChange?.(status)} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-transform hover:scale-[1.03] ${task.status === status ? className : 'bg-secondary text-muted-foreground'}`} data-testid={`button-${status}-${task.id}`}><Icon size={12} />{actionLabels ? (status === 'completed' ? 'YES' : status === 'not_completed' ? 'NO' : 'PARTIAL') : label}</button>)}
      {task.status === 'not_completed' && !isLocked && onReschedule && <><button type="button" onClick={() => onStatusChange?.('not_completed')} className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:underline" data-testid={`button-keep-missed-${task.id}`}>Keep as missed</button><button type="button" onClick={onReschedule} className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline" data-testid={`button-reschedule-${task.id}`}><RotateCcw size={12} />Reschedule</button></>}</div></div>
    </div>
  </article>;
}