type ProgressBarProps = { value: number; color?: string; className?: string; label?: string };
export function ProgressBar({ value, color = 'hsl(var(--primary))', className = '', label }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className={`space-y-1.5 ${className}`} data-testid="progress-bar">
    {label && <div className="flex justify-between text-xs font-mono-app text-muted-foreground"><span>{label}</span><span>{Math.round(safeValue)}%</span></div>}
    <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${safeValue}%`, backgroundColor: color }} /></div>
  </div>;
}