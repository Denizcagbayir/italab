import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getTeachingLesson,
  getUnitMeta,
  skillsFromTeaching,
} from '../../data/course';
import { LESSON_PASS } from '../../data/unitsMeta';
import { SpeakButton } from '../speech/SpeakButton';
import { useProgress } from '../../store/progressStore';
import { createCard } from '../../lib/srs';

type StepId =
  | 'context'
  | 'instruction'
  | 'examples'
  | 'vocab'
  | 'dialogue'
  | 'noticing'
  | 'checks'
  | 'errors'
  | 'practice'
  | 'production'
  | 'done';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'context', label: 'Bağlam' },
  { id: 'instruction', label: 'Anlatım' },
  { id: 'examples', label: 'Örnekler' },
  { id: 'vocab', label: 'Kelimeler' },
  { id: 'dialogue', label: 'Diyalog' },
  { id: 'noticing', label: 'Fark ettirme' },
  { id: 'checks', label: 'Mini kontrol' },
  { id: 'errors', label: 'Hata kliniği' },
  { id: 'practice', label: 'Alıştırma' },
  { id: 'production', label: 'Üretim' },
  { id: 'done', label: 'Özet' },
];

type Props = {
  unitId: string;
  lessonId: string;
};

function parseDialogueLine(line: string) {
  const idx = line.indexOf(':');
  if (idx === -1) return { speaker: '', text: line };
  return {
    speaker: line.slice(0, idx).trim(),
    text: line.slice(idx + 1).trim(),
  };
}

function blankExample(it: string, vocabIt: string): { prompt: string; answer: string } | null {
  const token = vocabIt.split(/[/,]/)[0]?.trim();
  if (!token || token.length < 2) return null;
  const re = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (!re.test(it)) return null;
  return {
    prompt: it.replace(re, '______'),
    answer: token,
  };
}

