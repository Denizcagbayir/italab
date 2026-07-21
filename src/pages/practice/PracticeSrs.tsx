import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dueCards, reviewCard } from '../../lib/srs';
import { SpeakButton } from '../../components/speech/SpeakButton';
import { useProgress } from '../../store/progressStore';

export function PracticeSrs() {
  const srs = useProgress((s) => s.srs);
  const updateSrsCard = useProgress((s) => s.updateSrsCard);
  const due = dueCards(srs, 30);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = due[i];

  if (!due.length) {
    return (
      <div className="page">
        <Link to="/practice" className="back-link">
          ← Pratik
        </Link>
        <div className="empty-card">
          <h2>Tekrar yok</h2>
          <p>
            Derslerde yanlış veya doğru cevapladığın maddeler burada birikir.
            Önce bir ders bitir veya kelime pratiği yap.
          </p>
        </div>
      </div>
    );
  }

  const rate = (q: number) => {
    updateSrsCard(reviewCard(card, q));
    setFlipped(false);
    setI((x) => x + 1);
  };

  if (!card) {
    return (
      <div className="page">
        <Link to="/practice" className="back-link">
          ← Pratik
        </Link>
        <div className="empty-card">
          <h2>Tur bitti</h2>
          <p>Harika — bu turdaki kartları tamamladın.</p>
          <button className="btn primary" onClick={() => setI(0)}>
            Baştan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/practice" className="back-link">
        ← Pratik
      </Link>
      <header className="page-header">
        <h1>Aralıklı tekrar</h1>
        <p className="lede">
          {i + 1} / {due.length}
        </p>
      </header>
      <button
        className={`srs-card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(true)}
      >
        <div className="srs-front" lang="it">
          {card.front}
          <SpeakButton text={card.audioText ?? card.front} />
        </div>
        {flipped && <div className="srs-back">{card.back}</div>}
        {!flipped && <span className="muted">Çevirmek için dokun</span>}
      </button>
      {flipped && (
        <div className="srs-actions">
          <button className="btn bad" onClick={() => rate(1)}>
            Zor
          </button>
          <button className="btn ghost" onClick={() => rate(3)}>
            Orta
          </button>
          <button className="btn primary" onClick={() => rate(5)}>
            Kolay
          </button>
        </div>
      )}
    </div>
  );
}
