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

/** Map Web Speech API error codes to actionable Turkish copy. */
export function asrErrorMessage(code: string): string {
  switch (code) {
    case 'language-not-supported':
      return 'Bu tarayıcı/cihaz İtalyanca konuşma tanımayı desteklemiyor. Chrome (masaüstü veya Android) dene ya da Pas ile devam et.';
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Mikrofon izni verilmedi. Tarayıcı ayarlarından izin verip tekrar dene.';
    case 'no-speech':
      return 'Ses algılanamadı. Yakın konuşup tekrar dene.';
    case 'audio-capture':
      return 'Mikrofona erişilemedi. Başka bir uygulama mikrofonu kullanıyor olabilir.';
    case 'network':
      return 'Konuşma tanıma için ağ gerekli. Bağlantını kontrol et.';
    case 'aborted':
      return 'Dinleme iptal edildi.';
    case 'busy':
      return 'Tanıma meşgul. Bir saniye bekleyip tekrar dene.';
    default:
      return code && !code.includes(' ')
        ? `Konuşma tanıma hatası (${code}). Pas ile devam edebilirsin.`
        : code || 'Konuşma tanıma başarısız. Pas ile devam edebilirsin.';
  }
}

export function listenOnce(lang = 'it-IT', timeoutMs = 8000): Promise<AsrResult> {
  return new Promise((resolve, reject) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      reject(new Error(asrErrorMessage('language-not-supported')));
      return;
    }

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    if ('processLocally' in rec) {
      try {
        rec.processLocally = true;
      } catch {
        /* optional */
      }
    }

    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      reject(new Error('Süre doldu — tekrar dene'));
    }, timeoutMs);

    rec.onresult = (ev) => {
      if (settled) return;
      const first = ev.results[0]?.[0];
      if (!first) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        transcript: first.transcript.trim(),
        confidence: first.confidence ?? 0.5,
      });
    };

    rec.onerror = (ev) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(asrErrorMessage(ev.error || 'unknown')));
    };

    rec.onend = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error('Ses algılanamadı. Tekrar dene veya Pas geç.'));
    };

    try {
      rec.start();
    } catch (e) {
      clearTimeout(timer);
      const msg = e instanceof Error ? e.message : 'Mikrofon başlatılamadı';
      reject(new Error(asrErrorMessage(msg.includes('not-allowed') ? 'not-allowed' : msg)));
    }
  });
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
