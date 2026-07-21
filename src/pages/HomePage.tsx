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
  const isFreshStart = currentDone === 0 && cont?.unit.order === 0;
  const goalPct = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="page home">
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hero-inner"
        >
          <p className="eyebrow">İtalyanca A1–A2</p>
          <h1 className="brand-hero">
            <span>ITA</span>lab
          </h1>
          <p className="lede">
            Dinle, yaz, konuş. ITAlab ile İtalyanca öğren!
          </p>

          {cont && (
            <div className="continue-card">
              <div className="continue-meta">
                <span className="lvl">{cont.unit.level}</span>
                <span className="muted small">
                  {cont.unit.titleIt} · {currentDone}/{currentTotal} ders
                </span>
              </div>
              <Link
                className="btn primary lg continue-cta"
                to={`/lesson/${cont.unit.id}/${cont.lesson.id}`}
              >
                <span className="continue-cta-main">
                  {isFreshStart ? 'Başla' : 'Devam et'}
                </span>
                <span className="continue-cta-sub">{cont.lesson.titleTr}</span>
              </Link>
              <div className="cta-row secondary-cta">
                <Link className="btn ghost" to="/progress">
                  Gelişimini gör
                </Link>
                <Link className="btn ghost" to="/practice">
                  Pratik yap
                </Link>
              </div>
            </div>
          )}
        </motion.div>
        <div className="hero-glow" aria-hidden />
      </section>

      <section className="home-stats" aria-label="Bugünün özeti">
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
          <div className="mini-bar home-goal-bar" aria-hidden>
            <div style={{ width: `${goalPct}%` }} />
          </div>
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
          <Link to="/path">Tüm yol</Link>
        </div>
        <div className="unit-strip" role="list">
          {COURSE_MAP.slice(0, 6).map((u) => {
            const open = u.available && unlocked.includes(u.id);
            return (
              <Link
                key={u.id}
                role="listitem"
                to={open ? `/path/${u.id}` : '/path'}
                className={`unit-pill ${open ? '' : 'locked'}`}
                aria-label={`${u.level} ${u.titleIt}${open ? '' : ', kilitli veya yakında'}`}
              >
                <span className="lvl">{u.level}</span>
                <span className="unit-pill-title">{u.titleIt}</span>
                <span className="unit-pill-sub muted small">{u.titleTr}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
