/** Browser speech recognition for Italian speaking exercises. */

export type AsrResult = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally?: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string; confidence: number };
      length: number;
    };
  };
};

const LANG_CANDIDATES = ['it-IT', 'it'];

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isAsrSupported() {
  return Boolean(getRecognitionCtor());
}

/** Normalize SpeechRecognition error codes / messages to a stable key. */
export function normalizeAsrErrorCode(raw: string): string {
  const s = (raw || '').toLowerCase().trim();
  if (!s) return 'unknown';
  if (s.includes('language-not-supported') || s.includes('not supported')) {
    return 'language-not-supported';
  }
  if (s.includes('not-allowed') || s.includes('permission') || s.includes('denied')) {
    return 'not-allowed';
  }
  if (s.includes('no-speech')) return 'no-speech';
  if (s.includes('audio-capture')) return 'audio-capture';
  if (s.includes('network')) return 'network';
  if (s.includes('aborted')) return 'aborted';
  if (s.includes('busy')) return 'busy';
  // Bare Web Speech API codes
  const known = [
    'language-not-supported',
    'not-allowed',
    'service-not-allowed',
    'no-speech',
    'audio-capture',
    'network',
    'aborted',
    'busy',
  ];
  if (known.includes(s)) return s;
  return s;
}

/** Map Web Speech API error codes to actionable Turkish copy. */
export function asrErrorMessage(raw: string): string {
  switch (normalizeAsrErrorCode(raw)) {
    case 'language-not-supported':
      return 'İtalyanca konuşma tanıma bu oturumda açılamadı. Mikrofon iznini kontrol et; gerekirse Pas ile devam et.';
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Mikrofon izni verilmedi. Adres çubuğundaki kilit ikonundan mikrofonu açıp tekrar dene.';
    case 'no-speech':
      return 'Ses algılanamadı. Yakın konuşup tekrar dene.';
    case 'audio-capture':
      return 'Mikrofona erişilemedi. Başka bir uygulama mikrofonu kullanıyor olabilir.';
    case 'network':
      return 'Konuşma tanıma için internet gerekli. Bağlantını kontrol et.';
    case 'aborted':
      return 'Dinleme iptal edildi.';
    case 'busy':
      return 'Tanıma meşgul. Bir saniye bekleyip tekrar dene.';
    default: {
      const code = normalizeAsrErrorCode(raw);
      if (code === 'unknown') {
        return 'Konuşma tanıma başarısız. Pas ile devam edebilirsin.';
      }
      // Never surface raw API codes like "language-not-supported"
      if (!code.includes(' ') && code.length < 40) {
        return 'Konuşma tanıma şu an kullanılamıyor. Pas ile devam edebilirsin.';
      }
      return code;
    }
  }
}

type AttemptOpts = {
  lang: string;
  timeoutMs: number;
  /** Never force on-device — Chrome often lacks Italian packs locally. */
  processLocally?: boolean;
};

function listenAttempt(opts: AttemptOpts): Promise<AsrResult> {
  return new Promise((resolve, reject) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      reject(new Error('language-not-supported'));
      return;
    }

    const rec = new Ctor();
    rec.lang = opts.lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    // Explicitly prefer cloud recognition when the engine supports the flag.
    if ('processLocally' in rec) {
      try {
        rec.processLocally = opts.processLocally ?? false;
      } catch {
        /* optional */
      }
    }

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = window.setTimeout(() => {
      finish(() => {
        try {
          rec.abort();
        } catch {
          try {
            rec.stop();
          } catch {
            /* ignore */
          }
        }
        reject(new Error('timeout'));
      });
    }, opts.timeoutMs);

    rec.onresult = (ev) => {
      const first = ev.results[0]?.[0];
      if (!first?.transcript?.trim()) return;
      finish(() => {
        resolve({
          transcript: first.transcript.trim(),
          confidence: first.confidence ?? 0.5,
        });
      });
    };

    rec.onerror = (ev) => {
      finish(() => reject(new Error(ev.error || 'unknown')));
    };

    rec.onend = () => {
      // If we already resolved/rejected, ignore. Otherwise no usable result.
      finish(() => reject(new Error('no-speech')));
    };

    try {
      rec.start();
    } catch (e) {
      finish(() => {
        const msg =
          e instanceof Error
            ? e.message || e.name
            : typeof e === 'string'
              ? e
              : 'unknown';
        reject(new Error(msg));
      });
    }
  });
}

/**
 * Listen once for Italian speech.
 * Retries without on-device mode and with alternate language tags —
 * Chrome often returns language-not-supported when processLocally is forced.
 */
export async function listenOnce(
  lang = 'it-IT',
  timeoutMs = 10000,
): Promise<AsrResult> {
  if (!getRecognitionCtor()) {
    throw new Error(asrErrorMessage('language-not-supported'));
  }

  const langs = [lang, ...LANG_CANDIDATES.filter((l) => l !== lang)];
  let lastError = 'unknown';

  for (const candidate of langs) {
    try {
      return await listenAttempt({
        lang: candidate,
        timeoutMs,
        processLocally: false,
      });
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'unknown';
      const code = normalizeAsrErrorCode(lastError);
      // Hard permission errors: don't keep retrying
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        throw new Error(asrErrorMessage(code));
      }
      // Only switch language tags when the engine rejects the locale
      if (code === 'language-not-supported') {
        continue;
      }
      // User-facing failures — stop and report
      throw new Error(asrErrorMessage(code === 'timeout' ? 'no-speech' : lastError));
    }
  }

  throw new Error(asrErrorMessage(lastError));
}

/** Simple similarity for speak scoring (normalized Levenshtein ratio). */
export function transcriptMatchScore(expected: string, heard: string): number {
  const a = normalizeForSpeak(expected);
  const b = normalizeForSpeak(heard);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - dist / maxLen);
}

function normalizeForSpeak(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}
