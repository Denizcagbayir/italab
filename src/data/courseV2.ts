import raw from './curriculum-v2.json';
import { UNIT_META, UNIT_META_BY_ID, LESSON_PASS } from './unitsMeta';
import type { CourseMapUnit, Lesson, Skill, Unit } from '../types/curriculum';

export type TeachingCheck = {
  q: string;
  options: string[];
  a: string;
  why: string;
};

export type TeachingLesson = {
  id: string;
  unitCode: string;
  level: 'A1' | 'A2';
  title: string;
  goal: string;
  concept: string;
  rules: string[];
  /** [italiano, türkçe, not] */
  examples: [string, string, string][];
  /** [lemma/it, türkçe, örnek cümle] */
  vocab: [string, string, string][];
  dialogue: string[];
  checks: TeachingCheck[];
  /** [yanlış, doğru, açıklama] */
  errors: [string, string, string][];
  production: string;
  source: string;
  skill: string;
};

type RawLesson = {
  id: string;
  unit_code: string;
  level: string;
  title: string;
  goal: string;
  concept: string;
  rules: string[];
  examples: string[][];
  vocab: string[][];
  dialogue: string[];
  checks: TeachingCheck[];
  errors: string[][];
  production: string;
  source: string;
  skill: string;
};

type RawFile = {
  course_id: string;
  version: string;
  levels: string[];
  instructional_lesson_count: number;
  unit_component_count: number;
  lesson_screen_schema: string[];
  lessons: RawLesson[];
};

const file = raw as RawFile;

function triple(row: string[]): [string, string, string] {
  return [row[0] ?? '', row[1] ?? '', row[2] ?? ''];
}

export const TEACHING_LESSONS: TeachingLesson[] = file.lessons.map((l) => ({
  id: l.id,
  unitCode: l.unit_code,
  level: (l.level === 'A2' ? 'A2' : 'A1') as 'A1' | 'A2',
  title: l.title,
  goal: l.goal,
  concept: l.concept,
  rules: l.rules ?? [],
  examples: (l.examples ?? []).map(triple),
  vocab: (l.vocab ?? []).map(triple),
  dialogue: l.dialogue ?? [],
  checks: l.checks ?? [],
  errors: (l.errors ?? []).map(triple),
  production: l.production,
  source: l.source,
  skill: l.skill,
}));

export const TEACHING_BY_ID = Object.fromEntries(
  TEACHING_LESSONS.map((l) => [l.id, l]),
) as Record<string, TeachingLesson>;

export const SCREEN_SCHEMA = file.lesson_screen_schema;

export function getTeachingLesson(id: string): TeachingLesson | null {
  return TEACHING_BY_ID[id] ?? null;
}

export function lessonsForUnit(unitId: string): TeachingLesson[] {
  return TEACHING_LESSONS.filter((l) => l.unitCode === unitId);
}

const SKILL_MAP: Record<string, Skill[]> = {
  onboarding: ['vocab', 'listening'],
  grammar: ['grammar'],
  vocab: ['vocab'],
  listening: ['listening'],
  speaking: ['speaking'],
  writing: ['writing'],
  reading: ['reading'],
  pronunciation: ['speaking', 'listening'],
  culture: ['reading', 'vocab'],
};

export function skillsFromTeaching(lesson: TeachingLesson): Skill[] {
  const key = lesson.skill.toLowerCase();
  for (const [k, skills] of Object.entries(SKILL_MAP)) {
    if (key.includes(k)) return skills;
  }
  return ['grammar', 'vocab'];
}

function teachingToLessonStub(t: TeachingLesson, order: number): Lesson {
  return {
    id: t.id,
    unitId: t.unitCode,
    order,
    titleIt: t.title,
    titleTr: t.title,
    goalsTr: [t.goal],
    estimatedMinutes: LESSON_PASS.estimatedMinutesTeaching,
    exercises: [],
    kind: 'teaching',
  };
}

