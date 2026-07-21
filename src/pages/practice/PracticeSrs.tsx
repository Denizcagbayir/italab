import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dueCards, reviewCard } from '../../lib/srs';
import { SpeakButton } from '../../components/speech/SpeakButton';
import { useProgress } from '../../store/progressStore';

export function PracticeSrs() {
  const srs = useProgress((s) => s.srs);
  const updateSrsCard = useProgress((s) => s.updateSrsCard);
  const hydrateDay = useProgress((s) => s.hydrateDay);
  const due = dueCards(srs, 30);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = due[i];

  useEffect(() => {
    hydrateDay();
  }, [hydrateDay]);

  if (!due.length) {
    return (
      <div className="page">
        <Link to="/practice" className="back-link">
          ← Pratik
        </Link>
        <div className="empty-card">
          <h2>Şimdilik tekrar yok</h2>
          <p className="lede">
            Derslerde gördüğün kelimeler burada birikir. Önce bir derse gir veya
            Kelime pratiği yap; sonra buraya dön.
          </p>
          <div className="settings-actions">
            <Link className="btn primary" to="/path">
              Yola git
            </Link>
            <Link className="btn secondary" to="/practice/vocab">
              Kelime pratiği
            </Link>
          </div>
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
          <p className="lede">Bu turdaki kartları tamamladın. İyi iş!</p>
          <div className="settings-actions">
            <button type="button" className="btn primary" onClick={() => setI(0)}>
              Başa dön
            </button>
            <Link className="btn secondary" to="/practice">
              Pratiğe dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page srs-page">
      <Link to="/practice" className="back-link">
        ← Pratik
      </Link>
      <header className="page-header">
        <h1>Aralıklı tekrar</h1>
        <p className="lede">
          İtalyanca ifadeyi gör, anlamını hatırla, kartı aç. Sonra ne kadar
          kolay geldiğini söyle — böylece doğru zamanda tekrar ederiz.
        </p>
        <p className="progress-meta-line">
          Kart {i + 1} / {due.length}
        </p>
      </header>

      <button
        type="button"
        className={`srs-card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(true)}
        aria-expanded={flipped}
      >
        <div className="srs-front" lang="it">
          <span className="srs-word">{card.front}</span>
          <SpeakButton text={card.audioText ?? card.front} small />
        </div>
        {flipped ? (
          <div className="srs-back">
            <span className="srs-back-label">Anlam</span>
            <strong>{card.back}</strong>
          </div>
        ) : (
          <span className="srs-hint">Anlamı görmek için dokun</span>
        )}
      </button>

      {flipped && (
        <div className="srs-actions" role="group" aria-label="Ne kadar kolay geldi?">
          <button type="button" className="btn secondary" onClick={() => rate(1)}>
            <span className="btn-title">Hatırlamadım</span>
            <span className="btn-sub">Yakında tekrar</span>
          </button>
          <button type="button" className="btn ghost" onClick={() => rate(3)}>
            <span className="btn-title">Zorlandım</span>
            <span className="btn-sub">Biraz düşündüm</span>
          </button>
          <button type="button" className="btn primary" onClick={() => rate(5)}>
            <span className="btn-title">Kolayca hatırladım</span>
            <span className="btn-sub">Sonraki güne bırak</span>
          </button>
        </div>
      )}
    </div>
  );
}
