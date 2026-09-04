import { SUBJECT_COLORS, type Subject } from "@/lib/study-data";

export type SyllabusSubjectDraft = {
  name: string;
  chapters: Array<{ name: string; topics: string[] }>;
};

export function parseSyllabusText(value: string): SyllabusSubjectDraft[] {
  const subjects = new Map<string, SyllabusSubjectDraft>();

  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      let subjectName = line;
      let chapterName = "Core topics";
      let topicsPart = "Review key ideas";

      if (line.includes("|")) {
        const [subject, chapterAndTopics = "Core topics: Review key ideas"] =
          line.split("|");
        subjectName = subject.trim();
        const colonIndex = chapterAndTopics.indexOf(":");
        chapterName =
          (colonIndex >= 0
            ? chapterAndTopics.slice(0, colonIndex)
            : chapterAndTopics
          ).trim() || "Core topics";
        topicsPart =
          colonIndex >= 0
            ? chapterAndTopics.slice(colonIndex + 1)
            : "Review key ideas";
      } else if (line.includes(":")) {
        const [subject, ...topicParts] = line.split(":");
        subjectName = subject.trim();
        topicsPart = topicParts.join(":").trim() || "Review key ideas";
      }

      if (!subjectName) return;
      const subject = subjects.get(subjectName) ?? {
        name: subjectName,
        chapters: [],
      };
      subject.chapters.push({
        name: chapterName,
        topics: topicsPart
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),
      });
      subjects.set(subjectName, subject);
    });

  return Array.from(subjects.values());
}

export function formatSyllabusText(subjects: SyllabusSubjectDraft[] | Subject[]) {
  return subjects
    .flatMap((subject) =>
      subject.chapters.map(
        (chapter) =>
          `${subject.name} | ${chapter.name}: ${chapter.topics.map(topic => typeof topic === 'string' ? topic : topic.name).join(", ")}`,
      ),
    )
    .join("\n");
}

export function toPlannerSubjects(drafts: SyllabusSubjectDraft[]): Subject[] {
  const stamp = Date.now();
  return drafts.map((subject, subjectIndex) => ({
    id: `subject-${stamp}-${subjectIndex}`,
    name: subject.name,
    color: SUBJECT_COLORS[subjectIndex % SUBJECT_COLORS.length],
    chapters: subject.chapters.map((chapter, chapterIndex) => ({
      id: `chapter-${stamp}-${subjectIndex}-${chapterIndex}`,
      name: chapter.name,
      topics: chapter.topics.map((topic, topicIndex) => ({
        id: `topic-${stamp}-${subjectIndex}-${chapterIndex}-${topicIndex}`,
        name: topic,
        estimatedMinutes: 60,
      })),
    })),
  }));
}