import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/Calendar';
import { TaskCard } from '@/components/TaskCard';
import { usePlanner } from '@/hooks/use-study-planner';
import { formatLongDate, isoDate } from '@/lib/study-data';

export function CalendarPage() {
  const { tasks } = usePlanner(); const [selected, setSelected] = useState(isoDate()); const dayTasks = tasks.filter(task => task.date === selected);
  return <div className="space-y-8"><div className="rise-in flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Rhythm</p><h1 className="mt-2 font-display text-4xl">Study calendar</h1><p className="mt-3 text-sm text-muted-foreground">See the shape of your effort, day by day.</p></div><CalendarIcon className="hidden text-primary sm:block" size={28} strokeWidth={1.5} /></div><div className="grid gap-6 xl:grid-cols-[1fr_340px]"><Calendar tasks={tasks} onSelectDate={setSelected} /><aside className="rounded-2xl border bg-card p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">Selected day</p><h2 className="mt-1 font-display text-2xl">{formatLongDate(selected)}</h2></div><ChevronRight className="text-muted-foreground" size={17} /></div><div className="mt-5 space-y-3">{dayTasks.map(task => <TaskCard key={task.id} task={task} locked={task.locked} />)}{!dayTasks.length && <div className="rounded-xl bg-secondary/50 p-5 text-center text-sm text-muted-foreground">No sessions planned here yet.</div>}</div></aside></div></div>;
}