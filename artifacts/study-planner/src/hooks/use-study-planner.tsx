import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addDays, createDemoState, generatePlan, isoDate, STORAGE_KEY, type DailyCheckInResult, type Exam, type PlannerState, type Preferences, type Reminder, type Task, type TaskStatus } from '@/lib/study-data';

type PlannerContextValue = PlannerState & {
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  submitCheckIn: (date: string, result: DailyCheckInResult) => void;
  rescheduleTask: (id: string, date: string) => void;
  createExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  completeSetup: (exam: Exam, preferences: Preferences) => void;
  updatePreferences: (preferences: Preferences) => void;
  addReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;
  resetDemoData: () => void;
  isDayLocked: (date: string) => boolean;
};
const PlannerContext = createContext<PlannerContextValue | null>(null);

function normalizeState(raw: Partial<PlannerState>): PlannerState {
  const demo = createDemoState();
  const exams = (raw.exams?.length ? raw.exams : demo.exams).map(exam => ({
    ...exam,
    preferredStudyTime: exam.preferredStudyTime ?? 'evening',
    weeklyRestDay: exam.weeklyRestDay ?? 'none',
    weakSubjects: exam.weakSubjects ?? [],
    strongSubjects: exam.strongSubjects ?? [],
  }));
  return {
    ...demo,
    ...raw,
    exams,
    tasks: (raw.tasks ?? demo.tasks).map(task => ({ ...task, chapterName: task.chapterName ?? 'General', type: task.type ?? 'STUDY' })),
    checkIns: (raw.checkIns ?? demo.checkIns).map(checkIn => ({ ...checkIn, result: checkIn.result ?? 'yes' })),
    preferences: { ...demo.preferences, ...(raw.preferences ?? {}) },
    reminders: raw.reminders ?? demo.reminders,
    setupComplete: raw.setupComplete ?? true,
  };
}

function lockedCheckInDate(state: PlannerState, date: string) {
  return state.checkIns.some(checkIn => checkIn.date === date && checkIn.locked);
}

function generateUnlockedTasks(exam: Exam, prefix: string, state: PlannerState) {
  return generatePlan(exam, prefix).filter(task => !lockedCheckInDate(state, task.date));
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeState(JSON.parse(stored) as Partial<PlannerState>) : createDemoState();
    } catch { return createDemoState(); }
  });
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local persistence can be unavailable in private browsing */ } }, [state]);
  const isDayLocked = useCallback((date: string) => lockedCheckInDate(state, date), [state.checkIns]);
  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => setState(current => {
    if (!['pending', 'completed', 'not_completed', 'partial'].includes(status)) return current;
    return {
      ...current,
      tasks: current.tasks.map(task => task.id === id && !task.locked && !lockedCheckInDate(current, task.date) ? { ...task, status } : task),
    };
  }), []);
  const submitCheckIn = useCallback((date: string, result: DailyCheckInResult) => setState(current => {
    if (date !== isoDate() || !['yes', 'partial', 'no'].includes(result) || lockedCheckInDate(current, date)) return current;
    return {
      ...current,
      checkIns: [...current.checkIns.filter(checkIn => checkIn.date !== date), { date, submittedAt: new Date().toISOString(), result, locked: true }],
      tasks: current.tasks.map(task => task.date === date ? { ...task, locked: true } : task),
    };
  }), []);
  const rescheduleTask = useCallback((id: string, date: string) => setState(current => {
    const original = current.tasks.find(task => task.id === id);
    if (!original || original.locked || date <= original.date || lockedCheckInDate(current, original.date) || lockedCheckInDate(current, date)) return current;
    const newTask: Task = { ...original, id: `${original.id}-rescheduled-${Date.now()}`, date, status: 'pending', locked: false, sourceTaskId: original.id, rescheduledFrom: original.date };
    return { ...current, tasks: [...current.tasks.map(task => task.id === id ? { ...task, status: 'not_completed' as TaskStatus, locked: true } : task), newTask] };
  }), []);
  const createExam = useCallback((exam: Exam) => setState(current => ({
    ...current, exams: [...current.exams, exam], tasks: [...current.tasks, ...generateUnlockedTasks(exam, `task-${exam.id}`, current)],
  })), []);
  const updateExam = useCallback((exam: Exam) => setState(current => {
    const retained = current.tasks.filter(task => task.examId !== exam.id || task.locked || lockedCheckInDate(current, task.date))
      .map(task => lockedCheckInDate(current, task.date) ? { ...task, locked: true } : task);
    return {
      ...current,
      exams: current.exams.map(item => item.id === exam.id ? exam : item),
      tasks: [...retained, ...generateUnlockedTasks(exam, `task-${exam.id}`, current)],
    };
  }), []);
  const completeSetup = useCallback((exam: Exam, preferences: Preferences) => setState(current => {
    const lockedDates = new Set(current.checkIns.filter(checkIn => checkIn.locked).map(checkIn => checkIn.date));
    const retained = current.tasks.filter(task => task.locked || lockedDates.has(task.date))
      .map(task => lockedDates.has(task.date) ? { ...task, locked: true } : task);
    return {
      ...current,
      exams: [exam],
      tasks: [...retained, ...generateUnlockedTasks(exam, `task-${exam.id}`, current)],
      preferences,
      seeded: false,
      setupComplete: true,
    };
  }), []);
  const updatePreferences = useCallback((preferences: Preferences) => setState(current => ({ ...current, preferences })), []);
  const addReminder = useCallback((reminder: Reminder) => setState(current => ({ ...current, reminders: [...current.reminders, reminder] })), []);
  const toggleReminder = useCallback((id: string) => setState(current => ({ ...current, reminders: current.reminders.map(reminder => reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder) })), []);
  const removeReminder = useCallback((id: string) => setState(current => ({ ...current, reminders: current.reminders.filter(reminder => reminder.id !== id) })), []);
  const resetDemoData = useCallback(() => setState(current => {
    const demo = createDemoState();
    const lockedDates = new Set(current.checkIns.filter(checkIn => checkIn.locked).map(checkIn => checkIn.date));
    const preservedTasks = current.tasks.filter(task => task.locked || lockedDates.has(task.date))
      .map(task => lockedDates.has(task.date) ? { ...task, locked: true } : task);
    return {
      ...demo,
      tasks: [...demo.tasks.filter(task => !lockedDates.has(task.date)), ...preservedTasks],
      checkIns: [...demo.checkIns.filter(checkIn => !lockedDates.has(checkIn.date)), ...current.checkIns.filter(checkIn => checkIn.locked)],
    };
  }), []);
  const value = useMemo(() => ({ ...state, updateTaskStatus, submitCheckIn, rescheduleTask, createExam, updateExam, completeSetup, updatePreferences, addReminder, toggleReminder, removeReminder, resetDemoData, isDayLocked }), [state, updateTaskStatus, submitCheckIn, rescheduleTask, createExam, updateExam, completeSetup, updatePreferences, addReminder, toggleReminder, removeReminder, resetDemoData, isDayLocked]);
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