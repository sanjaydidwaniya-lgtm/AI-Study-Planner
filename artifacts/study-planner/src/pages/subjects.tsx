import { BookOpen, Check, ChevronRight, Pencil, Plus, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { SyllabusEditor } from '@/components/SyllabusEditor';
import { ProgressBar } from '@/components/ProgressBar';
import { usePlanner } from '@/hooks/use-study-planner';

export function SubjectsPage() {
  const planner = usePlanner();
  const exam = planner.exams[0];
  const [editorOpen, setEditorOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!exam) return <div className="rounded-2xl border bg-card p-10 text-center"><h1 className="font-display text-3xl">Add an exam first.</h1><p className="mt-2 text-sm text-muted-foreground">Your syllabus will live here once your study plan has a starting point.</p></div>;
  const save = (updatedExam: typeof exam) => { planner.updateExam(updatedExam); setEditorOpen(false); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  return <div className="space-y-8">
    <div className="rise-in flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">The building blocks</p><h1 className="mt-2 font-display text-4xl">Subjects</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">Keep the syllabus clear enough to act on. Add subjects, chapters, and topics; future sessions will follow the shape you save.</p></div>
      <button type="button" onClick={() => setEditorOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground" data-testid="button-add-syllabus"><Plus size={16} />Add syllabus</button>
    </div>
    {saved && <div className="flex items-center gap-2 rounded-xl bg-[#e6efe9] px-4 py-3 text-sm font-semibold text-[#19332b]" role="status"><Check size={15} />Future study sessions updated.</div>}
    <div className="grid gap-5 lg:grid-cols-3">
      {exam.subjects.map(subject => {
        const subjectTasks = planner.tasks.filter(task => task.subjectId === subject.id);
        const completed = subjectTasks.filter(task => task.status === 'completed').length;
        const totalTopics = subject.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
        return <article key={subject.id} className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} /><div><h2 className="font-display text-2xl">{subject.name}</h2><p className="mt-1 text-xs text-muted-foreground">{subject.chapters.length} chapters · {totalTopics} topics</p></div></div><ChevronRight size={17} className="text-muted-foreground" /></div>
          <div className="mt-5"><ProgressBar value={subjectTasks.length ? completed / subjectTasks.length * 100 : 0} color={subject.color} label={`${completed}/${subjectTasks.length || totalTopics} sessions`} /></div>
          {(exam.weakSubjects.includes(subject.name) || exam.strongSubjects.includes(subject.name)) && <div className="mt-4 flex items-center gap-2 text-xs font-semibold">{exam.weakSubjects.includes(subject.name) ? <><ShieldAlert size={14} className="text-[#b55744]" /><span className="text-[#b55744]">Weak subject · extra time</span></> : <><Check size={14} className="text-[#397c68]" /><span className="text-[#397c68]">Strong subject · maintenance pass</span></>}</div>}
          <div className="mt-5 space-y-3 border-t pt-4">{subject.chapters.map(chapter => <div key={chapter.id}><p className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={14} className="text-primary" />{chapter.name}</p><p className="mt-1 pl-5 text-xs leading-5 text-muted-foreground">{chapter.topics.map(topic => topic.name).join(' · ')}</p></div>)}</div>
        </article>;
      })}
    </div>
    <div className="flex items-center justify-between rounded-2xl border border-dashed bg-card/60 p-5"><div><p className="text-sm font-semibold">Need to reshape the plan?</p><p className="mt-1 text-xs text-muted-foreground">Editing the syllabus regenerates unlocked future sessions only.</p></div><button type="button" onClick={() => setEditorOpen(true)} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary" data-testid="button-edit-subjects"><Pencil size={14} />Edit future items</button></div>
    <SyllabusEditor open={editorOpen} exam={exam} onClose={() => setEditorOpen(false)} onSave={save} />
  </div>;
}