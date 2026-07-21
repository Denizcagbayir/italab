import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Exercise,
  ExerciseType,
  MistakeItem,
  Skill,
  SkillStats,
  SrsCard,
  UserProgress,
} from '../types/curriculum';
import { createCard } from '../lib/srs';
import {
  UNIT_SEQUENCE,
  getUnit,
  isUnitComplete,
  nextUnitId,
} from '../data/course';

const UNIT0 = 'UNT-A1-00-BENVENUTI';

const defaultSkills: SkillStats = {
  listening: 0,
  reading: 0,
  writing: 0,
  speaking: 0,
  grammar: 0,
  vocab: 0,
};

const initial: UserProgress = {
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  dailyGoalMinutes: 15,
  todayMinutes: 0,
  todayXp: 0,
  hearts: 5,
  speakEnabled: true,
  voiceName: null,
  lessons: {},
  unlockedUnits: [UNIT0],
  skills: { ...defaultSkills },
  mistakes: [],
  srs: [],
  settings: {
    ignoreAccents: false,
    ignoreCase: true,
    slowDefault: false,
  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function bumpStreak(state: UserProgress): Partial<UserProgress> {
  const today = todayKey();
  if (state.lastStudyDate === today) return {};
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  const streak = state.lastStudyDate === yKey ? state.streak + 1 : 1;
  return {
    streak,
    lastStudyDate: today,
    todayMinutes: 0,
    todayXp: 0,
  };
}

type Store = UserProgress & {
  hydrateDay: () => void;
  setVoiceName: (name: string | null) => void;
  setSpeakEnabled: (v: boolean) => void;
  setSettings: (s: Partial<UserProgress['settings']>) => void;
  setDailyGoal: (m: number) => void;
  addStudyMinutes: (m: number) => void;
  recordLessonComplete: (
    lessonId: string,
    accuracy: number,
    xp: number,
    skills: Skill[],
  ) => void;
  addMistake: (m: Omit<MistakeItem, 'id' | 'at' | 'resolved'>) => void;
  resolveMistake: (id: string) => void;
  upsertSrsFromExercise: (ex: Exercise, known: boolean) => void;
  updateSrsCard: (card: SrsCard) => void;
  unlockUnit: (unitId: string) => void;
  resetProgress: () => void;
  exportJson: () => string;
  importJson: (raw: string) => boolean;
};

export const useProgress = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      hydrateDay: () => {
        const s = get();
        const today = todayKey();
        if (s.lastStudyDate && s.lastStudyDate !== today) {
          // reset daily counters without breaking streak until study
          set({ todayMinutes: 0, todayXp: 0 });
        }
      },

      setVoiceName: (voiceName) => set({ voiceName }),
      setSpeakEnabled: (speakEnabled) => set({ speakEnabled }),
      setSettings: (partial) =>
        set({ settings: { ...get().settings, ...partial } }),
      setDailyGoal: (dailyGoalMinutes) => set({ dailyGoalMinutes }),

      addStudyMinutes: (m) => {
        const bump = bumpStreak(get());
        set((s) => ({
          ...bump,
          todayMinutes: (bump.todayMinutes ?? s.todayMinutes) + m,
        }));
      },

      recordLessonComplete: (lessonId, accuracy, xp, skills) => {
        const bump = bumpStreak(get());
        set((s) => {
          const prev = s.lessons[lessonId];
          const skillPatch = { ...s.skills };
          for (const sk of skills) {
            skillPatch[sk] = Math.min(100, skillPatch[sk] + 2 + Math.round(accuracy / 20));
          }
          const lessons = {
            ...s.lessons,
            [lessonId]: {
              lessonId,
              completed: true,
              bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
              attempts: (prev?.attempts ?? 0) + 1,
              lastXp: xp,
              completedAt: Date.now(),
            },
          };
          return {
            ...bump,
            xp: s.xp + xp,
            todayXp: (bump.todayXp ?? s.todayXp) + xp,
            skills: skillPatch,
            lessons,
          };
        });
        const state = get();
        for (const uid of UNIT_SEQUENCE) {
          if (!state.unlockedUnits.includes(uid)) continue;
          if (isUnitComplete(uid, state.lessons)) {
            const nxt = nextUnitId(uid);
            if (nxt && getUnit(nxt)) get().unlockUnit(nxt);
          }
        }
      },

      addMistake: (m) => {
        const item: MistakeItem = {
          ...m,
          id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: Date.now(),
          resolved: false,
        };
        set((s) => ({
          mistakes: [item, ...s.mistakes].slice(0, 200),
        }));
      },

      resolveMistake: (id) =>
        set((s) => ({
          mistakes: s.mistakes.map((x) =>
            x.id === id ? { ...x, resolved: true } : x,
          ),
        })),

      upsertSrsFromExercise: (ex, known) => {
        const front =
          ex.audioText ||
          ex.promptIt ||
          ex.acceptedAnswers?.[0] ||
          ex.pairs?.[0]?.left ||
          ex.id;
        const back =
          ex.promptTr ||
          ex.pairs?.[0]?.right ||
          ex.acceptedAnswers?.[0] ||
          '';
        set((s) => {
          const existing = s.srs.find((c) => c.id === ex.id);
          if (existing) {
            return {
              srs: s.srs.map((c) =>
                c.id === ex.id
                  ? {
                      ...c,
                      due: known
                        ? Date.now() + 24 * 60 * 60 * 1000
                        : Date.now() + 10 * 60 * 1000,
                      reps: known ? c.reps + 1 : c.reps,
                      lapses: known ? c.lapses : c.lapses + 1,
                    }
                  : c,
              ),
            };
          }
          const card = createCard(ex.id, front, back, ex.audioText);
          if (!known) card.due = Date.now();
          return { srs: [...s.srs, card] };
        });
      },

      updateSrsCard: (card) =>
        set((s) => ({
          srs: s.srs.map((c) => (c.id === card.id ? card : c)),
        })),

      unlockUnit: (unitId) =>
        set((s) => ({
          unlockedUnits: s.unlockedUnits.includes(unitId)
            ? s.unlockedUnits
            : [...s.unlockedUnits, unitId],
        })),

      resetProgress: () => set({ ...initial }),

      exportJson: () => {
        const {
          hydrateDay: _h,
          setVoiceName: _v,
          setSpeakEnabled: _e,
          setSettings: _s,
          setDailyGoal: _d,
          addStudyMinutes: _a,
          recordLessonComplete: _r,
          addMistake: _m,
          resolveMistake: _rm,
          upsertSrsFromExercise: _u,
          updateSrsCard: _uc,
          unlockUnit: _un,
          resetProgress: _rp,
          exportJson: _ex,
          importJson: _im,
          ...data
        } = get();
        return JSON.stringify(data, null, 2);
      },

      importJson: (raw) => {
        try {
          const data = JSON.parse(raw) as UserProgress;
          if (!data || typeof data.xp !== 'number') return false;
          set({
            ...initial,
            ...data,
            settings: { ...initial.settings, ...data.settings },
            skills: { ...defaultSkills, ...data.skills },
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: 'italab-progress-v1' },
  ),
);

export function skillListFromTypes(types: ExerciseType[]): Skill[] {
  const map: Partial<Record<ExerciseType, Skill[]>> = {
    WORD_MATCH: ['vocab'],
    MCQ: ['reading'],
    WORD_BANK: ['writing', 'grammar'],
    FREE_TRANSLATION: ['writing'],
    DICTATION: ['listening', 'writing'],
    CLOZE: ['grammar'],
    DIALOGUE_CHOICE: ['reading'],
    SPEAK_SENTENCE: ['speaking'],
    LISTEN_REPEAT: ['listening', 'speaking'],
    MINIMAL_PAIR: ['listening'],
    CONJUGATE: ['grammar', 'writing'],
    TRANSFORM: ['grammar', 'writing'],
    WRITE_SENTENCE: ['writing'],
    OPEN_SPEAK: ['speaking'],
    AUDIO_WORD: ['listening', 'vocab'],
    ORDER_SENTENCE: ['grammar'],
    FLASHCARD: ['vocab'],
    EXPLAIN: ['grammar'],
  };
  const set = new Set<Skill>();
  for (const t of types) (map[t] ?? []).forEach((s) => set.add(s));
  return [...set];
}
