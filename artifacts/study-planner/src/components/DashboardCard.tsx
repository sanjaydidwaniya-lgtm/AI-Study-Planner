import type { ReactNode } from 'react';
type DashboardCardProps = { label: string; value: string; detail?: string; icon: ReactNode; accent?: string };
export function DashboardCard({ label, value, detail, icon, accent = 'hsl(var(--primary))' }: DashboardCardProps) {
  return <article className="hover-lift rounded-2xl border bg-card p-5" style={{ borderColor: `${accent}33` }} data-testid={`card-${label.toLowerCase().replaceAll(' ', '-')}`}>
    <div className="mb-5 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{label}</span><span className="rounded-xl p-2" style={{ color: accent, backgroundColor: `${accent}16` }}>{icon}</span></div>
    <div className="font-display text-3xl font-semibold tracking-tight">{value}</div>
    {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
  </article>;
}