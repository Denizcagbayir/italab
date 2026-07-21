import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../../types/curriculum';
import { ExerciseView } from '../exercises/ExerciseView';
import { skillListFromTypes, useProgress } from '../../store/progressStore';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  lesson: Lesson;
  unitTitle: string;
};

export function LessonPlayer({ lesson, unitTitle }: Props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState({ correct: 0, answered: 0 });
  const [startedAt] = useState(Date.now());
  const tally = useRef({ correct: 0, answered: 0 });

  const recordLessonComplete = useProgress((s) => s.recordLessonComplete);
  const addMistake = useProgress((s) => s.addMistake);
  const upsertSrs = useProgress((s) => s.upsertSrsFromExercise);
  const addStudyMinutes = useProgress((s) => s.addStudyMinutes);

  const ex = lesson.exercises[index];
  const progress = ((index + (feedback ? 0.5 : 0)) / lesson.exercises.length) * 100;

  const skills = useMemo(
    () => skillListFromTypes(lesson.exercises.map((e) => e.type)),
    [lesson.id],
  );

  const finish = (finalCorrect: number, finalAnswered: number) => {
    const accuracy = finalAnswered
      ? Math.round((finalCorrect / finalAnswered) * 100)
      : 100;
    const xp = Math.max(10, Math.round(accuracy / 5) + lesson.exercises.length * 2);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    recordLessonComplete(lesson.id, accuracy, xp, skills);
    addStudyMinutes(minutes);
    setFinalStats({ correct: finalCorrect, answered: finalAnswered });
    setDone(true);
  };

  const advance = () => {
    setFeedback(null);
    if (index + 1 >= lesson.exercises.length) {
      finish(tally.current.correct, tally.current.answered);
      return;
    }
    setIndex((i) => i + 1);
  };

  const handleResult = (
    ok: boolean,
    detail?: { userAnswer: string; expected: string },
  ) => {
    if (feedback) return;

    // Explanation slides are not scored — advance quietly (no "Doğru!").
    if (ex.type === 'EXPLAIN') {
      advance();
      return;
    }

    const nextAnswered = answered + 1;
    const nextCorrect = correct + (ok ? 1 : 0);
    tally.current = { correct: nextCorrect, answered: nextAnswered };
    setAnswered(nextAnswered);
    setCorrect(nextCorrect);
    upsertSrs(ex, ok);
    if (!ok && detail) {
      addMistake({
        exerciseId: ex.id,
        prompt: ex.promptTr,
        expected: detail.expected,
        userAnswer: detail.userAnswer,
        type: ex.type,
      });
    }
    setFeedback(ok ? 'ok' : 'bad');
  };

  const next = () => {
    advance();
  };

  if (done) {
    const accuracy = finalStats.answered
      ? Math.round((finalStats.correct / finalStats.answered) * 100)
      : 100;
    const xp = Math.max(10, Math.round(accuracy / 5) + lesson.exercises.length * 2);
    return (
      <div className="lesson-done">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="done-card"
        >
          <p className="eyebrow">{unitTitle}</p>
          <h1>Bravo!</h1>
          <p className="lede">{lesson.titleTr} tamamlandı.</p>
          <div className="stat-row">
            <div>
              <strong>{accuracy}%</strong>
              <span>Doğruluk</span>
            </div>
            <div>
              <strong>+{xp}</strong>
              <span>XP</span>
            </div>
            <div>
              <strong>
                {finalStats.correct}/{finalStats.answered || '—'}
              </strong>
              <span>Doğru</span>
            </div>
          </div>
          <div className="row-actions">
            <Link className="btn primary" to={`/path/${lesson.unitId}`}>
              Üniteye dön
            </Link>
            <Link className="btn ghost" to="/practice">
              Pratik yap
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`lesson-player${feedback ? ' is-resolved' : ''}`}>
      <div className="lesson-top">
        <Link to={`/path/${lesson.unitId}`} className="back-link">
          ← {unitTitle}
        </Link>
        <div className="progress-track" aria-hidden>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-meta">
          {index + 1}/{lesson.exercises.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ex.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <ExerciseView exercise={ex} onResult={handleResult} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`feedback-bar ${feedback}`}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <strong className="feedback-title">
              {feedback === 'ok' ? 'Doğru!' : 'Henüz değil'}
            </strong>
            {feedback === 'bad' && ex.acceptedAnswers && (
              <p className="feedback-detail" lang="it">
                Doğru cevap: {ex.acceptedAnswers[0]}
              </p>
            )}
            {feedback === 'bad' && ex.hint && (
              <p className="hint">{ex.hint}</p>
            )}
            <button type="button" className="btn primary" onClick={next}>
              Devam et
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
