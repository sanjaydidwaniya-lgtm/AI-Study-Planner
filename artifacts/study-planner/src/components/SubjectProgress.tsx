import { ProgressBar } from '@/components/ProgressBar';
type SubjectProgressProps = { name: string; completed: number; total: number; color: string; minutes: number };
export function SubjectProgress({ name, completed, total, color, minutes }: SubjectProgressProps) {
  const value = total ? completed / total * 100 : 0;
  return <div className="space-y-2" data-testid={`subject-progress-${name.replaceAll(' ', '-').toLowerCase()}`}><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{name}</span><span className="font-mono-app text-xs text-muted-foreground">{completed}/{total}</span></div><ProgressBar value={value} color={color} /><p className="text-[11px] text-muted-foreground">{Math.round(minutes / 60 * 10) / 10} hours completed</p></div>;
}