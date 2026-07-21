import { useMemo, useState } from 'react';
import type { Exercise } from '../../types/curriculum';
import { answersMatch, softMatch, shuffle, turkishIncludesAny } from '../../lib/normalize';
import { transcriptMatchScore, listenOnce, isAsrSupported } from '../../lib/asr';
import { SpeakButton } from '../speech/SpeakButton';
import { useProgress } from '../../store/progressStore';

type Props = {
  exercise: Exercise;
  onResult: (ok: boolean, detail?: { userAnswer: string; expected: string }) => void;
};

export function ExerciseView({ exercise, onResult }: Props) {
  const settings = useProgress((s) => s.settings);
  const speakEnabled = useProgress((s) => s.speakEnabled);
  const opts = {
    ignoreCase: settings.ignoreCase,
    ignoreAccents: settings.ignoreAccents,
  };

  switch (exercise.type) {
    case 'EXPLAIN':
      return <Explain ex={exercise} onResult={onResult} />;
    case 'WORD_MATCH':
      return <WordMatch ex={exercise} onResult={onResult} />;
    case 'MCQ':
    case 'AUDIO_WORD':
    case 'MINIMAL_PAIR':
    case 'DIALOGUE_CHOICE':
      return <ChoiceEx ex={exercise} onResult={onResult} opts={opts} />;
    case 'CLOZE':
      return <ClozeEx ex={exercise} onResult={onResult} opts={opts} />;
    case 'WORD_BANK':
    case 'ORDER_SENTENCE':
      return <WordBankEx ex={exercise} onResult={onResult} opts={opts} />;
    case 'FREE_TRANSLATION':
    case 'DICTATION':
    case 'TRANSFORM':
    case 'CONJUGATE':
    case 'WRITE_SENTENCE':
      return <TextEx ex={exercise} onResult={onResult} opts={opts} />;
    case 'SPEAK_SENTENCE':
    case 'LISTEN_REPEAT':
    case 'OPEN_SPEAK':
      return (
        <SpeakEx
          ex={exercise}
          onResult={onResult}
          speakEnabled={speakEnabled}
        />
      );
    default:
      return (
        <p className="muted">Bu egzersiz tipi henüz desteklenmiyor: {exercise.type}</p>
      );
  }
}

function Explain({
  ex,
  onResult,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
}) {
  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      {ex.dialogue && (
        <div className="dialogue">
          {ex.dialogue.map((l, i) => (
            <div key={i} className="dialogue-line">
              <strong>{l.speaker}:</strong> <span lang="it">{l.text}</span>
              {l.tr && <em className="muted"> — {l.tr}</em>}
              <SpeakButton text={l.text} />
            </div>
          ))}
        </div>
      )}
      <pre className="explain-body">{ex.explanation}</pre>
      <div className="ex-actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => onResult(true, { userAnswer: 'ok', expected: 'ok' })}
        >
          Anladım, devam
        </button>
      </div>
    </div>
  );
}

