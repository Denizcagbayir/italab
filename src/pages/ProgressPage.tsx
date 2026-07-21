import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COURSE_MAP, getUnit } from '../data/course';
import { UNIT_META } from '../data/unitsMeta';
import { useProgress } from '../store/progressStore';
import { dueCards } from '../lib/srs';

const SKILL_LABELS: Record<string, string> = {
  listening: 'Dinleme',
  reading: 'Okuma',
  writing: 'Yazma',
  speaking: 'Konuşma',
  grammar: 'Gramer',
  vocab: 'Kelime',
};

function RingChart({
  value,
  max,
  label,
  sub,
}: {
  value: number;
  max: number;
  label: string;
  sub: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="ring-chart">
      <svg viewBox="0 0 100 100" className="ring-svg" aria-hidden>
        <circle className="ring-track" cx="50" cy="50" r={r} />
        <motion.circle
          className="ring-value"
          cx="50"
          cy="50"
          r={r}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="ring-center">
        <strong>{pct}%</strong>
        <span>{label}</span>
      </div>
      <p className="ring-sub">{sub}</p>
    </div>
  );
}

export function ProgressPage() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const skills = useProgress((s) => s.skills);
  const lessons = useProgress((s) => s.lessons);
  const mistakes = useProgress((s) => s.mistakes);
  const srs = useProgress((s) => s.srs);
  const todayMinutes = useProgress((s) => s.todayMinutes);
  const dailyGoal = useProgress((s) => s.dailyGoalMinutes);
  const todayXp = useProgress((s) => s.todayXp);

  const unit = getUnit('UNT-A1-00-BENVENUTI');
  const completedLessons = Object.values(lessons).filter((l) => l.completed).length;
  const openMistakes = mistakes.filter((m) => !m.resolved).length;
  const due = dueCards(srs).length;
  const unitDone = unit
    ? unit.lessons.filter((l) => lessons[l.id]?.completed).length
    : 0;
  const unitTotal = unit?.lessons.length ?? 1;
  const unitPct = Math.round((unitDone / unitTotal) * 100);

  const skillEntries = (
    Object.entries(skills) as [keyof typeof skills, number][]
  ).sort((a, b) => b[1] - a[1]);

  const summary = [
    { label: 'Toplam XP', value: xp, hint: 'Tüm zamandan' },
    { label: 'Seri', value: `${streak} gün`, hint: 'Üst üste çalıştığın gün' },
    { label: 'Ders', value: completedLessons, hint: 'Tamamlanan ders' },
    { label: 'Bugün XP', value: todayXp, hint: 'Bugünkü kazanım' },
  ];

  return (
    <div className="page progress-page">
      <header className="page-header">
        <h1>İlerleme</h1>
        <p className="lede">
          Günlük hedefini, becerilerini ve ünite ilerlemeni buradan takip et.
          Eksik hissettiğin yere pratikten devam edebilirsin.
        </p>
      </header>

      <section className="progress-hero-cards">
        <motion.div
          className="progress-panel ring-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2>Bugünkü hedef</h2>
          <RingChart
            value={todayMinutes}
            max={dailyGoal}
            label="hedef"
            sub={`${todayMinutes} / ${dailyGoal} dakika`}
          />
        </motion.div>

        <motion.div
          className="progress-panel ring-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <h2>Ünite 0</h2>
          <RingChart
            value={unitDone}
            max={unitTotal}
            label="ders"
            sub={`${unitDone} / ${unitTotal} tamamlandı`}
          />
          <div className="mini-bar unit-progress-bar" aria-hidden>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${unitPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </section>

      <section className="progress-stat-grid" aria-label="Özet">
        {summary.map((item, i) => (
          <motion.div
            key={item.label}
            className="progress-stat-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
          >
            <span className="progress-stat-label">{item.label}</span>
            <strong className="progress-stat-value">{item.value}</strong>
            <span className="progress-stat-hint">{item.hint}</span>
          </motion.div>
        ))}
      </section>

      <motion.section
        className="progress-panel skill-chart"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="section-head">
          <h2>Beceri haritası</h2>
          <span className="muted small">0–100 puan</span>
        </div>
        <p className="section-desc skill-chart-intro">
          Her bar, o becerideki puanının 100 üzerinden payını gösterir. Ders
          bitirdikçe dolar — 19 puan ≈ çubuğun beşte biri.
        </p>
        <div className="skill-chart-list">
          {skillEntries.map(([k, v], i) => {
            const score = Math.max(0, Math.min(100, v));
            // Absolute 0–100 scale (not relative to the highest skill)
            const width = score;
            return (
              <div key={k} className="skill-chart-row">
                <div className="skill-chart-meta">
                  <span>{SKILL_LABELS[k]}</span>
                  <strong>
                    {score}
                    <span className="skill-score-max">/100</span>
                  </strong>
                </div>
                <div
                  className="skill-chart-track"
                  role="meter"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${SKILL_LABELS[k]} ${score} üzerinden 100`}
                >
                  <motion.div
                    className={`skill-chart-fill skill-${k}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.05 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        className="progress-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-head">
          <h2>Ünite 0 — Benvenuti (öğretim)</h2>
          <Link to="/path/UNT-A1-00-BENVENUTI">Derse git</Link>
        </div>
        <ul className="lesson-chip-list">
          {unit?.lessons.map((l, i) => {
            const p = lessons[l.id];
            const done = Boolean(p?.completed);
            return (
              <motion.li
                key={l.id}
                className={`lesson-chip ${done ? 'done' : ''}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.22 + i * 0.03 }}
              >
                <span className="lesson-chip-num">{done ? '✓' : i + 1}</span>
                <div>
                  <strong>{l.titleTr}</strong>
                  <span className="muted small">
                    {done ? `En iyi: %${p?.bestAccuracy}` : 'Henüz tamamlanmadı'}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </motion.section>

      <motion.section
        className="progress-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2>Şimdi ne yapmalısın?</h2>
        <div className="next-actions">
          <Link
            className={`next-action-card${due ? ' hot' : ''}`}
            to="/practice/srs"
          >
            <strong>Aralıklı tekrar</strong>
            <span>
              {due
                ? `${due} kart seni bekliyor`
                : 'Şimdilik kart yok — dersten sonra dolacak'}
            </span>
          </Link>
          <Link
            className={`next-action-card${openMistakes ? ' hot' : ''}`}
            to="/practice/mistakes"
          >
            <strong>Hatalar</strong>
            <span>
              {openMistakes
                ? `${openMistakes} maddeyi gözden geçir`
                : 'Açık hata yok — harika'}
            </span>
          </Link>
          <Link className="next-action-card" to="/path">
            <strong>Öğrenme yolu</strong>
            <span>
              {COURSE_MAP.filter((u) => u.available).length} aktif ünite
            </span>
          </Link>
        </div>
      </motion.section>

      <motion.section
        className="progress-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Kaynak eşlemesi</h2>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Kitaplar kapsam ve sıra için referans; uygulama metinleri özgün. Telif:
          sayfa/ses/soru kopyalanmaz.
        </p>
        <div className="source-matrix">
          {UNIT_META.map((u) => (
            <div key={u.id} className="source-matrix-row">
              <div>
                <strong>
                  {u.level} · {u.titleIt}
                </strong>
                <span className="muted small">{u.titleTr}</span>
              </div>
              <div className="source-matrix-pages">
                <span>Kitap s. {u.bookPages}</span>
                <span>Gramer s. {u.grammarPages}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
