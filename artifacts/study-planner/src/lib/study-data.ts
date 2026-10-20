export type TaskStatus = 'pending' | 'completed' | 'not_completed' | 'partial';
export type DailyCheckInResult = 'yes' | 'partial' | 'no';
export type TaskType = 'STUDY' | 'REVISION' | 'PYQ' | 'MOCK TEST';
export type StudyTime = 'morning' | 'afternoon' | 'evening' | 'night';
export type RestDay = 'none' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type Topic = { id: string; name: string; estimatedMinutes: number };
export type Chapter = { id: string; name: string; topics: Topic[] };
export type Subject = { id: string; name: string; color: string; chapters: Chapter[] };
export type Exam = {
  id: string; name: string; examDate: string; studyStartDate: string; hoursPerDay: number;
  preferredStudyTime: StudyTime; weeklyRestDay: RestDay; weakSubjects: string[]; strongSubjects: string[];
  subjects: Subject[];
};
export type Task = {
  id: string; examId: string; date: string; subjectId: string; subjectName: string; chapterName: string;
  subjectColor: string; topicId: string; topicName: string; type: TaskType; plannedMinutes: number; status: TaskStatus;
  locked: boolean; sourceTaskId?: string; rescheduledFrom?: string;
};
export type DailyCheckIn = { date: string; submittedAt: string; result: DailyCheckInResult; locked: boolean };
export type Reminder = { id: string; title: string; time: string; days: RestDay[]; enabled: boolean };
export type Preferences = { name: string; email: string; weekStartsOn: 'monday' | 'sunday'; reminderTime: string; compactMode: boolean };
export type PlannerState = { exams: Exam[]; tasks: Task[]; checkIns: DailyCheckIn[]; preferences: Preferences; reminders: Reminder[]; seeded: boolean; setupComplete: boolean };

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

function dayName(date: string): RestDay {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date(`${date}T12:00:00`))
    .toLowerCase() as RestDay;
}

export function generatePlan(exam: Exam, existingIdPrefix = 'task') {
  const dates = Array.from({ length: Math.max(1, daysBetween(exam.studyStartDate, exam.examDate)) }, (_, index) => addDays(exam.studyStartDate, index));
  const activeDates = exam.weeklyRestDay === 'none' ? dates : dates.filter(date => dayName(date) !== exam.weeklyRestDay);
  const usableDates = activeDates.length ? activeDates : dates;
  const topics = exam.subjects.flatMap(subject => subject.chapters.flatMap(chapter => chapter.topics.map(topic => ({ subject, chapter, topic }))));
  const dailyCapacity = Math.max(30, exam.hoursPerDay * 60);
  const reservedDates = usableDates.length >= 5 ? usableDates.filter((_, index) => index > 0 && (index + 1) % 6 === 0) : [];
  const mockDate = usableDates.length >= 8 ? usableDates[usableDates.length - 1] : null;
  const studyDates = usableDates.filter(date => !reservedDates.includes(date) && date !== mockDate);
  const allocationDates = studyDates.length ? studyDates : usableDates;
  const generated: Task[] = [];
  let dateIndex = 0;
  let remaining = dailyCapacity;

  topics.forEach((item, index) => {
    const weak = exam.weakSubjects.some(subject => subject.trim().toLowerCase() === item.subject.name.trim().toLowerCase());
    const strong = exam.strongSubjects.some(subject => subject.trim().toLowerCase() === item.subject.name.trim().toLowerCase());
    const weightedMinutes = Math.round(item.topic.estimatedMinutes * (weak ? 1.35 : strong ? 0.8 : 1));
    if (remaining < 25 || (weightedMinutes > remaining && remaining < 40 && dateIndex < allocationDates.length - 1)) {
      dateIndex = Math.min(dateIndex + 1, allocationDates.length - 1);
      remaining = dailyCapacity;
    }
    const planned = Math.max(25, Math.min(weightedMinutes, remaining));
    generated.push({
      id: `${existingIdPrefix}-study-${index + 1}`,
      examId: exam.id, date: allocationDates[dateIndex], subjectId: item.subject.id, subjectName: item.subject.name,
      chapterName: item.chapter.name, subjectColor: item.subject.color, topicId: item.topic.id, topicName: item.topic.name,
      type: 'STUDY', plannedMinutes: planned, status: 'pending', locked: false,
    });
    remaining -= planned;
  });

  reservedDates.forEach((date, index) => {
    const subject = exam.subjects[index % Math.max(1, exam.subjects.length)];
    const chapter = subject?.chapters[0];
    const topic = chapter?.topics[0];
    if (!subject || !chapter || !topic) return;
    generated.push({
      id: `${existingIdPrefix}-review-${index + 1}`, examId: exam.id, date, subjectId: subject.id, subjectName: subject.name,
      chapterName: chapter.name, subjectColor: subject.color, topicId: topic.id, topicName: `${subject.name} cumulative review`,
      type: index % 2 === 0 ? 'REVISION' : 'PYQ', plannedMinutes: Math.min(60, dailyCapacity), status: 'pending', locked: false,
    });
  });

  if (mockDate && exam.subjects.length) {
    const subject = exam.subjects[0];
    const chapter = subject.chapters[0];
    const topic = chapter?.topics[0];
    if (chapter && topic) generated.push({
      id: `${existingIdPrefix}-mock-1`, examId: exam.id, date: mockDate, subjectId: subject.id, subjectName: subject.name,
      chapterName: chapter.name, subjectColor: subject.color, topicId: topic.id, topicName: `${exam.name} mock test`,
      type: 'MOCK TEST', plannedMinutes: Math.min(90, dailyCapacity), status: 'pending', locked: false,
    });
  }
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
    studyStartDate: addDays(today, -10), hoursPerDay: 2.5, preferredStudyTime: 'evening', weeklyRestDay: 'sunday',
    weakSubjects: ['Neuroscience'], strongSubjects: ['Cognitive psychology'],
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
  const checkIns: DailyCheckIn[] = Array.from({ length: 5 }, (_, index) => ({
    date: addDays(today, -(index + 1)),
    submittedAt: new Date().toISOString(),
    result: index === 1 ? 'partial' : index === 3 ? 'no' : 'yes',
    locked: true,
  }));
  return {
    exams: [exam],
    tasks,
    checkIns,
    seeded: true,
    setupComplete: false,
    reminders: [
      { id: 'reminder-1', title: 'Evening focus block', time: '18:30', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], enabled: true },
      { id: 'reminder-2', title: 'Weekly review', time: '10:00', days: ['saturday'], enabled: true },
    ],
    preferences: { name: 'Maya Chen', email: 'maya.chen@campus.edu', weekStartsOn: 'monday', reminderTime: '18:30', compactMode: false },
  };
}

export const STORAGE_KEY = 'study-planner-local-v3';