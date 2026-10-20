import { Check, LockKeyhole, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { DailyCheckIn } from '@/components/DailyCheckIn';
import { usePlanner, useTodayTasks, nextAvailableDate } from '@/hooks/use-study-planner';
import { formatDate, isoDate, minutesLabel } from '@/lib/study-data';

export function TodayPage() {
  const planner = usePlanner(); const { tasks, today } = useTodayTasks();
  const locked = planner.isDayLocked(today);
  const checkIn = planner.checkIns.find(item => item.date === today && item.locked);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(nextAvailableDate(planner, addTomorrow(today)));
  const completed = tasks.filter(task => task.status === 'completed').length;
  const missed = tasks.filter(task => task.status === 'not_completed').length;
  const partial = tasks.filter(task => task.status === 'partial').length;
  const plannedMinutes = tasks.reduce((sum, task) => sum + task.plannedMinutes, 0);
  const completedMinutes = tasks.filter(task => task.status === 'completed').reduce((sum, task) => sum + task.plannedMinutes, 0);
  const completion = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const metrics = [
    { label: 'Total tasks', value: String(tasks.length), color: 'text-foreground' },
    { label: 'Completed tasks', value: String(completed), color: 'text-[#397c68]' },
    { label: 'Missed tasks', value: String(missed), color: 'text-[#b55744]' },
    { label: 'Partial tasks', value: String(partial), color: 'text-[#96701e]' },
    { label: 'Planned minutes', value: minutesLabel(plannedMinutes), color: 'text-foreground' },
    { label: 'Completed minutes', value: minutesLabel(completedMinutes), color: 'text-[#397c68]' },
    { label: 'Completion', value: `${completion}%`, color: 'text-primary' },
  ];
  const reschedule = () => {
    if (reschedulingId && newDate > today && !planner.isDayLocked(today) && !planner.isDayLocked(newDate)) {
      planner.rescheduleTask(reschedulingId, newDate);
      setReschedulingId(null);
    }
  };
  return <div className="mx-auto max-w-[1100px] space-y-8">
    <div className="rise-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Today · {formatDate(today, { month: 'short', day: 'numeric' })}</p><h1 className="mt-2 font-display text-4xl">The next right thing.</h1><p className="mt-3 text-sm text-muted-foreground">{locked ? 'Your daily record is locked.' : `A focused list is a kind list. You have ${tasks.length} sessions on deck.`}</p></div>
      {locked && <span className="flex items-center gap-2 self-start rounded-full bg-secondary px-3 py-2 text-xs font-bold tracking-wide text-muted-foreground sm:self-auto"><LockKeyhole size={14} />DAY LOCKED</span>}
    </div>
    <section aria-label="Today's study metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map(metric => <div key={metric.label} className="rounded-2xl border bg-card p-4 sm:p-5"><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-muted-foreground">{metric.label}</p><p className={`mt-2 font-display text-2xl ${metric.color}`} data-testid={`today-metric-${metric.label.toLowerCase().replaceAll(' ', '-')}`}>{metric.value}</p>{metric.label === 'Completion' && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div>}</div>)}
    </section>
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-[#e6efe9] p-5 text-[#19332b]"><p className="text-xs font-semibold uppercase tracking-widest text-[#397c68]">Start here</p><p className="mt-3 font-display text-2xl">25 calm minutes</p><p className="mt-2 text-xs leading-5 text-[#19332b]/65">Put the phone away, open the first topic, and let momentum do the rest.</p></div>
      <div className="rounded-2xl border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Daily intention</p><p className="mt-3 font-display text-2xl">Progress over perfect</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Partial is a real status. It keeps your plan honest.</p></div>
      <div className={`rounded-2xl border p-5 ${locked ? 'bg-secondary/60' : 'bg-[#fbefd3] text-[#19332b]'}`}><p className="text-xs font-semibold uppercase tracking-widest text-[#96701e]">Close the loop</p><p className="mt-3 font-display text-2xl">{locked ? 'Day is wrapped' : 'Check in tonight'}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{locked ? 'Your submitted result and task statuses are safely locked.' : 'Submit your daily answer when your study window is done.'}</p></div>
    </section>
    <DailyCheckIn date={today} tasks={tasks} locked={locked} result={checkIn?.result} onStatusChange={planner.updateTaskStatus} onSubmit={result => planner.submitCheckIn(today, result)} onReschedule={id => {
      if (!planner.isDayLocked(today)) {
        setReschedulingId(id);
        setNewDate(nextAvailableDate(planner, addTomorrow(today)));
      }
    }} />
    {reschedulingId && !locked && <div className="fixed inset-0 z-50 grid place-items-center bg-[#19332b]/35 p-5"><div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl"><div className="flex items-center gap-2 text-primary"><RotateCcw size={18} /><p className="text-xs font-semibold uppercase tracking-[.18em]">Move this session</p></div><h2 className="mt-3 font-display text-3xl">Give it another day.</h2><p className="mt-2 text-sm text-muted-foreground">The original stays in history as missed. Pick a future date for a fresh attempt.</p><label className="mt-6 block text-sm font-semibold">New study date<input type="date" min={addTomorrow(today)} value={newDate} onChange={event => setNewDate(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-reschedule-date" /></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setReschedulingId(null)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-secondary" data-testid="button-cancel-reschedule">Cancel</button><button type="button" disabled={planner.isDayLocked(today) || planner.isDayLocked(newDate)} onClick={reschedule} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-confirm-reschedule"><Check size={15} />Reschedule</button></div></div></div>}
  </div>;
}
function addTomorrow(date: string) { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + 1); return isoDate(next); }