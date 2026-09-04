import { BookOpen, Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { toPlannerSubjects, type SyllabusSubjectDraft } from '@/lib/syllabus';
import type { Exam } from '@/lib/study-data';

type SyllabusEditorProps = { open: boolean; exam: Exam | null; onClose: () => void; onSave: (exam: Exam) => void };

export function SyllabusEditor({ open, exam, onClose, onSave }: SyllabusEditorProps) {
  const [draft, setDraft] = useState<SyllabusSubjectDraft[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState<Record<number, string>>({});
  const [newTopic, setNewTopic] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !exam) return;
    setDraft(exam.subjects.map(subject => ({ name: subject.name, chapters: subject.chapters.map(chapter => ({ name: chapter.name, topics: chapter.topics.map(topic => topic.name) })) })));
    setNewSubject('');
    setNewChapter({});
    setNewTopic({});
  }, [open, exam]);

  const updateSubject = (subjectIndex: number, name: string) => setDraft(items => items.map((subject, index) => index === subjectIndex ? { ...subject, name } : subject));
  const updateChapter = (subjectIndex: number, chapterIndex: number, name: string) => setDraft(items => items.map((subject, index) => index === subjectIndex ? { ...subject, chapters: subject.chapters.map((chapter, itemIndex) => itemIndex === chapterIndex ? { ...chapter, name } : chapter) } : subject));
  const updateTopic = (subjectIndex: number, chapterIndex: number, topicIndex: number, name: string) => setDraft(items => items.map((subject, index) => index === subjectIndex ? { ...subject, chapters: subject.chapters.map((chapter, itemIndex) => itemIndex === chapterIndex ? { ...chapter, topics: chapter.topics.map((topic, currentIndex) => currentIndex === topicIndex ? name : topic) } : chapter) } : subject));
  const addSubject = () => { if (!newSubject.trim()) return; setDraft(items => [...items, { name: newSubject.trim(), chapters: [] }]); setNewSubject(''); };
  const addChapter = (subjectIndex: number) => { const name = newChapter[subjectIndex]?.trim(); if (!name) return; setDraft(items => items.map((subject, index) => index === subjectIndex ? { ...subject, chapters: [...subject.chapters, { name, topics: [] }] } : subject)); setNewChapter(items => ({ ...items, [subjectIndex]: '' })); };
  const addTopic = (subjectIndex: number, chapterIndex: number) => { const key = `${subjectIndex}-${chapterIndex}`; const name = newTopic[key]?.trim(); if (!name) return; setDraft(items => items.map((subject, index) => index === subjectIndex ? { ...subject, chapters: subject.chapters.map((chapter, itemIndex) => itemIndex === chapterIndex ? { ...chapter, topics: [...chapter.topics, name] } : chapter) } : subject)); setNewTopic(items => ({ ...items, [key]: '' })); };
  const save = () => { if (!exam || !draft.length) return; onSave({ ...exam, subjects: toPlannerSubjects(draft) }); };

  return <Modal open={open} onClose={onClose} title="Build your syllabus" description="Edit future syllabus items here. Locked historical sessions stay in your timeline when you save.">
    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
      {draft.map((subject, subjectIndex) => <section key={`${subject.name}-${subjectIndex}`} className="rounded-2xl border bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/25 text-primary"><BookOpen size={15} /></span>
          <input value={subject.name} onChange={event => updateSubject(subjectIndex, event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-card px-2.5 py-2 text-sm font-semibold" aria-label={`Subject ${subjectIndex + 1}`} />
          <button type="button" onClick={() => setDraft(items => items.filter((_, index) => index !== subjectIndex))} className="rounded-lg p-2 text-muted-foreground hover:bg-[#c76852]/10 hover:text-[#b55744]" aria-label={`Delete ${subject.name}`}><Trash2 size={15} /></button>
        </div>
        <div className="mt-4 space-y-3 pl-2 sm:pl-10">
          {subject.chapters.map((chapter, chapterIndex) => <div key={`${chapter.name}-${chapterIndex}`} className="rounded-xl border bg-card p-3">
            <div className="flex items-center gap-2">
              <ChevronDown size={14} className="text-muted-foreground" />
              <input value={chapter.name} onChange={event => updateChapter(subjectIndex, chapterIndex, event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-background px-2.5 py-2 text-sm font-medium" aria-label={`Chapter ${chapterIndex + 1} in ${subject.name}`} />
              <button type="button" onClick={() => setDraft(items => items.map((item, index) => index === subjectIndex ? { ...item, chapters: item.chapters.filter((_, currentIndex) => currentIndex !== chapterIndex) } : item))} className="rounded-lg p-2 text-muted-foreground hover:bg-[#c76852]/10 hover:text-[#b55744]" aria-label={`Delete ${chapter.name}`}><X size={15} /></button>
            </div>
            <div className="mt-2 space-y-1.5 pl-6">
              {chapter.topics.map((topic, topicIndex) => <div key={`${topic}-${topicIndex}`} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <input value={topic} onChange={event => updateTopic(subjectIndex, chapterIndex, topicIndex, event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-background px-2 py-1.5 text-xs" aria-label={`Topic ${topicIndex + 1} in ${chapter.name}`} />
                <button type="button" onClick={() => setDraft(items => items.map((item, index) => index === subjectIndex ? { ...item, chapters: item.chapters.map((currentChapter, currentIndex) => currentIndex === chapterIndex ? { ...currentChapter, topics: currentChapter.topics.filter((_, currentTopic) => currentTopic !== topicIndex) } : currentChapter) } : item))} className="rounded p-1 text-muted-foreground hover:text-[#b55744]" aria-label={`Delete ${topic}`}><X size={13} /></button>
              </div>)}
              <div className="flex gap-2 pt-1">
                <input value={newTopic[`${subjectIndex}-${chapterIndex}`] ?? ''} onChange={event => setNewTopic(items => ({ ...items, [`${subjectIndex}-${chapterIndex}`]: event.target.value }))} onKeyDown={event => { if (event.key === 'Enter') addTopic(subjectIndex, chapterIndex); }} placeholder="New topic" className="min-w-0 flex-1 rounded-lg border border-dashed bg-background px-2 py-1.5 text-xs" />
                <button type="button" onClick={() => addTopic(subjectIndex, chapterIndex)} className="rounded-lg border px-2 text-primary hover:bg-secondary" aria-label="Add topic"><Plus size={14} /></button>
              </div>
            </div>
          </div>)}
          <div className="flex gap-2">
            <input value={newChapter[subjectIndex] ?? ''} onChange={event => setNewChapter(items => ({ ...items, [subjectIndex]: event.target.value }))} onKeyDown={event => { if (event.key === 'Enter') addChapter(subjectIndex); }} placeholder="New chapter" className="min-w-0 flex-1 rounded-lg border border-dashed bg-background px-2.5 py-2 text-xs" />
            <button type="button" onClick={() => addChapter(subjectIndex)} className="flex items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold text-primary hover:bg-secondary"><Plus size={14} />Chapter</button>
          </div>
        </div>
      </section>)}
    </div>
    <div className="mt-4 flex gap-2">
      <input value={newSubject} onChange={event => setNewSubject(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') addSubject(); }} placeholder="New subject" className="min-w-0 flex-1 rounded-xl border border-dashed bg-background px-3 py-2.5 text-sm" />
      <button type="button" onClick={addSubject} className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"><Plus size={15} />Subject</button>
    </div>
    <div className="mt-6 flex justify-end gap-2 border-t pt-5">
      <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary">Cancel</button>
      <button type="button" onClick={save} disabled={!draft.length} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Check size={15} />Save future syllabus</button>
    </div>
  </Modal>;
}