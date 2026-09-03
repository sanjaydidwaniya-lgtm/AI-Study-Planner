export type TaskStatus = 'pending' | 'completed' | 'not_completed' | 'partial';

export type Topic = { id: string; name: string; estimatedMinutes: number };
export type Chapter = { id: string; name: string; topics: Topic[] };
export type Subject = { id: string; name: string; color: string; chapters: Chapter[] };
export type Exam = { id: string; name: string; examDate: string; studyStartDate: string; hoursPerDay: number; subjects: Subject[] };
export type Task = {
  id: string; examId: string; date: string; subjectId: string; subjectName: string;
  subjectColor: string; topicId: string; topicName: string; plannedMinutes: number; status: TaskStatus;
  locked: boolean; sourceTaskId?: string; rescheduledFrom?: string;
};
export type DailyCheckIn = { date: string; submittedAt: string; locked: boolean };
export type Preferences = { name: string; email: string; weekStartsOn: 'monday' | 'sunday'; reminderTime: string; compactMode: boolean };
export type PlannerState = { exams: Exam[]; tasks: Task[]; checkIns: DailyCheckIn[]; preferences: Preferences; seeded: boolean };

export const SUBJECT_COLORS = ['#397c68', '#d29b39', '#c76852', '#4d8495', '#8b6aa9', '#7a8c54'];

export function isoDate(date = new Date()) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}
export function addDays(date: string, amount: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return isoDate(d);
}
export function daysBetween(from: string, to: string) {
  return Math.max(0, Math.ceil((new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) / 86400000));
}
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(`${date}T12:00:00`));
}
export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}
export function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h${remainder ? ` ${remainder}m` : ''}` : `${remainder}m`;
}

export function generatePlan(exam: Exam, existingIdPrefix = 'task') {
  const dates = Array.from({ length: Math.max(1, daysBetween(exam.studyStartDate, exam.examDate)) }, (_, index) => addDays(exam.studyStartDate, index));
  const topics = exam.subjects.flatMap(subject => subject.chapters.flatMap(chapter => chapter.topics.map(topic => ({
    subject, chapter, topic,
  }))));
  const dailyCapacity = Math.max(30, exam.hoursPerDay * 60);
  const generated: Task[] = [];
  let dateIndex = 0;
  let remaining = dailyCapacity;
  topics.forEach((item, index) => {
    if (remaining < 25) { dateIndex = Math.min(dateIndex + 1, dates.length - 1); remaining = dailyCapacity; }
    const planned = Math.min(item.topic.estimatedMinutes, remaining);
    generated.push({
      id: `${existingIdPrefix}-${index + 1}`,
      examId: exam.id, date: dates[dateIndex], subjectId: item.subject.id, subjectName: item.subject.name, subjectColor: item.subject.color,
      topicId: item.topic.id, topicName: item.topic.name, plannedMinutes: planned, status: 'pending', locked: false,
    });
    remaining -= planned;
  });
  return generated;
}

function demoSubject(id: string, name: string, color: string, chapters: string[][]): Subject {
  return {
    id, name, color,
    chapters: chapters.map((chapter, chapterIndex) => ({
      id: `${id}-ch-${chapterIndex + 1}`, name: chapter[0],
      topics: chapter.slice(1).map((topic, topicIndex) => ({ id: `${id}-tp-${chapterIndex + 1}-${topicIndex + 1}`, name: topic, estimatedMinutes: 45 + ((topicIndex + chapterIndex) % 3) * 15 })),
    })),
  };
}

export function createDemoState(): PlannerState {
  const today = isoDate();
  const exam: Exam = {
    id: 'exam-psych-101', name: 'Cognitive Psychology · final', examDate: addDays(today, 29),
    studyStartDate: addDays(today, -10), hoursPerDay: 2.5,
    subjects: [
      demoSubject('subject-cog', 'Cognitive psychology', SUBJECT_COLORS[0], [
        ['Memory', 'Working memory', 'Long-term memory', 'Forgetting & interference'],
        ['Attention', 'Selective attention', 'Multitasking', 'Visual search'],
        ['Learning', 'Classical conditioning', 'Operant conditioning', 'Observational learning'],
      ]),
      demoSubject('subject-stats', 'Research methods', SUBJECT_COLORS[3], [
        ['Foundations', 'Variables & measurement', 'Validity & reliability', 'Ethics'],
        ['Analysis', 'Descriptive statistics', 'Correlation', 'Reading results'],
      ]),
      demoSubject('subject-neuro', 'Neuroscience', SUBJECT_COLORS[2], [
        ['The brain', 'Neurons & synapses', 'Cortical maps', 'Neuroplasticity'],
        ['Systems', 'Vision', 'Language', 'Emotion'],
      ]),
    ],
  };
  let allTasks = generatePlan(exam, 'demo-task');
  if (!allTasks.some(task => task.date === today)) {
    const hasFuture = allTasks.some(task => task.date > today);
    const candidates = allTasks.filter(task => hasFuture ? task.date > today : task.date < today);
    const demoTodayIds = new Set(candidates.slice(hasFuture ? 0 : -2).map(task => task.id));
    allTasks = allTasks.map(task => demoTodayIds.has(task.id) ? { ...task, date: today } : task);
  }
  const tasks = allTasks.map((task, index) => {
    if (task.date < today) {
      const mod = index % 7;
      return { ...task, status: mod === 0 ? 'not_completed' : mod === 1 ? 'partial' : 'completed', locked: true } as Task;
    }
    if (task.date === today) return { ...task, status: index % 4 === 0 ? 'completed' : 'pending' } as Task;
    return task;
  });
  const checkIns = Array.from({ length: 5 }, (_, index) => ({ date: addDays(today, -(index + 1)), submittedAt: new Date().toISOString(), locked: true }));
  return { exams: [exam], tasks, checkIns, seeded: true, preferences: { name: 'Maya Chen', email: 'maya.chen@campus.edu', weekStartsOn: 'monday', reminderTime: '18:30', compactMode: false } };
}

export const STORAGE_KEY = 'study-planner-local-v3';