import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addDays, createDemoState, generatePlan, isoDate, STORAGE_KEY, type DailyCheckIn, type Exam, type PlannerState, type Preferences, type Task, type TaskStatus } from '@/lib/study-data';

type PlannerContextValue = PlannerState & {
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  submitCheckIn: (date: string) => void;
  rescheduleTask: (id: string, date: string) => void;
  createExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  updatePreferences: (preferences: Preferences) => void;
  resetDemoData: () => void;
  isDayLocked: (date: string) => boolean;
};
const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) as PlannerState : createDemoState();
    } catch { return createDemoState(); }
  });
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local persistence can be unavailable in private browsing */ } }, [state]);
  const isDayLocked = useCallback((date: string) => state.checkIns.some(checkIn => checkIn.date === date && checkIn.locked), [state.checkIns]);
  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => setState(current => ({
    ...current, tasks: current.tasks.map(task => task.id === id && !task.locked && !current.checkIns.some(c => c.date === task.date && c.locked) ? { ...task, status } : task),
  })), []);
  const submitCheckIn = useCallback((date: string) => setState(current => ({
    ...current,
    checkIns: current.checkIns.some(checkIn => checkIn.date === date) ? current.checkIns : [...current.checkIns, { date, submittedAt: new Date().toISOString(), locked: true } as DailyCheckIn],
    tasks: current.tasks.map(task => task.date === date ? { ...task, locked: true } : task),
  })), []);
  const rescheduleTask = useCallback((id: string, date: string) => setState(current => {
    const original = current.tasks.find(task => task.id === id);
    if (!original) return current;
    const newTask: Task = { ...original, id: `${original.id}-rescheduled-${Date.now()}`, date, status: 'pending', locked: false, sourceTaskId: original.id, rescheduledFrom: original.date };
    return { ...current, tasks: [...current.tasks.map(task => task.id === id ? { ...task, status: 'not_completed' as TaskStatus, locked: true } : task), newTask] };
  }), []);
  const createExam = useCallback((exam: Exam) => setState(current => ({ ...current, exams: [...current.exams, exam], tasks: [...current.tasks, ...generatePlan(exam, `task-${exam.id}`)] })), []);
  const updateExam = useCallback((exam: Exam) => setState(current => ({ ...current, exams: current.exams.map(item => item.id === exam.id ? exam : item), tasks: [...current.tasks.filter(task => task.examId !== exam.id || task.locked), ...generatePlan(exam, `task-${exam.id}`)] })), []);
  const updatePreferences = useCallback((preferences: Preferences) => setState(current => ({ ...current, preferences })), []);
  const resetDemoData = useCallback(() => setState(createDemoState()), []);
  const value = useMemo(() => ({ ...state, updateTaskStatus, submitCheckIn, rescheduleTask, createExam, updateExam, updatePreferences, resetDemoData, isDayLocked }), [state, updateTaskStatus, submitCheckIn, rescheduleTask, createExam, updateExam, updatePreferences, resetDemoData, isDayLocked]);
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
}
export function useTodayTasks() {
  const planner = usePlanner();
  const today = isoDate();
  return { ...planner, today, tasks: planner.tasks.filter(task => task.date === today) };
}
export function nextAvailableDate(planner: PlannerState, from: string) {
  const used = planner.tasks.filter(task => task.date >= from && task.status === 'pending').map(task => task.date);
  return addDays(used.sort().at(-1) ?? from, 1);
}