import { Link } from 'react-router-dom';
import { COURSE_MAP, getUnit } from '../data/course';
import { useProgress } from '../store/progressStore';
import { dueCards } from '../lib/srs';

export function ProgressPage() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const skills = useProgress((s) => s.skills);
  const lessons = useProgress((s) => s.lessons);
  const mistakes = useProgress((s) => s.mistakes);
  const srs = useProgress((s) => s.srs);
  const todayMinutes = useProgress((s) => s.todayMinutes);
  const dailyGoal = useProgress((s) => s.dailyGoalMinutes);

  const unit = getUnit('UNT-A1-00-BENVENUTI');
  const completedLessons = Object.values(lessons).filter((l) => l.completed).length;
  const openMistakes = mistakes.filter((m) => !m.resolved).length;
  const due = dueCards(srs).length;

  const skillEntries = Object.entries(skills) as [keyof typeof skills, number][];
  const labels: Record<string, string> = {
    listening: 'Dinleme',
    reading: 'Okuma',
    writing: 'Yazma',
    speaking: 'Konuşma',
    grammar: 'Gramer',
    vocab: 'Kelime',
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>İlerleme</h1>
        <p className="lede">Gelişimini buradan takip et.</p>
      </header>

      <div className="home-stats" aria-label="Özet">
        <div>
          <strong>{xp}</strong>
          <span>toplam XP</span>
        </div>
        <div>
          <strong>{streak}</strong>
          <span>gün seri</span>
        </div>
        <div>
          <strong>{completedLessons}</strong>
          <span>ders</span>
        </div>
        <div>
          <strong>
            {todayMinutes}/{dailyGoal}
          </strong>
          <span>dk bugün</span>
        </div>
      </div>

      <section className="skill-section">
        <h2>Beceriler</h2>
        {skillEntries.map(([k, v]) => (
          <div key={k} className="skill-bar">
            <div className="skill-label">
              <span>{labels[k]}</span>
              <span>{v}</span>
            </div>
            <div className="mini-bar">
              <div style={{ width: `${Math.min(100, v)}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="progress-panel">
        <h2>Ünite 0 — Benvenuti</h2>
        <ul className="progress-lessons">
          {unit?.lessons.map((l) => {
            const p = lessons[l.id];
            return (
              <li key={l.id}>
                <span>{l.titleTr}</span>
                <span className="muted">
                  {p?.completed ? `${p.bestAccuracy}%` : '—'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="progress-panel">
        <h2>Hızlı bağlantılar</h2>
        <div className="settings-actions">
          <Link className="btn ghost" to="/practice/srs">
            SRS {due ? `(${due} hazır)` : ''}
          </Link>
          <Link className="btn ghost" to="/practice/mistakes">
            Hatalar {openMistakes ? `(${openMistakes})` : ''}
          </Link>
          <Link className="btn ghost" to="/path">
            Yola git · {COURSE_MAP.filter((u) => u.available).length} aktif ünite
          </Link>
        </div>
      </section>
    </div>
  );
}