function WordMatch({
  ex,
  onResult,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
}) {
  const pairs = ex.pairs ?? [];
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [ex.id]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  const done = Object.keys(matched).length === pairs.length;

  const pickRight = (right: string) => {
    if (!selectedLeft || matched[selectedLeft]) return;
    const ok = pairs.find((p) => p.left === selectedLeft)?.right === right;
    if (ok) {
      const next = { ...matched, [selectedLeft]: right };
      setMatched(next);
      setSelectedLeft(null);
      if (Object.keys(next).length === pairs.length) {
        onResult(true, { userAnswer: 'match', expected: 'match' });
      }
    } else {
      setWrongFlash(right);
      setTimeout(() => setWrongFlash(null), 450);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      <div className="match-grid">
        <div className="match-col">
          {pairs.map((p) => (
            <button
              key={p.left}
              className={`chip ${selectedLeft === p.left ? 'selected' : ''} ${matched[p.left] ? 'done' : ''}`}
              disabled={Boolean(matched[p.left]) || done}
              onClick={() => setSelectedLeft(p.left)}
            >
              <span lang="it">{p.left}</span>
              <SpeakButton text={p.left} small />
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map((r) => {
            const used = Object.values(matched).includes(r);
            return (
              <button
                key={r}
                className={`chip ${wrongFlash === r ? 'bad' : ''} ${used ? 'done' : ''}`}
                disabled={used || done || !selectedLeft}
                onClick={() => pickRight(r)}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChoiceEx({
  ex,
  onResult,
  opts,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
  opts: { ignoreCase: boolean; ignoreAccents: boolean };
}) {
  const options = useMemo(() => shuffle(ex.options ?? []), [ex.id]);
  const [picked, setPicked] = useState<string | null>(null);
  const audio = ex.audioText;

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const ok = answersMatch(opt, ex.acceptedAnswers ?? [opt], opts);
    setTimeout(() => {
      onResult(ok, {
        userAnswer: opt,
        expected: (ex.acceptedAnswers ?? []).join(' / '),
      });
    }, 450);
  };

  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      {ex.dialogue?.map((l, i) => (
        <p key={i} className="dialogue-line">
          <strong>{l.speaker}:</strong> <span lang="it">{l.text}</span>
        </p>
      ))}
      {audio && (
        <div className="audio-row">
          <SpeakButton text={audio} label="Dinle" />
          <SpeakButton text={audio} rate={0.75} label="Yavaş" />
        </div>
      )}
      <div className="choice-list">
        {options.map((opt) => {
          const isCorrect =
            picked && answersMatch(opt, ex.acceptedAnswers ?? [], opts);
          return (
            <button
              key={opt}
              className={`choice ${picked === opt ? (isCorrect ? 'ok' : 'bad') : ''} ${isCorrect && picked ? 'ok' : ''}`}
              onClick={() => choose(opt)}
              disabled={Boolean(picked)}
            >
              <span lang="it">{opt}</span>
            </button>
          );
        })}
      </div>
      {ex.hint && !picked && <p className="hint">{ex.hint}</p>}
    </div>
  );
}

function ClozeEx({
  ex,
  onResult,
  opts,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
  opts: { ignoreCase: boolean; ignoreAccents: boolean };
}) {
  const blanks = ex.blanks ?? [];
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ''));

  const submit = () => {
    const expected = blanks.map((b) => b.answer);
    let allOk = true;
    values.forEach((v, i) => {
      if (!answersMatch(v, [expected[i]], opts)) allOk = false;
    });
    onResult(allOk, {
      userAnswer: values.join(' | '),
      expected: expected.join(' | '),
    });
  };

  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      <div className="cloze-block" lang="it">
        {blanks.map((b, i) => (
          <p key={i} className="cloze-line">
            {b.before}
            <input
              value={values[i]}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                setValues(next);
              }}
              className="cloze-input"
              autoCapitalize="off"
              autoCorrect="off"
            />
            {b.after}
          </p>
        ))}
      </div>
      {ex.hint && <p className="hint">{ex.hint}</p>}
      <div className="ex-actions">
        <button type="button" className="btn primary" onClick={submit}>
          Kontrol et
        </button>
      </div>
    </div>
  );
}

function WordBankEx({
  ex,
  onResult,
  opts,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
  opts: { ignoreCase: boolean; ignoreAccents: boolean };
}) {
  const pool = useMemo(
    () => shuffle([...(ex.tokens ?? []), ...(ex.distractors ?? [])]),
    [ex.id],
  );
  const [built, setBuilt] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(pool);

  const add = (tok: string, idx: number) => {
    setBuilt((b) => [...b, tok]);
    setRemaining((r) => r.filter((_, i) => i !== idx));
  };
  const remove = (idx: number) => {
    const tok = built[idx];
    setBuilt((b) => b.filter((_, i) => i !== idx));
    setRemaining((r) => [...r, tok]);
  };

  const submit = () => {
    const sentence = built.join(' ').replace(/\s+([?.!,])/g, '$1');
    const ok = answersMatch(sentence, ex.acceptedAnswers ?? [], opts);
    onResult(ok, {
      userAnswer: sentence,
      expected: (ex.acceptedAnswers ?? []).join(' / '),
    });
  };

  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      <div className="bank-built" lang="it">
        {built.length === 0 && <span className="muted">Kelimeleri seç…</span>}
        {built.map((t, i) => (
          <button key={`${t}-${i}`} className="chip selected" onClick={() => remove(i)}>
            {t}
          </button>
        ))}
      </div>
      <div className="bank-pool">
        {remaining.map((t, i) => (
          <button key={`${t}-${i}`} className="chip" onClick={() => add(t, i)}>
            {t}
          </button>
        ))}
      </div>
      <div className="ex-actions">
        <button
          type="button"
          className="btn primary"
          onClick={submit}
          disabled={!built.length}
        >
          Kontrol et
        </button>
      </div>
    </div>
  );
}

function TextEx({
  ex,
  onResult,
  opts,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
  opts: { ignoreCase: boolean; ignoreAccents: boolean };
}) {
  const [value, setValue] = useState('');
  const showAudio = Boolean(ex.audioText) || ex.type === 'DICTATION';

  const submit = () => {
    const accepted = ex.acceptedAnswers ?? [];
    let match = softMatch(value, accepted, opts);

    // WRITE_SENTENCE / soft production: any accepted keyword present
    if (
      match === false &&
      (ex.type === 'WRITE_SENTENCE' || (ex.explanation && accepted.length <= 3))
    ) {
      const soft =
        turkishIncludesAny(value, accepted) ||
        accepted.some((a) => value.toLowerCase().includes(a.toLowerCase()));
      if (soft && value.trim().length >= 8) match = 'exact';
    }

    const pass = match === 'exact' || match === 'typo';
    onResult(pass, {
      userAnswer: value,
      expected: accepted.join(' / '),
    });
  };

  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      {ex.transformFrom && (
        <p className="prompt-it" lang="it">
          {ex.transformFrom} <SpeakButton text={ex.transformFrom} small />
        </p>
      )}
      {ex.lemma && (
        <p className="prompt-it">
          <span lang="it">{ex.lemma}</span> — <strong>{ex.person}</strong>
        </p>
      )}
      {showAudio && ex.audioText && (
        <div className="audio-row">
          <SpeakButton text={ex.audioText} label="Dinle" />
          <SpeakButton text={ex.audioText} rate={0.75} label="Yavaş" />
        </div>
      )}
      <input
        className="text-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Cevabını yaz…"
        lang="it"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {ex.hint && <p className="hint">{ex.hint}</p>}
      <div className="ex-actions">
        <button
          type="button"
          className="btn primary"
          onClick={submit}
          disabled={!value.trim()}
        >
          Kontrol et
        </button>
      </div>
    </div>
  );
}

