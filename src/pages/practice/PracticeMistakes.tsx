import { Link } from 'react-router-dom';
import { SpeakButton } from '../../components/speech/SpeakButton';
import { useProgress } from '../../store/progressStore';

export function PracticeMistakes() {
  const mistakes = useProgress((s) => s.mistakes);
  const resolveMistake = useProgress((s) => s.resolveMistake);
  const open = mistakes.filter((m) => !m.resolved);

  return (
    <div className="page">
      <Link to="/practice" className="back-link">
        ← Pratik
      </Link>
      <header className="page-header">
        <h1>Hatalar</h1>
        <p className="lede">{open.length} açık hata</p>
      </header>
      {!open.length ? (
        <div className="empty-card">
          <h2>Temiz</h2>
          <p>Şimdilik kayıtlı açık hata yok.</p>
        </div>
      ) : (
        <ul className="mistake-list">
          {open.map((m) => (
            <li key={m.id}>
              <p className="muted small">{m.type}</p>
              <p>{m.prompt}</p>
              <p>
                Senin: <em>{m.userAnswer}</em>
              </p>
              <p lang="it">
                Doğru: <strong>{m.expected}</strong>{' '}
                <SpeakButton text={m.expected.split(' / ')[0]} small />
              </p>
              <button className="btn primary" onClick={() => resolveMistake(m.id)}>
                Anladım / çözüldü
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
