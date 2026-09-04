import { BarChart3, Bell, BookOpen, CalendarDays, ClipboardList, LayoutDashboard, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/today', label: 'Today', icon: ClipboardList },
  { href: '/study-plan', label: 'My Plan', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/subjects', label: 'Subjects', icon: UsersRound },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reminders', label: 'Reminders', icon: Bell },
];

export function Navigation({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [location] = useLocation();
  const items = mobile ? navItems.slice(0, 5) : navItems;
  return <nav className={mobile ? 'flex w-full justify-around' : 'space-y-1'}>
    {items.map(item => {
      const active = location === item.href;
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} onClick={onNavigate} className={mobile
        ? `flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[10px] ${active ? 'text-primary' : 'text-muted-foreground'}`
        : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'}`}
        data-testid={`${mobile ? 'mobile' : 'desktop'}-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>
        <Icon size={mobile ? 17 : 17} strokeWidth={active ? 2.2 : 1.7} /><span>{item.label}</span>
        {!mobile && item.label === 'Today' && <span className="ml-auto rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[10px] font-bold text-sidebar-primary-foreground">2</span>}
      </Link>;
    })}
  </nav>;
}