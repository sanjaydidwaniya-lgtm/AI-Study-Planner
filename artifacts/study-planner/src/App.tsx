import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { PlannerProvider, usePlanner } from '@/hooks/use-study-planner';
import { AppShell } from '@/components/AppShell';
import { AuthPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { TodayPage } from '@/pages/today';
import { StudyPlanPage } from '@/pages/study-plan';
import { CalendarPage } from '@/pages/calendar';
import { AnalyticsPage } from '@/pages/analytics';
import { SettingsPage } from '@/pages/settings';
import { WelcomePage } from '@/pages/welcome';
import { SubjectsPage } from '@/pages/subjects';
import { RemindersPage } from '@/pages/reminders';

const queryClient = new QueryClient();
function Home() { const { setupComplete } = usePlanner(); return setupComplete ? <AppShell><DashboardPage /></AppShell> : <WelcomePage />; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/welcome" component={WelcomePage} /><Route path="/login"><AuthPage mode="login" /></Route><Route path="/register"><AuthPage mode="register" /></Route><Route path="/dashboard"><AppShell><DashboardPage /></AppShell></Route><Route path="/today"><AppShell><TodayPage /></AppShell></Route><Route path="/study-plan"><AppShell><StudyPlanPage /></AppShell></Route><Route path="/calendar"><AppShell><CalendarPage /></AppShell></Route><Route path="/subjects"><AppShell><SubjectsPage /></AppShell></Route><Route path="/analytics"><AppShell><AnalyticsPage /></AppShell></Route><Route path="/reminders"><AppShell><RemindersPage /></AppShell></Route><Route path="/settings"><AppShell><SettingsPage /></AppShell></Route><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><PlannerProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></PlannerProvider><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;