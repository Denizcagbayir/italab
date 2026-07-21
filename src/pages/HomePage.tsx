import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COURSE_MAP, getContinueLesson } from '../data/course';
import { useProgress } from '../store/progressStore';

export function HomePage() {
  const lessons = useProgress((s) => s.lessons);
  const unlocked = useProgress((s) => s.unlockedUnits);
  const streak = useProgress((s) => s.streak);
  const todayXp = useProgress((s) => s.todayXp);
  const todayMinutes = useProgress((s) => s.todayMinutes);
  const dailyGoal = useProgress((s) => s.dailyGoalMinutes);

  const cont = getContinueLesson(lessons, unlocked);
  const currentDone = cont
    ? cont.unit.lessons.filter((l) => lessons[l.id]?.completed).length
    : 0;
  const currentTotal = cont?.unit.lessons.length ?? 0;

  return (
    <div className="page home">
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hero-inner"
        >
          <p className="eyebrow">İtalyanca A1–A2</p>
          <h1 className="brand-hero">
            <span>ITA</span>lab
          </h1>
          <p className="lede">
            Dinle, yaz, konuş. Kendi hızında, tarayıcında.
          </p>
          {cont && (
            <div className="cta-row">
              <Link
                className="btn primary lg"
                to={`/lesson/${cont.unit.id}/${cont.lesson.id}`}
              >
                {currentDone === 0 && cont.unit.order === 0
                  ? 'Başla'
                  : 'Devam et'}{' '}
                — {cont.lesson.titleTr}
              </Link>
              <Link className="btn ghost lg" to="/practice">
                Pratik Hub
              </Link>
            </div>
          )}
        </motion.div>
        <div className="hero-glow" aria-hidden />
      </section>

      <section className="home-stats">
        <div>
          <strong>{streak}</strong>
          <span>gün seri</span>
        </div>
        <div>
          <strong>{todayXp}</strong>
          <span>bugün XP</span>
        </div>
        <div>
          <strong>
            {todayMinutes}/{dailyGoal}
          </strong>
          <span>dk hedef</span>
        </div>
        <div>
          <strong>
            {currentDone}/{currentTotal}
          </strong>
          <span>{cont?.unit.titleIt ?? 'Ünite'}</span>
        </div>
      </section>

      <section className="home-path-preview">
        <div className="section-head">
          <h2>Öğrenme yolu</h2>
          <Link to="/path">Tümü</Link>
        </div>
        <div className="unit-strip">
          {COURSE_MAP.slice(0, 6).map((u) => (
            <Link
              key={u.id}
              to={u.available ? `/path/${u.id}` : '/path'}
              className={`unit-pill ${u.available && unlocked.includes(u.id) ? '' : 'locked'}`}
            >
              <span className="lvl">{u.level}</span>
              <span>{u.titleIt}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
