import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import verbs from '../../data/verbs-presente.json';
import { answersMatch, shuffle } from '../../lib/normalize';
import { SpeakButton } from '../../components/speech/SpeakButton';
import { useProgress } from '../../store/progressStore';

type Verb = {
  lemma: string;
  conjugation: string;
  person: string;
  form: string;
  tr: string;
};

const ALL = verbs as Verb[];

export function PracticeVerbs() {
  const settings = useProgress((s) => s.settings);
  const [n, setN] = useState(12);
  const [session, setSession] = useState(() => shuffle(ALL).slice(0, 12));
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const rebuild = () => {
    setSession(shuffle(ALL).slice(0, n));
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
        answersMatch(a, [item.form], {
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
        <h1>Fiil çekimi · Presente</h1>
        <p className="lede">
          Fiilin kökünü ve kişiyi gör, presente biçimini yaz (ör. parlare →
          parlo).
        </p>
      </header>
      <div className="toolbar">
        <select value={n} onChange={(e) => setN(Number(e.target.value))}>
          {[8, 12, 20, 30].map((x) => (
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
            answersMatch(a, [item.form], {
              ignoreCase: settings.ignoreCase,
              ignoreAccents: settings.ignoreAccents,
            });
          return (
            <div key={`${item.lemma}-${item.person}-${i}`} className="drill-row">
              <div className="q">
                <span lang="it">
                  <strong>{item.lemma}</strong> ({item.conjugation}) · {item.person}
                </span>
                {item.tr && <em className="tag">{item.tr}</em>}
              </div>
              <input
                value={a}
                lang="it"
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder="biçim…"
              />
              <div className="status">
                {filled ? (ok ? '✔' : '✘') : ''}
                <SpeakButton text={item.form} small />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
