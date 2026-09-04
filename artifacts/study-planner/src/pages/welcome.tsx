import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { usePlanner } from '@/hooks/use-study-planner';
import { addDays, isoDate, type Exam, type RestDay, type StudyTime } from '@/lib/study-data';
import { toPlannerSubjects, type SyllabusSubjectDraft } from '@/lib/syllabus';

const days: Array<{ value: RestDay; label: string }> = [
  { value: 'none', label: 'No weekly rest day' }, { value: 'monday', label: 'Monday' }, { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' }, { value: 'thursday', label: 'Thursday' }, { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }, { value: 'sunday', label: 'Sunday' },
];
const studyTimes: Array<{ value: StudyTime; label: string }> = [
  { value: 'morning', label: 'Morning · 6–10 am' }, { value: 'afternoon', label: 'Afternoon · 12–4 pm' },
  { value: 'evening', label: 'Evening · 5–9 pm' }, { value: 'night', label: 'Night · after 9 pm' },
];

function subjectDrafts(weak: string[], strong: string[]): SyllabusSubjectDraft[] {
  const names = Array.from(new Set([...weak, ...strong].map(name => name.trim()).filter(Boolean)));
  const fallback = names.length ? names : ['Anatomy', 'Physiology', 'Pathology'];
  return fallback.map(name => ({ name, chapters: [{ name: 'Core review', topics: [`${name} fundamentals`, `${name} key concepts`] }] }));
}

export function WelcomePage() {
  const [, setLocation] = useLocation();
  const planner = usePlanner();
  const today = isoDate();
  const [studentName, setStudentName] = useState('');
  const [examName, setExamName] = useState('HCS board preparation');
  const [examDate, setExamDate] = useState(addDays(today, 60));
  const [studyStartDate, setStudyStartDate] = useState(today);
  const [dailyHours, setDailyHours] = useState('2');
  const [preferredStudyTime, setPreferredStudyTime] = useState<StudyTime>('evening');
  const [weeklyRestDay, setWeeklyRestDay] = useState<RestDay>('sunday');
  const [weakSubjects, setWeakSubjects] = useState('');
  const [strongSubjects, setStrongSubjects] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const weak = weakSubjects.split(',').map(item => item.trim()).filter(Boolean);
    const strong = strongSubjects.split(',').map(item => item.trim()).filter(Boolean);
    const subjects = toPlannerSubjects(subjectDrafts(weak, strong));
    const exam: Exam = {
      id: `exam-${Date.now()}`, name: examName.trim() || 'HCS board preparation', examDate, studyStartDate,
      hoursPerDay: Number(dailyHours) || 2, preferredStudyTime, weeklyRestDay, weakSubjects: weak, strongSubjects: strong, subjects,
    };
    planner.completeSetup(exam, { ...planner.preferences, name: studentName.trim() || 'Study partner' });
    setLocation('/dashboard');
  };

  return <div className="grain min-h-[100dvh] bg-background">
    <header className="flex items-center justify-between px-5 py-5 sm:px-10">
      <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles size={18} /></span><span className="font-display text-xl">AI Study Planner</span></div>
      <button type="button" onClick={() => setLocation('/dashboard')} className="text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="button-explore-demo">Explore HCS demo <ArrowRight size={14} className="ml-1 inline" /></button>
    </header>
    <main className="mx-auto grid max-w-[1240px] gap-10 px-5 py-8 sm:px-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:py-16">
      <div className="lg:sticky lg:top-12">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Your next clear step</p>
        <h1 className="mt-4 max-w-xl font-display text-5xl leading-[.98] tracking-tight sm:text-6xl">Study with a plan that fits your life.</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">Set the shape of your exam season once. AI Study Planner turns it into focused sessions, gentle review, and a record you can trust—all saved on this device.</p>
        <div className="mt-10 grid max-w-md gap-3 sm:grid-cols-3">
          {[['Today', 'See the next session'], ['My Plan', 'Shape your syllabus'], ['Progress', 'Notice the wins']].map(([label, detail]) => <div key={label} className="rounded-2xl border bg-card p-4"><p className="font-display text-lg">{label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></div>)}
        </div>
      </div>
      <form onSubmit={submit} className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b pb-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/25 text-primary"><BookOpen size={19} /></span><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">First-time setup</p><h2 className="mt-1 font-display text-2xl">Let’s make your starting line.</h2></div></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Student name<input required value={studentName} onChange={event => setStudentName(event.target.value)} placeholder="Maya Chen" className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-student-name" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Exam name<input required value={examName} onChange={event => setExamName(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-exam-name" /></label>
          <label className="text-sm font-semibold">Exam date<input required type="date" min={today} value={examDate} onChange={event => setExamDate(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-exam-date" /></label>
          <label className="text-sm font-semibold">Study start date<input required type="date" value={studyStartDate} onChange={event => setStudyStartDate(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-start-date" /></label>
          <label className="text-sm font-semibold">Daily study hours<input required type="number" min="0.5" max="12" step="0.5" value={dailyHours} onChange={event => setDailyHours(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-daily-hours" /></label>
          <label className="text-sm font-semibold">Preferred study time<select value={preferredStudyTime} onChange={event => setPreferredStudyTime(event.target.value as StudyTime)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="select-setup-study-time">{studyTimes.map(time => <option key={time.value} value={time.value}>{time.label}</option>)}</select></label>
          <label className="text-sm font-semibold">Weekly rest day<select value={weeklyRestDay} onChange={event => setWeeklyRestDay(event.target.value as RestDay)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="select-setup-rest-day">{days.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
          <label className="text-sm font-semibold sm:col-span-2">Weak subjects<span className="mt-1 block text-xs font-normal text-muted-foreground">Separate names with commas.</span><input value={weakSubjects} onChange={event => setWeakSubjects(event.target.value)} placeholder="Pathology, Physiology" className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-weak-subjects" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Strong subjects<span className="mt-1 block text-xs font-normal text-muted-foreground">These topics receive a lighter first pass.</span><input value={strongSubjects} onChange={event => setStrongSubjects(event.target.value)} placeholder="Anatomy, Pharmacology" className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-setup-strong-subjects" /></label>
        </div>
        <div className="mt-7 rounded-2xl bg-secondary/60 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} className="text-primary" />A starter syllabus is created from your subject strengths.</p><p className="mt-1 pl-6 text-xs leading-5 text-muted-foreground">You can add detailed chapters and topics from Subjects after setup.</p></div>
        <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground" data-testid="button-complete-setup">Create my study plan <ArrowRight size={16} /></button>
      </form>
    </main>
    <footer className="flex justify-center gap-4 px-5 pb-8 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CheckCircle2 size={13} />Local-first</span><span className="flex items-center gap-1"><Clock3 size={13} />No paid APIs</span></footer>
  </div>;
}