function missionLesson(unitId: string, order: number, missionTr: string): Lesson {
  return {
    id: `${unitId}-MISSION`,
    unitId,
    order,
    titleIt: 'Missione',
    titleTr: 'Ünite görevi',
    goalsTr: [missionTr],
    estimatedMinutes: 14,
    exercises: [],
    kind: 'mission',
  };
}

export const UNIT_SEQUENCE = [
  ...UNIT_META.map((u) => u.id),
  'CHK-A1-FINAL',
  'CHK-A2-FINAL',
] as const;

/** Ordered for unlock progression (checkpoints after A1 / A2 blocks). */
export const UNIT_SEQUENCE_UNLOCK = [
  'UNT-A1-00-BENVENUTI',
  'UNT-A1-01-NUOVO-INIZIO',
  'UNT-A1-02-TEMPO-LIBERO',
  'UNT-A1-03-IN-CONTATTO',
  'UNT-A1-04-BUON-FINE-SETTIMANA',
  'UNT-A1-05-TEMPO-DI-VACANZE',
  'CHK-A1-FINAL',
  'UNT-A2-06-A-CENA-FUORI',
  'UNT-A2-07-AL-CINEMA',
  'UNT-A2-08-FARE-LA-SPESA',
  'UNT-A2-09-FARE-SPESE',
  'UNT-A2-10-TV',
  'UNT-A2-11-MUSICA',
  'CHK-A2-FINAL',
] as const;

function buildUnit(meta: (typeof UNIT_META)[number]): Unit {
  const teaching = lessonsForUnit(meta.id);
  const lessons = [
    ...teaching.map((t, i) => teachingToLessonStub(t, i + 1)),
    missionLesson(meta.id, teaching.length + 1, meta.missionTr),
  ];
  return {
    id: meta.id,
    level: meta.level,
    order: meta.order,
    slug: meta.id.replace(/^UNT-[A-Z0-9]+-/, '').toLowerCase(),
    titleIt: meta.titleIt,
    titleTr: meta.titleTr,
    outcomeTr: meta.outcomeTr,
    grammarFocus: meta.grammarFocus,
    vocabFocus: [],
    estimatedHours: '8–12',
    lessons,
  };
}

export const UNITS: Record<string, Unit> = Object.fromEntries(
  UNIT_META.map((m) => [m.id, buildUnit(m)]),
);

// Checkpoint placeholders (full item banks come later from MD exams)
UNITS['CHK-A1-FINAL'] = {
  id: 'CHK-A1-FINAL',
  level: 'A1',
  order: 6,
  slug: 'a1-final',
  titleIt: 'A1 Checkpoint',
  titleTr: 'A1 Kontrol Noktası',
  outcomeTr: 'A1 bütünleşik performans',
  grammarFocus: ['A1 tekrar'],
  vocabFocus: [],
  estimatedHours: '2',
  lessons: [
    {
      id: 'EXM-IT-A1-FINAL',
      unitId: 'CHK-A1-FINAL',
      order: 1,
      titleIt: 'Esame A1',
      titleTr: 'A1 seviye sınavı',
      goalsTr: ['A1 dinleme, okuma, yapı, yazma ve konuşma bütünleşik ölçümü'],
      estimatedMinutes: 90,
      exercises: [],
      kind: 'exam',
    },
  ],
};

UNITS['CHK-A2-FINAL'] = {
  id: 'CHK-A2-FINAL',
  level: 'A2',
  order: 13,
  slug: 'a2-final',
  titleIt: 'A2 Checkpoint',
  titleTr: 'A2 Kontrol Noktası',
  outcomeTr: 'A2 bütünleşik performans',
  grammarFocus: ['A1–A2 tekrar'],
  vocabFocus: [],
  estimatedHours: '2',
  lessons: [
    {
      id: 'EXM-IT-A2-FINAL',
      unitId: 'CHK-A2-FINAL',
      order: 1,
      titleIt: 'Esame A2',
      titleTr: 'A2 seviye sınavı',
      estimatedMinutes: 120,
      goalsTr: ['A2 dinleme, okuma, yapı, yazma ve konuşma bütünleşik ölçümü'],
      exercises: [],
      kind: 'exam',
    },
  ],
};

