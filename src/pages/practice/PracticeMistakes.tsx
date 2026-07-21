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
        <p className="lede">
          Derslerde yanlış yaptığın maddeler burada. İncele, dinle, sonra
          “Çözüldü” de.
        </p>
      </header>
      {!open.length ? (
        <div className="empty-card">
          <h2>Açık hata yok</h2>
          <p className="lede">Şimdilik kayıtlı bir yanlışın yok. Böyle devam!</p>
          <Link className="btn primary" to="/practice">
            Pratiğe dön
          </Link>
        </div>
      ) : (
        <ul className="mistake-list">
          {open.map((m) => (
            <li key={m.id}>
              <p className="muted small">{m.prompt}</p>
              <p>
                Senin cevap: <em>{m.userAnswer}</em>
              </p>
              <p lang="it" className="mistake-expected">
                Doğru:{' '}
                <strong>{m.expected}</strong>{' '}
                <SpeakButton text={m.expected.split(' / ')[0]} small />
              </p>
              <button
                type="button"
                className="btn primary"
                onClick={() => resolveMistake(m.id)}
              >
                Çözüldü
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