function SpeakEx({
  ex,
  onResult,
  speakEnabled,
}: {
  ex: Exercise;
  onResult: Props['onResult'];
  speakEnabled: boolean;
}) {
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState<'info' | 'ok' | 'bad' | 'warn'>(
    'info',
  );
  const [heard, setHeard] = useState('');
  const [listening, setListening] = useState(false);
  const target = ex.audioText ?? ex.acceptedAnswers?.[0] ?? '';

  const skip = () => {
    onResult(true, { userAnswer: '(pas)', expected: target });
  };

  const start = async () => {
    if (!isAsrSupported()) {
      setStatusKind('warn');
      setStatus(
        'Bu tarayıcıda konuşma tanıma yok. Pas ile devam edebilirsin.',
      );
      return;
    }
    setListening(true);
    setStatusKind('info');
    setStatus('Dinleniyor… şimdi konuş.');
    setHeard('');
    try {
      const res = await listenOnce('it-IT');
      setHeard(res.transcript);
      const score = transcriptMatchScore(target, res.transcript);
      const coverage =
        ex.targetCoverage?.every((t) =>
          res.transcript.toLowerCase().includes(t.toLowerCase()),
        ) ?? false;
      const ok =
        ex.type === 'OPEN_SPEAK'
          ? coverage || score >= 0.45
          : score >= 0.72;
      setStatusKind(ok ? 'ok' : 'bad');
      setStatus(
        ok
          ? `Güzel! Benzerlik %${Math.round(score * 100)}`
          : `Tekrar dene — benzerlik %${Math.round(score * 100)}`,
      );
      onResult(ok, { userAnswer: res.transcript, expected: target });
    } catch (e) {
      setStatusKind('warn');
      setStatus(e instanceof Error ? e.message : 'Bir sorun oluştu.');
    } finally {
      setListening(false);
    }
  };

  return (
    <div className="ex-card">
      <h2 className="ex-prompt">{ex.promptTr}</h2>
      {target && (
        <p className="prompt-it" lang="it">
          {target} <SpeakButton text={target} small />
        </p>
      )}
      <div className="ex-actions">
        <div className="audio-row">
          <SpeakButton text={target} label="Modeli dinle" />
          <SpeakButton text={target} rate={0.75} label="Yavaş" />
        </div>
        {speakEnabled ? (
          <button
            className="btn primary"
            onClick={start}
            disabled={listening}
          >
            {listening ? 'Dinleniyor…' : 'Mikrofon — Konuş'}
          </button>
        ) : (
          <p className="status-msg warn">
            Konuşma alıştırmaları Ayarlar’dan kapalı.
          </p>
        )}
        <button className="btn ghost" onClick={skip} disabled={listening}>
          Şu an konuşamam — Pas
        </button>
      </div>
      {status && (
        <p className={`status-msg ${statusKind}`} role="status">
          {status}
        </p>
      )}
      {heard && (
        <p className="muted small">
          Algılanan: <span lang="it">{heard}</span>
        </p>
      )}
    </div>
  );
}