export const COURSE_MAP: CourseMapUnit[] = [
  ...UNIT_META.map((m) => ({
    id: m.id,
    level: m.level as 'A1' | 'A2',
    order: m.order,
    titleIt: m.titleIt,
    titleTr: m.titleTr,
    outcomeTr: m.outcomeTr,
    grammarFocus: m.grammarFocus,
    available: true,
    lessonCount: UNITS[m.id]?.lessons.length ?? 0,
  })),
  {
    id: 'CHK-A1-FINAL',
    level: 'A1' as const,
    order: 6,
    titleIt: 'A1 Checkpoint',
    titleTr: 'A1 Kontrol Noktası',
    outcomeTr: 'A1 bütünleşik performans',
    grammarFocus: ['A1 tekrar'],
    available: true,
    lessonCount: 1,
  },
  {
    id: 'CHK-A2-FINAL',
    level: 'A2' as const,
    order: 13,
    titleIt: 'A2 Checkpoint',
    titleTr: 'A2 Kontrol Noktası',
    outcomeTr: 'A2 bütünleşik performans',
    grammarFocus: ['A1–A2 tekrar'],
    available: true,
    lessonCount: 1,
  },
].sort((a, b) => {
  const order = UNIT_SEQUENCE_UNLOCK as readonly string[];
  return order.indexOf(a.id) - order.indexOf(b.id);
});

export function getUnit(id: string): Unit | null {
  return UNITS[id] ?? null;
}

export function getLesson(unitId: string, lessonId: string) {
  const unit = getUnit(unitId);
  return unit?.lessons.find((l) => l.id === lessonId) ?? null;
}

export function getUnitMeta(id: string) {
  return UNIT_META_BY_ID[id] ?? null;
}

export function isUnitComplete(
  unitId: string,
  lessonsProgress: Record<string, { completed?: boolean }>,
): boolean {
  const unit = getUnit(unitId);
  if (!unit) return false;
  // Mission/exam optional for unlock of teaching path: require all teaching lessons
  const teaching = unit.lessons.filter((l) => l.kind === 'teaching' || !l.kind);
  const required = teaching.length ? teaching : unit.lessons;
  return required.every((l) => lessonsProgress[l.id]?.completed);
}

export function nextUnitId(unitId: string): string | null {
  const i = UNIT_SEQUENCE_UNLOCK.indexOf(
    unitId as (typeof UNIT_SEQUENCE_UNLOCK)[number],
  );
  if (i < 0 || i >= UNIT_SEQUENCE_UNLOCK.length - 1) return null;
  return UNIT_SEQUENCE_UNLOCK[i + 1];
}

export function getContinueLesson(
  lessonsProgress: Record<string, { completed?: boolean }>,
  unlockedUnits: string[],
) {
  for (const id of UNIT_SEQUENCE_UNLOCK) {
    if (!unlockedUnits.includes(id)) continue;
    const unit = getUnit(id);
    if (!unit) continue;
    const next = unit.lessons.find(
      (l) => l.kind !== 'exam' && !lessonsProgress[l.id]?.completed,
    );
    if (next) return { unit, lesson: next };
  }
  for (let i = UNIT_SEQUENCE_UNLOCK.length - 1; i >= 0; i--) {
    const unit = getUnit(UNIT_SEQUENCE_UNLOCK[i]);
    if (unit && unlockedUnits.includes(unit.id)) {
      return { unit, lesson: unit.lessons[0] };
    }
  }
  return null;
}

export const CURRICULUM_STATS = {
  courseId: file.course_id,
  version: file.version,
  instructionalLessons: file.instructional_lesson_count,
  unitComponents: file.unit_component_count,
  screenSchema: file.lesson_screen_schema,
};