export function TeachingPlayer({ unitId, lessonId }: Props) {
  const lesson = getTeachingLesson(lessonId);
  const meta = getUnitMeta(unitId);
  const recordLessonComplete = useProgress((s) => s.recordLessonComplete);
  const addMistake = useProgress((s) => s.addMistake);
  const srs = useProgress((s) => s.srs);
  const addStudyMinutes = useProgress((s) => s.addStudyMinutes);

  const [step, setStep] = useState(0);
  const [checkIndex, setCheckIndex] = useState(0);
  const [checkCorrect, setCheckCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [noticePick, setNoticePick] = useState<string | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [practiceOk, setPracticeOk] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [productionNote, setProductionNote] = useState('');
  const [finished, setFinished] = useState(false);
  const [startedAt] = useState(Date.now());

  const stepId = STEPS[step]?.id ?? 'context';
  const progressPct = ((step + 1) / STEPS.length) * 100;

  const skills = useMemo(
    () => (lesson ? skillsFromTeaching(lesson) : []),
    [lesson],
  );

  const practice = useMemo(() => {
    if (!lesson) return null;
    for (const [it] of lesson.examples) {
      for (const [v] of lesson.vocab) {
        const hit = blankExample(it, v);
        if (hit) return hit;
      }
    }
    const first = lesson.examples[0];
    if (!first) return null;
    const words = first[0].split(/\s+/).filter((w) => w.length > 3);
    const target = words[Math.min(1, words.length - 1)]?.replace(/[.,!?«»]/g, '');
    if (!target) return null;
    return {
      prompt: first[0].replace(target, '______'),
      answer: target,
    };
  }, [lesson]);

  const noticeOptions = useMemo(() => {
    if (!lesson?.rules.length) return [];
    const correct = lesson.rules[0];
    const distractors = lesson.rules.slice(1, 3);
    const pool = [...distractors, correct].slice(0, 3);
    if (pool.length < 2) {
      return [
        correct,
        'Bu derste sabit bir dilbilgisi kuralı yok; kalıpları ezberle.',
      ];
    }
    return pool;
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="page">
        <p>Öğretim dersi bulunamadı.</p>
        <Link to={`/path/${unitId}`}>Üniteye dön</Link>
      </div>
    );
  }

  const check = lesson.checks[checkIndex];
  const miniPassed = checkCorrect >= LESSON_PASS.miniCheckMinCorrect;
  const noticeCorrect = lesson.rules[0] ?? noticeOptions[0];

  const goNext = () => {
    setPicked(null);
    if (stepId === 'checks' && checkIndex < lesson.checks.length - 1) {
      setCheckIndex((i) => i + 1);
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const goPrev = () => {
    setPicked(null);
    if (stepId === 'checks' && checkIndex > 0) {
      setCheckIndex((i) => i - 1);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  };

  const answerCheck = (opt: string) => {
    if (picked || !check) return;
    setPicked(opt);
    const ok = opt === check.a;
    if (ok) setCheckCorrect((c) => c + 1);
    else {
      addMistake({
        exerciseId: `${lesson.id}-check-${checkIndex}`,
        prompt: check.q,
        expected: check.a,
        userAnswer: opt,
        type: 'MCQ',
      });
    }
  };

  const seedSrs = () => {
    const additions: ReturnType<typeof createCard>[] = [];
    for (const [it, tr] of lesson.vocab) {
      if (!it?.trim()) continue;
      const id = `v2-${lesson.id}-${it}`;
      if (srs.some((c) => c.id === id) || additions.some((c) => c.id === id)) continue;
      additions.push(createCard(id, it, tr, it));
    }
    if (additions.length) {
      useProgress.setState((s) => ({ srs: [...s.srs, ...additions] }));
    }
  };

  const completeLesson = () => {
    if (finished) return;
    const accuracy = Math.round(
      (checkCorrect / Math.max(1, lesson.checks.length)) * 100,
    );
    const xp = Math.max(20, 12 + checkCorrect * 8 + Math.min(12, lesson.rules.length));
    const minutes = Math.max(8, Math.round((Date.now() - startedAt) / 60000));
    recordLessonComplete(lesson.id, accuracy, xp, skills);
    addStudyMinutes(minutes);
    seedSrs();
    setFinished(true);
  };

  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');

  const checkPractice = () => {
    if (!practice || practiceChecked) return;
    const ok = normalize(practiceInput) === normalize(practice.answer);
    setPracticeOk(ok);
    setPracticeChecked(true);
    if (!ok) {
      addMistake({
        exerciseId: `${lesson.id}-practice`,
        prompt: practice.prompt,
        expected: practice.answer,
        userAnswer: practiceInput,
        type: 'CLOZE',
      });
    }
  };

  const primaryLabel = (): string | null => {
    if (stepId === 'checks' && !picked) return null;
    if (stepId === 'noticing' && !noticePick) return null;
    if (stepId === 'practice' && practice && !practiceChecked) return null;
    if (stepId === 'checks' && checkIndex < lesson.checks.length - 1) {
      return 'Sonraki soru';
    }
    if (stepId === 'production') return 'Görevi tamamladım';
    if (stepId === 'done') return finished ? 'Üniteye dön' : 'Dersi bitir';
    return 'Devam et';
  };

  const onPrimary = () => {
    if (stepId === 'done') {
      if (!finished) completeLesson();
      return;
    }
    goNext();
  };

  return (
    <div className="lesson-player teaching-player">
      <div className="lesson-top">
        <Link to={`/path/${unitId}`} className="back-link">
          ← {meta?.titleIt ?? 'Ünite'}
        </Link>
        <div className="progress-track" aria-hidden>
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="progress-meta">
          {STEPS[step].label} · {step + 1}/{STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${stepId}-${checkIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="ex-card teach-card"
        >
          {stepId === 'context' && (
            <TeachBlock
              eyebrow={`${lesson.level} · ${lesson.skill}`}
              title={lesson.title}
            >
              <p className="teach-goal">
                <strong>İletişim amacı:</strong> {lesson.goal}
              </p>
              <p className="lede">
                Bu ders gerçek öğretim akışıyla ilerler: anlatım → örnekler →
                diyalog → fark ettirme → mini kontrol → hata kliniği → alıştırma →
                üretim.
              </p>
              {meta && (
                <p className="muted small">
                  Kitap referansı (ünite): s. {meta.bookPages} · Dilbilgisi: s.{' '}
                  {meta.grammarPages}
                </p>
              )}
            </TeachBlock>
          )}

          {stepId === 'instruction' && (
            <TeachBlock eyebrow="Türkçe ayrıntılı konu anlatımı" title="Konuyu öğren">
              <div className="teach-prose">{lesson.concept}</div>
              <h3 className="teach-sub">Dilbilgisi kuralları ve çekim mantığı</h3>
              <ol className="teach-rules">
                {lesson.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </TeachBlock>
          )}

          {stepId === 'examples' && (
            <TeachBlock eyebrow="Açıklamalı İtalyanca örnekler" title="Nasıl kullanılıyor?">
              <ul className="teach-examples">
                {lesson.examples.map(([it, tr, note]) => (
                  <li key={`${it}-${tr}`}>
                    <div className="teach-example-it" lang="it">
                      <span>{it}</span>
                      <SpeakButton text={it.replace(/[«»]/g, '')} small />
                    </div>
                    <p className="teach-example-tr">{tr}</p>
                    {note ? <p className="hint">{note}</p> : null}
                  </li>
                ))}
              </ul>
            </TeachBlock>
          )}

          {stepId === 'vocab' && (
            <TeachBlock eyebrow="Kelime ve kalıp paketi" title="Bu dersin sözlüğü">
              <ul className="teach-vocab">
                {lesson.vocab.map(([it, tr, ex]) => (
                  <li key={it}>
                    <div className="teach-vocab-head">
                      <strong lang="it">{it}</strong>
                      <SpeakButton text={it} small />
                    </div>
                    <span className="teach-vocab-tr">{tr}</span>
                    {ex ? (
                      <p className="teach-vocab-ex" lang="it">
                        {ex} <SpeakButton text={ex} small />
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </TeachBlock>
          )}

          {stepId === 'dialogue' && (
            <TeachBlock eyebrow="Diyalog + dinleme planı" title="Bağlam içinde dinle">
              <div className="teach-listen-plan">
                <p>
                  <strong>1. dinleme:</strong> Transkript kapalı — konuşma amacını
                  yakala (kim, nereye, ne istiyor?).
                </p>
                <p>
                  <strong>2. dinleme:</strong> Kişi, yer, zaman ve niyet ayrıntılarını
                  dinle; sonra metni aç.
                </p>
              </div>
              <div className="cta-row" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShowTranscript((v) => !v)}
                >
                  {showTranscript ? 'Transkripti gizle' : 'Transkripti göster'}
                </button>
                <SpeakButton
                  text={lesson.dialogue
                    .map((l) => parseDialogueLine(l).text || l)
                    .join('. ')}
                  label="Tüm diyaloğu dinle"
                />
              </div>
              {showTranscript && (
                <div className="teach-dialogue">
                  {lesson.dialogue.map((line) => {
                    const { speaker, text } = parseDialogueLine(line);
                    return (
                      <div key={line} className="dialogue-line teach-dialogue-line">
                        {speaker ? <strong>{speaker}:</strong> : null}{' '}
                        <span lang="it">{text || line}</span>{' '}
                        <SpeakButton text={text || line} small />
                      </div>
                    );
                  })}
                </div>
              )}
              {!showTranscript && (
                <p className="muted small">
                  Önce sesi dinle; ardından transkripti açıp satır satır tekrarla.
                </p>
              )}
            </TeachBlock>
          )}

          {stepId === 'noticing' && (
            <TeachBlock
              eyebrow="Kuralı fark ettirme"
              title="Örneklere bakarak doğru kural hangisi?"
            >
              {lesson.examples[0] && (
                <p className="teach-notice-ex" lang="it">
                  «{lesson.examples[0][0]}»
                </p>
              )}
              <div className="choice-list">
                {noticeOptions.map((opt) => {
                  let cls = 'choice';
                  if (noticePick) {
                    if (opt === noticeCorrect) cls += ' ok';
                    else if (opt === noticePick) cls += ' bad';
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cls}
                      disabled={Boolean(noticePick)}
                      onClick={() => setNoticePick(opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {noticePick && (
                <p
                  className={`status-msg ${
                    noticePick === noticeCorrect ? 'ok' : 'bad'
                  }`}
                >
                  {noticePick === noticeCorrect
                    ? 'Doğru — kuralı örnekten çıkardın.'
                    : `Ana kural: ${noticeCorrect}`}
                </p>
              )}
            </TeachBlock>
          )}

          {stepId === 'checks' && check && (
            <TeachBlock
              eyebrow={`Mini kontrol ${checkIndex + 1}/${lesson.checks.length}`}
              title={check.q}
            >
              <div className="choice-list">
                {check.options.map((opt) => {
                  const isPick = picked === opt;
                  const isAnswer = opt === check.a;
                  let cls = 'choice';
                  if (picked) {
                    if (isAnswer) cls += ' ok';
                    else if (isPick) cls += ' bad';
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cls}
                      disabled={Boolean(picked)}
                      onClick={() => answerCheck(opt)}
                    >
                      <span lang="it">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {picked && (
                <p className={`status-msg ${picked === check.a ? 'ok' : 'bad'}`}>
                  {picked === check.a ? 'Doğru! ' : 'Henüz değil. '}
                  {check.why}
                </p>
              )}
            </TeachBlock>
          )}

          {stepId === 'errors' && (
            <TeachBlock eyebrow="Hata kliniği" title="Sık yapılan yanlışlar">
              <ul className="teach-errors">
                {lesson.errors.map(([wrong, right, why]) => (
                  <li key={`${wrong}-${right}`}>
                    <p className="teach-error-bad">
                      <span className="pill">Yanlış</span> {wrong}
                    </p>
                    <p className="teach-error-ok" lang="it">
                      <span className="pill">Doğru</span> {right}{' '}
                      <SpeakButton
                        text={right.replace(/^Doğru:\s*/i, '')}
                        small
                      />
                    </p>
                    <p className="muted small">{why}</p>
                  </li>
                ))}
              </ul>
            </TeachBlock>
          )}

          {stepId === 'practice' && (
            <TeachBlock eyebrow="Kontrollü alıştırma" title="Boşluğu doldur">
              {practice ? (
                <>
                  <p className="teach-practice-prompt" lang="it">
                    {practice.prompt}
                  </p>
                  <label className="field">
                    <span>Eksik kelime / biçim</span>
                    <input
                      className="text-input"
                      value={practiceInput}
                      disabled={practiceChecked}
                      onChange={(e) => setPracticeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') checkPractice();
                      }}
                      placeholder="Yaz…"
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                  </label>
                  {!practiceChecked ? (
                    <button
                      type="button"
                      className="btn primary"
                      onClick={checkPractice}
                      disabled={!practiceInput.trim()}
                    >
                      Kontrol et
                    </button>
                  ) : (
                    <p className={`status-msg ${practiceOk ? 'ok' : 'bad'}`}>
                      {practiceOk
                        ? 'Doğru!'
                        : `Doğru yanıt: ${practice.answer}`}
                    </p>
                  )}
                </>
              ) : (
                <p className="lede">Bu ders için alıştırma örneği yok; devam et.</p>
              )}
            </TeachBlock>
          )}

          {stepId === 'production' && (
            <TeachBlock eyebrow="Konuşma, yazma veya rol yapma" title="Üretim görevi">
              <p className="teach-prose">{lesson.production}</p>
              <label className="field">
                <span>İstersen notunu buraya yaz (zorunlu değil)</span>
                <textarea
                  className="text-input teach-textarea"
                  rows={4}
                  value={productionNote}
                  onChange={(e) => setProductionNote(e.target.value)}
                  placeholder="Cevabını veya konuşma taslağını yaz…"
                />
              </label>
            </TeachBlock>
          )}

          {stepId === 'done' && (
            <TeachBlock eyebrow="Geçme koşulu ve kişisel tekrar" title="Ders özeti">
              <ul className="teach-summary">
                <li>
                  Mini kontrol:{' '}
                  <strong>
                    {checkCorrect}/{lesson.checks.length}
                  </strong>
                  {miniPassed
                    ? ' — geçme eşiği sağlandı (≥2/3).'
                    : ' — eşiğin altında; dersi bitirebilirsin ama tekrar önerilir.'}
                </li>
                <li>
                  {lesson.vocab.length} kelime/kalıp aralıklı tekrara (SRS) eklenir.
                </li>
                <li className="muted small">Kaynak notu: {lesson.source}</li>
              </ul>
              {!miniPassed && (
                <p className="status-msg warn">
                  Telafi: Pratik → Kelime veya Aralıklı tekrar ile bu ünitenin
                  kalıplarını pekiştir; sonra dersi yeniden açabilirsin.
                </p>
              )}
              {finished && (
                <p className="status-msg ok">Ders kaydedildi. Bravo!</p>
              )}
            </TeachBlock>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="teach-nav">
        <button
          type="button"
          className="btn ghost"
          onClick={goPrev}
          disabled={step === 0 && checkIndex === 0}
        >
          Geri
        </button>
        {stepId === 'done' && finished ? (
          <Link className="btn primary" to={`/path/${unitId}`}>
            Üniteye dön
          </Link>
        ) : primaryLabel() ? (
          <button type="button" className="btn primary" onClick={onPrimary}>
            {primaryLabel()}
          </button>
        ) : (
          <span className="muted small">
            {stepId === 'practice'
              ? 'Önce kontrol et'
              : 'Önce bir seçenek işaretle'}
          </span>
        )}
      </div>
    </div>
  );
}

function TeachBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="ex-prompt">{title}</h2>
      {children}
    </>
  );
}

export function MissionPlayer({
  unitId,
  title,
  body,
  kind,
  lessonId,
}: {
  unitId: string;
  title: string;
  body: string;
  kind: 'mission' | 'exam';
  lessonId: string;
}) {
  const meta = getUnitMeta(unitId);
  const recordLessonComplete = useProgress((s) => s.recordLessonComplete);
  const addStudyMinutes = useProgress((s) => s.addStudyMinutes);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState('');

  const complete = () => {
    recordLessonComplete(
      lessonId,
      80,
      kind === 'exam' ? 40 : 25,
      ['speaking', 'writing'],
    );
    addStudyMinutes(kind === 'exam' ? 20 : 12);
    setDone(true);
  };

  return (
    <div className="lesson-player">
      <div className="lesson-top">
        <Link to={`/path/${unitId}`} className="back-link">
          ← {meta?.titleIt ?? (kind === 'exam' ? 'Sınav' : 'Ünite')}
        </Link>
      </div>
      <div className="ex-card teach-card">
        <p className="eyebrow">
          {kind === 'exam' ? 'Seviye sınavı' : 'Ünite görevi'}
        </p>
        <h2 className="ex-prompt">{title}</h2>
        <p className="teach-prose">{body}</p>
        {kind === 'exam' && (
          <p className="status-msg info">
            Tam madde bankası müfredatta tanımlı. Bu sürümde sınav kabuğu ve
            geçme hedefleri: A1 65/100 · A2 70/100; dinleme/yazma/konuşmada en az
            %50.
          </p>
        )}
        {kind === 'mission' && (
          <p className="muted small">
            Rubrik: iletişimi tamamla · en az 4 hedef kelime · 2 dilbilgisi yapısı.
            Süre hedefi A1 ≈ 30–60 sn · A2 ≈ 60–120 sn.
          </p>
        )}
        <label className="field">
          <span>Üretim notu (isteğe bağlı)</span>
          <textarea
            className="text-input teach-textarea"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Görevi nasıl tamamladığını yaz…"
          />
        </label>
        {!done ? (
          <div className="ex-actions">
            <button type="button" className="btn primary" onClick={complete}>
              Görevi tamamladım
            </button>
          </div>
        ) : (
          <div className="ex-actions">
            <p className="status-msg ok">Kaydedildi.</p>
            <Link className="btn primary" to={`/path/${unitId}`}>
              Üniteye dön
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
