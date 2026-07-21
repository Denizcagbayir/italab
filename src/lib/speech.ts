/** Italian TTS — mirrors the preferred-voice logic from the original HTML drills. */

const PREFERRED_NAMES = [
  'Google italiano',
  'Microsoft Elsa',
  'Microsoft Cosimo',
  'Microsoft Elsa Desktop',
  'Microsoft Cosimo Desktop',
  'Italian',
  'Italia',
];

const BLOCKED = ['rocko', 'sandy'];

type SpeakOpts = {
  rate?: number;
  pitch?: number;
  voiceName?: string | null;
  lang?: string;
};

let voicesCache: SpeechSynthesisVoice[] = [];
let speaking = false;

function isItalian(v: SpeechSynthesisVoice) {
  const name = v.name.toLowerCase();
  return (
    (v.lang.startsWith('it') || v.lang === 'it-IT') &&
    !BLOCKED.some((b) => name.includes(b))
  );
}

export function getItalianVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  const all = speechSynthesis.getVoices();
  if (all.length) voicesCache = all;
  return voicesCache.filter(isItalian);
}

export function findBestItalianVoice(
  preferredName?: string | null,
): SpeechSynthesisVoice | null {
  const italian = getItalianVoices();
  if (!italian.length) return null;
  if (preferredName) {
    const match = italian.find((v) => v.name === preferredName);
    if (match) return match;
  }
  for (const name of PREFERRED_NAMES) {
    const voice = italian.find((v) =>
      v.name.toLowerCase().includes(name.toLowerCase()),
    );
    if (voice) return voice;
  }
  return italian[0];
}

export function initSpeech(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const done = () => resolve(getItalianVoices());
    const existing = speechSynthesis.getVoices();
    if (existing.length) {
      voicesCache = existing;
      done();
      return;
    }
    speechSynthesis.onvoiceschanged = () => {
      voicesCache = speechSynthesis.getVoices();
      done();
    };
    // Safari sometimes needs a kick
    setTimeout(() => {
      voicesCache = speechSynthesis.getVoices();
      done();
    }, 400);
  });
}

export function stopSpeaking() {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}

export function speakText(
  text: string,
  opts: SpeakOpts = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Seslendirme desteklenmiyor'));
      return;
    }
    if (!text.trim()) {
      resolve();
      return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = opts.lang ?? 'it-IT';
    utterance.rate = opts.rate ?? 1.0;
    utterance.pitch = opts.pitch ?? 1.0;
    utterance.volume = 1.0;

    const voice = findBestItalianVoice(opts.voiceName);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      speaking = true;
    };
    utterance.onend = () => {
      speaking = false;
      resolve();
    };
    utterance.onerror = () => {
      speaking = false;
      resolve();
    };

    speechSynthesis.speak(utterance);
  });
}
