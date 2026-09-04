import { BookOpen, Edit3, Plus, Save, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { TaskTable } from '@/components/TaskTable';
import { usePlanner } from '@/hooks/use-study-planner';
import { formatDate, isoDate, type Exam, type RestDay, type TaskStatus } from '@/lib/study-data';
import { formatSyllabusText, parseSyllabusText, toPlannerSubjects } from '@/lib/syllabus';
const restDays: Array<{ value: RestDay; label: string }> = [{ value: 'none', label: 'No rest day' }, { value: 'monday', label: 'Monday' }, { value: 'tuesday', label: 'Tuesday' }, { value: 'wednesday', label: 'Wednesday' }, { value: 'thursday', label: 'Thursday' }, { value: 'friday', label: 'Friday' }, { value: 'saturday', label: 'Saturday' }, { value: 'sunday', label: 'Sunday' }];
export function StudyPlanPage() {
  const planner = usePlanner(); const currentExam = planner.exams[0];
  const [showEditor, setShowEditor] = useState(false); const [editing, setEditing] = useState(false); const [subjectFilter, setSubjectFilter] = useState('all'); const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [name, setName] = useState(currentExam?.name ?? ''); const [examDate, setExamDate] = useState(currentExam?.examDate ?? isoDate()); const [studyStartDate, setStudyStartDate] = useState(currentExam?.studyStartDate ?? isoDate()); const [hours, setHours] = useState(String(currentExam?.hoursPerDay ?? 2)); const [weeklyRestDay, setWeeklyRestDay] = useState<RestDay>(currentExam?.weeklyRestDay ?? 'sunday'); const [weakSubjects, setWeakSubjects] = useState(currentExam?.weakSubjects.join(', ') ?? ''); const [strongSubjects, setStrongSubjects] = useState(currentExam?.strongSubjects.join(', ') ?? ''); const [syllabus, setSyllabus] = useState(currentExam ? formatSyllabusText(currentExam.subjects) : '');
  const openCreate = () => { setEditing(false); setName(''); setExamDate(isoDate()); setStudyStartDate(isoDate()); setHours('2'); setWeeklyRestDay('sunday'); setWeakSubjects(''); setStrongSubjects(''); setSyllabus('Cognitive psychology | Memory: Working memory, Long-term memory\nResearch methods | Foundations: Variables & measurement, Descriptive statistics'); setShowEditor(true); };
  const openEdit = () => { if (!currentExam) return; setEditing(true); setName(currentExam.name); setExamDate(currentExam.examDate); setStudyStartDate(currentExam.studyStartDate); setHours(String(currentExam.hoursPerDay)); setWeeklyRestDay(currentExam.weeklyRestDay); setWeakSubjects(currentExam.weakSubjects.join(', ')); setStrongSubjects(currentExam.strongSubjects.join(', ')); setSyllabus(formatSyllabusText(currentExam.subjects)); setShowEditor(true); };
  const save = (event: FormEvent) => { event.preventDefault(); const subjects = toPlannerSubjects(parseSyllabusText(syllabus)); const exam: Exam = { id: editing && currentExam ? currentExam.id : `exam-${Date.now()}`, name: name.trim() || 'Untitled exam', examDate, studyStartDate, hoursPerDay: Number(hours) || 1, preferredStudyTime: currentExam?.preferredStudyTime ?? 'evening', weeklyRestDay, weakSubjects: weakSubjects.split(',').map(item => item.trim()).filter(Boolean), strongSubjects: strongSubjects.split(',').map(item => item.trim()).filter(Boolean), subjects }; if (editing) planner.updateExam(exam); else planner.createExam(exam); setShowEditor(false); };
  const filtered = useMemo(() => planner.tasks.filter(task => (subjectFilter === 'all' || task.subjectId === subjectFilter) && (statusFilter === 'all' || task.status === statusFilter)).sort((a, b) => a.date.localeCompare(b.date)), [planner.tasks, statusFilter, subjectFilter]);
  const totalHours = planner.tasks.reduce((sum, task) => sum + task.plannedMinutes, 0) / 60;
  return (
    <div className="space-y-8">
      <div className="rise-in flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">The map</p>
          <h1 className="mt-2 font-display text-4xl">My Plan</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A generated runway from today to exam day. Adjust the syllabus whenever your understanding changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/subjects" className="flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 text-sm font-semibold hover:bg-secondary" data-testid="link-add-syllabus">
            <Plus size={15} />Add syllabus
          </Link>
          <button type="button" onClick={openEdit} className="flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 text-sm font-semibold hover:bg-secondary" data-testid="button-edit-syllabus">
            <Edit3 size={15} />Edit syllabus
          </button>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="button-create-exam">
            <Plus size={16} />New exam
          </button>
        </div>
      </div>

      {currentExam && (
        <section className="rise-in delay-1 flex flex-col justify-between gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/25 text-primary"><BookOpen size={22} /></div>
            <div>
              <p className="font-display text-2xl">{currentExam.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Study window {formatDate(currentExam.studyStartDate)} — {formatDate(currentExam.examDate)} · {currentExam.hoursPerDay}h/day</p>
            </div>
          </div>
          <div className="flex gap-5 text-right">
            <div><p className="font-display text-2xl">{planner.tasks.length}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">sessions</p></div>
            <div><p className="font-display text-2xl">{totalHours.toFixed(1)}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">hours</p></div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">Generated sessions</p>
            <h2 className="mt-1 font-display text-2xl">Every block has a place.</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={15} className="mr-1 text-muted-foreground" />
            <select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)} className="rounded-lg border bg-background px-2.5 py-2 text-xs" data-testid="select-subject-filter">
              <option value="all">All subjects</option>
              {currentExam?.subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-lg border bg-background px-2.5 py-2 text-xs" data-testid="select-status-filter">
              <option value="all">All statuses</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="not_completed">Not completed</option><option value="partial">Partial</option>
            </select>
          </div>
        </div>
        <TaskTable tasks={filtered} onStatusChange={(id, status) => planner.updateTaskStatus(id, status)} />
      </section>

      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#19332b]/35 p-5">
          <div className="mx-auto my-8 w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-primary"><Sparkles size={14} />{editing ? 'Shape the plan' : 'New study plan'}</p>
                <h2 className="mt-2 font-display text-3xl">{editing ? 'Edit your syllabus.' : 'Give the exam a shape.'}</h2>
                <p className="mt-2 text-sm text-muted-foreground">Topics are distributed across study days, up to your daily capacity.</p>
              </div>
              <button type="button" onClick={() => setShowEditor(false)} className="rounded-lg p-2 hover:bg-secondary" data-testid="button-close-exam-editor"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold">Exam name<input required value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-exam-name" /></label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-sm font-semibold">Exam date<input required type="date" value={examDate} onChange={event => setExamDate(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-exam-date" /></label>
                <label className="block text-sm font-semibold">Start date<input required type="date" value={studyStartDate} onChange={event => setStudyStartDate(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-study-start-date" /></label>
                <label className="block text-sm font-semibold">Hours / day<input required type="number" min="0.5" max="12" step="0.5" value={hours} onChange={event => setHours(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="input-hours-per-day" /></label>
                <label className="block text-sm font-semibold">Rest day<select value={weeklyRestDay} onChange={event => setWeeklyRestDay(event.target.value as RestDay)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" data-testid="select-rest-day">{restDays.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold">Weak subjects<span className="mt-1 block text-xs font-normal text-muted-foreground">Comma-separated; these get extra time.</span><input value={weakSubjects} onChange={event => setWeakSubjects(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" placeholder="Pathology, Physiology" data-testid="input-weak-subjects" /></label>
                <label className="block text-sm font-semibold">Strong subjects<span className="mt-1 block text-xs font-normal text-muted-foreground">Comma-separated; these get a lighter pass.</span><input value={strongSubjects} onChange={event => setStrongSubjects(event.target.value)} className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm" placeholder="Anatomy, Pharmacology" data-testid="input-strong-subjects" /></label>
              </div>
              <label className="block text-sm font-semibold">
                Subjects, chapters, and topics
                <p className="mt-1 text-xs font-normal text-muted-foreground">One chapter per line: <span className="font-mono-app">Subject | Chapter: Topic 1, Topic 2</span></p>
                <textarea required rows={7} value={syllabus} onChange={event => setSyllabus(event.target.value)} className="mt-2 w-full resize-y rounded-xl border bg-background px-3 py-2.5 text-sm leading-6" placeholder={'Cognitive psychology | Memory: Working memory, Long-term memory\nResearch methods | Foundations: Variables, Analysis'} data-testid="textarea-syllabus" />
              </label>
              <div className="flex justify-end gap-2 border-t pt-5">
                <button type="button" onClick={() => setShowEditor(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary" data-testid="button-cancel-exam">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="button-save-exam"><Save size={15} />{editing ? 'Save changes' : 'Generate study plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}