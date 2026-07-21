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
      title: 'Kelime',
      desc: 'İtalyanca ifadeyi gör, Türkçesini yaz.',
      meta: 'Sesli destek var',
      priority: false,
    },
    {
      to: 'articles',
      title: 'İsim & artikel',
      desc: 'İsimlerin artikelini ve çoğulunu çalış.',
      meta: 'Gramer temeli',
      priority: false,
    },
    {
      to: 'verbs',
      title: 'Fiil çekimi',
      desc: 'Presente (şimdiki zaman) çekimlerini yaz.',
      meta: 'Kişi + fiil',
      priority: false,
    },
    {
      to: 'srs',
      title: 'Aralıklı tekrar',
      desc: 'Öğrendiğin kelimeleri doğru zamanda hatırla.',
      meta: due ? `${due} kart seni bekliyor` : 'Şimdilik kart yok',
      priority: due > 0,
    },
    {
      to: 'mistakes',
      title: 'Hatalar',
      desc: 'Yanlış yaptığın maddeleri gözden geçir.',
      meta: openMistakes ? `${openMistakes} açık madde` : 'Hepsi temiz',
      priority: openMistakes > 0,
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <h1>Pratik</h1>
        <p className="lede">
          Dersi bitirdikten sonra buradan serbest çalış. İhtiyacın olanı seç —
          kelime, gramer veya tekrar.
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
