import { Check, LockKeyhole, Minus, Sparkles, X } from 'lucide-react';
import { formatLongDate, type DailyCheckInResult, type Task, type TaskStatus } from '@/lib/study-data';
import { TaskCard } from '@/components/TaskCard';

type DailyCheckInProps = {
  date: string;
  tasks: Task[];
  locked: boolean;
  result?: DailyCheckInResult;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onSubmit: (result: DailyCheckInResult) => void;
  onReschedule: (id: string) => void;
};

const outcomes: Array<{ value: DailyCheckInResult; label: string; icon: typeof Check; className: string }> = [
  { value: 'yes', label: 'YES', icon: Check, className: 'border-[#397c68] bg-[#397c68]/10 text-[#397c68]' },
  { value: 'partial', label: 'PARTIAL', icon: Minus, className: 'border-[#d29b39] bg-[#d29b39]/15 text-[#96701e]' },
  { value: 'no', label: 'NO', icon: X, className: 'border-[#c76852] bg-[#c76852]/10 text-[#b55744]' },
];

export function DailyCheckIn({ date, tasks, locked, result, onStatusChange, onSubmit, onReschedule }: DailyCheckInProps) {
  const completed = tasks.filter(task => task.status === 'completed').length;
  return <section className="rounded-2xl border bg-card p-5 sm:p-7" data-testid="daily-checkin">
    <div className="flex items-start justify-between gap-5">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Daily accountability</p><h2 className="mt-2 font-display text-3xl">Did you complete today&apos;s study goals?</h2><p className="mt-2 text-sm text-muted-foreground">{formatLongDate(date)} · {tasks.length} planned session{tasks.length === 1 ? '' : 's'}</p></div>
      <div className="hidden rounded-2xl bg-accent/20 p-3 text-primary sm:block"><Sparkles size={22} /></div>
    </div>
    {tasks.length ? <div className="mt-7 space-y-3">{tasks.map(task => <TaskCard key={task.id} task={task} locked={locked} actionLabels onStatusChange={status => onStatusChange(task.id, status)} onReschedule={() => onReschedule(task.id)} />)}</div> : <div className="mt-7 rounded-xl bg-secondary/50 p-7 text-center"><p className="font-display text-xl">A blank page can be a beginning.</p><p className="mt-2 text-sm text-muted-foreground">There are no sessions planned for today.</p></div>}
    <div className="mt-7 border-t pt-6">
      {locked ? <div className="rounded-2xl border border-[#397c68]/25 bg-[#397c68]/[.06] p-5" data-testid="day-locked-banner"><p className="flex items-center gap-2 text-sm font-bold tracking-[.12em] text-[#397c68]"><LockKeyhole size={17} />DAY LOCKED</p><p className="mt-2 text-sm text-muted-foreground">Your {result === 'yes' ? 'YES' : result === 'partial' ? 'PARTIAL' : 'NO'} check-in is recorded. Tasks and results can no longer be changed.</p></div> : <><p className="text-sm font-semibold">Close the loop for today</p><p className="mt-1 text-xs text-muted-foreground">Choose one answer after marking each session. This locks the day and saves it locally.</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{outcomes.map(({ value, label, icon: Icon, className }) => <button key={value} type="button" onClick={() => onSubmit(value)} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold tracking-[.1em] transition-transform hover:-translate-y-0.5 ${className}`} data-testid={`button-daily-checkin-${value}`}><Icon size={17} />{label}</button>)}</div></>}
      {locked && <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Check size={13} />{completed} of {tasks.length} tasks marked before lock.</p>}
    </div>
  </section>;
}