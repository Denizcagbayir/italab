import { Link, useParams } from 'react-router-dom';
import { COURSE_MAP, getUnit, getUnitMeta, CURRICULUM_STATS } from '../data/course';
import { useProgress } from '../store/progressStore';

function kindLabel(kind?: string) {
  if (kind === 'mission') return 'Ünite görevi';
  if (kind === 'exam') return 'Sınav';
  if (kind === 'teaching') return 'Öğretim dersi';
  return 'Ders';
}

export function PathPage() {
  const { unitId } = useParams();
  const lessons = useProgress((s) => s.lessons);
  const unlocked = useProgress((s) => s.unlockedUnits);

  if (unitId) {
    const meta = COURSE_MAP.find((u) => u.id === unitId);
    const unit = getUnit(unitId);
    const unitMeta = getUnitMeta(unitId);
    if (!meta) return <p>Ünite bulunamadı.</p>;
    const isUnlocked = unlocked.includes(unitId);

    return (
      <div className="page">
        <Link to="/path" className="back-link">
          ← Yol
        </Link>
        <header className="page-header">
          <p className="eyebrow">
            {meta.level} · Ünite {meta.order}
          </p>
          <h1>{meta.titleIt}</h1>
          <p className="lede">{meta.titleTr} — {meta.outcomeTr}</p>
          <p className="muted small">{meta.grammarFocus.join(' · ')}</p>
          {unitMeta && (
            <div className="source-chip">
              <p>
                <strong>Öğrenci kitabı:</strong> s. {unitMeta.bookPages}
              </p>
              <p>
                <strong>Dilbilgisi başvuru:</strong> s. {unitMeta.grammarPages}
              </p>
              <p className="muted small">
                Kitaplar kapsam/sıra referansı; uygulama metinleri özgün içeriktir.
              </p>
            </div>
          )}
          {unitMeta?.missionTr && (
            <p className="mission-teaser">
              <strong>Ünite görevi:</strong> {unitMeta.missionTr}
            </p>
          )}
        </header>

        {unit && !isUnlocked ? (
          <div className="empty-card">
            <h2>Kilitli</h2>
            <p>Bu üniteyi açmak için önceki üniteyi tamamla.</p>
            <Link className="btn primary" to="/path">
              Yola dön
            </Link>
          </div>
        ) : !meta.available || !unit ? (
          <div className="empty-card">
            <h2>Yakında</h2>
            <p>Bu ünite henüz içerik dosyasına bağlı değil.</p>
            <Link className="btn primary" to="/path">
              Yola dön
            </Link>
          </div>
        ) : (
          <ol className="lesson-list">
            {unit.lessons.map((l, i) => {
              const prevDone =
                i === 0 ||
                unit.lessons.slice(0, i).every((x) => lessons[x.id]?.completed);
              const done = lessons[l.id]?.completed;
              const locked = !prevDone && !done;
              return (
                <li key={l.id} className={done ? 'done' : locked ? 'locked' : ''}>
                  {locked ? (
                    <div className="lesson-row">
                      <span className="num">{i + 1}</span>
                      <div>
                        <strong>{l.titleIt}</strong>
                        <span className="muted">
                          {kindLabel(l.kind)} · {l.titleTr}
                        </span>
                      </div>
                      <span className="lock">🔒</span>
                    </div>
                  ) : (
                    <Link className="lesson-row" to={`/lesson/${unit.id}/${l.id}`}>
                      <span className="num">{done ? '✓' : i + 1}</span>
                      <div>
                        <strong>{l.titleIt}</strong>
                        <span className="muted">
                          {kindLabel(l.kind)} · ~{l.estimatedMinutes} dk
                        </span>
                      </div>
                      {done && lessons[l.id] && (
                        <span className="acc">{lessons[l.id].bestAccuracy}%</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Yol</h1>
        <p className="lede">
          Müfredat v{CURRICULUM_STATS.version}: {CURRICULUM_STATS.instructionalLessons}{' '}
          öğretim dersi + ünite görevleri. Her ders anlatım, örnek, diyalog ve
          üretimle öğretir.
        </p>
      </header>
      <div className="path-tree">
        {COURSE_MAP.map((u) => {
          const open = u.available && (unlocked.includes(u.id) || Boolean(getUnit(u.id)));
          const unit = getUnit(u.id);
          const lockedForUser = Boolean(unit) && !unlocked.includes(u.id);
          const doneCount = unit
            ? unit.lessons.filter((l) => lessons[l.id]?.completed).length
            : 0;
          return (
            <Link
              key={u.id}
              to={`/path/${u.id}`}
              className={`path-node ${open && !lockedForUser ? 'open' : 'locked'}`}
            >
              <div className="path-node-top">
                <span className="lvl">{u.level}</span>
                {(!open || lockedForUser) && <span className="lock">🔒</span>}
              </div>
              <h2>{u.titleIt}</h2>
              <p>{u.titleTr}</p>
              {open && unit && !lockedForUser && (
                <div className="mini-bar">
                  <div
                    style={{
                      width: `${(doneCount / unit.lessons.length) * 100}%`,
                    }}
                  />
                </div>
              )}
              {lockedForUser && unit && (
                <p className="muted small">Önceki üniteyi bitirince açılır</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
