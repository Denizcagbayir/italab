import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import articles from '../../data/articles.json';
import { answersMatch, shuffle } from '../../lib/normalize';
import { SpeakButton } from '../../components/speech/SpeakButton';
import { useProgress } from '../../store/progressStore';

type Art = {
  singular: string;
  plural: string;
  tr: string;
  gender: string;
  variation: string;
};

const ALL = articles as Art[];

export function PracticeArticles() {
  const settings = useProgress((s) => s.settings);
  const [mode, setMode] = useState<'s2p' | 'p2s' | 'mix'>('mix');
  const [n, setN] = useState(15);
  const [session, setSession] = useState(() => build(15, 'mix'));
  const [answers, setAnswers] = useState<Record<number, string>>({});

  function build(count: number, m: typeof mode) {
    return shuffle(ALL)
      .slice(0, count)
      .map((item) => {
        const dir =
          m === 'mix' ? (Math.random() < 0.5 ? 's2p' : 'p2s') : m;
        return {
          ...item,
          dir: dir as 's2p' | 'p2s',
          q: dir === 's2p' ? item.singular : item.plural,
          a: dir === 's2p' ? item.plural : item.singular,
        };
      });
  }

  const rebuild = () => {
    setSession(build(n, mode));
    setAnswers({});
  };

  const stats = useMemo(() => {
    let ok = 0;
    let filled = 0;
    session.forEach((item, i) => {
      const a = answers[i]?.trim();
      if (!a) return;
      filled++;
      if (
        answersMatch(a, [item.a], {
          ignoreCase: settings.ignoreCase,
          ignoreAccents: settings.ignoreAccents,
        })
      )
        ok++;
    });
    return { ok, filled, rate: filled ? Math.round((ok / filled) * 100) : 0 };
  }, [answers, session, settings]);

  return (
    <div className="page practice-drill">
      <Link to="/practice" className="back-link">
        ← Pratik
      </Link>
      <header className="page-header">
        <h1>İsim & artikel</h1>
        <p className="lede">
          İsmi gör, artikelini koruyarak tekil veya çoğul biçimi yaz.
        </p>
      </header>
      <div className="toolbar">
        <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
          <option value="s2p">Tekil → Çoğul</option>
          <option value="p2s">Çoğul → Tekil</option>
          <option value="mix">Karışık</option>
        </select>
        <select value={n} onChange={(e) => setN(Number(e.target.value))}>
          {[10, 15, 25, 40].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <button className="btn primary" onClick={rebuild}>
          Yeni set
        </button>
        <span className="pill">
          {stats.ok}/{stats.filled} · %{stats.rate}
        </span>
      </div>
      <div className="drill-table">
        {session.map((item, i) => {
          const a = answers[i] ?? '';
          const filled = a.trim().length > 0;
          const ok =
            filled &&
            answersMatch(a, [item.a], {
              ignoreCase: settings.ignoreCase,
              ignoreAccents: settings.ignoreAccents,
            });
          return (
            <div key={`${item.q}-${i}`} className="drill-row">
              <div className="q">
                <span lang="it">{item.q}</span>
                <SpeakButton text={item.q} small />
                <em className="tag">
                  {item.gender} · {item.tr}
                </em>
              </div>
              <input
                value={a}
                lang="it"
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder={item.dir === 's2p' ? 'çoğul…' : 'tekil…'}
              />
              <div className="status">
                {filled ? (ok ? '✔' : '✘') : ''}
                {!ok && filled && (
                  <button
                    className="speak-btn small"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [i]: item.a }))
                    }
                    title="Cevabı doldur"
                  >
                    ?
                  </button>
                )}
                <SpeakButton text={item.a} small />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
