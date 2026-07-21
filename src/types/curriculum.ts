export type ExerciseType =
  | 'WORD_MATCH'
  | 'MCQ'
  | 'WORD_BANK'
  | 'FREE_TRANSLATION'
  | 'DICTATION'
  | 'CLOZE'
  | 'DIALOGUE_CHOICE'
  | 'SPEAK_SENTENCE'
  | 'LISTEN_REPEAT'
  | 'MINIMAL_PAIR'
  | 'CONJUGATE'
  | 'TRANSFORM'
  | 'WRITE_SENTENCE'
  | 'OPEN_SPEAK'
  | 'EXPLAIN'
  | 'FLASHCARD'
  | 'AUDIO_WORD'
  | 'ORDER_SENTENCE';

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking' | 'grammar' | 'vocab';

export interface DialogueLine {
  speaker: string;
  text: string;
  tr?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  skills: Skill[];
  promptTr: string;
  /** Prompt in Italian when relevant */
  promptIt?: string;
  audioText?: string;
  slowRate?: number;
  options?: string[];
  pairs?: { left: string; right: string }[];
  tokens?: string[];
  distractors?: string[];
  acceptedAnswers?: string[];
  blanks?: { before: string; after: string; answer: string }[];
  lemma?: string;
  person?: string;
  transformFrom?: string;
  dialogue?: DialogueLine[];
  hint?: string;
  explanation?: string;
  targetCoverage?: string[];
  difficulty?: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  titleIt: string;
  titleTr: string;
  goalsTr: string[];
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  level: 'A1' | 'A2';
  order: number;
  slug: string;
  titleIt: string;
  titleTr: string;
  outcomeTr: string;
  grammarFocus: string[];
  vocabFocus: string[];
  estimatedHours: string;
  locked?: boolean;
  lessons: Lesson[];
}

export interface CourseMapUnit {
  id: string;
  level: 'A1' | 'A2';
  order: number;
  titleIt: string;
  titleTr: string;
  outcomeTr: string;
  grammarFocus: string[];
  available: boolean;
  lessonCount: number;
}

export type MasteryState = 'NEW' | 'INTRODUCED' | 'PRACTICING' | 'STABLE' | 'MASTERED' | 'FRAGILE';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  bestAccuracy: number;
  attempts: number;
  lastXp: number;
  completedAt?: number;
}

export interface SkillStats {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  grammar: number;
  vocab: number;
}

export interface MistakeItem {
  id: string;
  exerciseId: string;
  prompt: string;
  expected: string;
  userAnswer: string;
  type: ExerciseType;
  at: number;
  resolved?: boolean;
}

export interface SrsCard {
  id: string;
  front: string;
  back: string;
  audioText?: string;
  ease: number;
  interval: number;
  due: number;
  reps: number;
  lapses: number;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  dailyGoalMinutes: number;
  todayMinutes: number;
  todayXp: number;
  hearts: number;
  speakEnabled: boolean;
  voiceName: string | null;
  lessons: Record<string, LessonProgress>;
  unlockedUnits: string[];
  skills: SkillStats;
  mistakes: MistakeItem[];
  srs: SrsCard[];
  settings: {
    ignoreAccents: boolean;
    ignoreCase: boolean;
    slowDefault: boolean;
  };
}
