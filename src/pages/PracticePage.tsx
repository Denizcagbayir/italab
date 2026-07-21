import { Link, Routes, Route } from 'react-router-dom';
import { PracticeVocab } from './practice/PracticeVocab';
import { PracticeArticles } from './practice/PracticeArticles';
import { PracticeVerbs } from './practice/PracticeVerbs';
import { PracticeSrs } from './practice/PracticeSrs';
import { PracticeMistakes } from './practice/PracticeMistakes';
import { useProgress } from '../store/progressStore';
import { dueCards } from '../lib/srs';

function PracticeHome() {
  const mistakes = useProgress((s) => s.mistakes);
  const srs = useProgress((s) => s.srs);
  const openMistakes = mistakes.filter((m) => !m.resolved).length;
  const due = dueCards(srs).length;

  const cards = [
    {
      to: 'vocab',
      title: 'Kelime & cümle',
      desc: '666+ ifade · IT → TR çeviri',
      meta: 'Sesli pratik',
      priority: false,
    },
    {
      to: 'articles',
      title: 'İsim & artikel',
      desc: '888 isim · tekil ↔ çoğul',
      meta: 'Artikel zorunlu',
      priority: false,
    },
    {
      to: 'verbs',
      title: 'Fiil çekimi',
      desc: 'Presente indicativo',
      meta: '606 biçim',
      priority: false,
    },
    {
      to: 'srs',
      title: 'Aralıklı tekrar',
      desc: 'SRS flashcard',
      meta: due ? `${due} kart hazır` : 'Kart yok / hepsi güncel',
      priority: due > 0,
    },
    {
      to: 'mistakes',
      title: 'Hatalar',
      desc: 'Yanlışlarını düzelt',
      meta: openMistakes ? `${openMistakes} açık` : 'Temiz',
      priority: openMistakes > 0,
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <h1>Pratik</h1>
        <p className="lede">
          Serbest alıştırma — kelime, artikel, fiil, tekrar ve hatalar.
        </p>
      </header>
      <div className="practice-grid">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`practice-card${c.priority ? ' priority' : ''}`}
          >
            <div className="practice-card-top">
              <h2>{c.title}</h2>
              {c.priority && <span className="badge">Şimdi</span>}
            </div>
            <p>{c.desc}</p>
            <span className="meta">{c.meta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PracticePage() {
  return (
    <Routes>
      <Route index element={<PracticeHome />} />
      <Route path="vocab" element={<PracticeVocab />} />
      <Route path="articles" element={<PracticeArticles />} />
      <Route path="verbs" element={<PracticeVerbs />} />
      <Route path="srs" element={<PracticeSrs />} />
      <Route path="mistakes" element={<PracticeMistakes />} />
    </Routes>
  );
}
