import type { Exercise, SrsCard } from '../types/curriculum';
import { createCard } from './srs';
import vocab from '../data/vocab.json';

type VocabItem = { it: string; tr: string[]; category?: string };

const VOCAB = vocab as VocabItem[];

const VOCAB_BY_IT = new Map(
  VOCAB.map((v) => [normalizeIt(v.it), v] as const),
);

function normalizeIt(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Turkish UI prompts that must never appear as flashcard “meaning”. */
export function isInstructionCopy(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  if (t.length > 90) return true;
  return /(dinle|tekrarla|seç|yaz|eşleştir|tamamla|çevir|konuş|kontrol|doğru kelime|harfleri|cümleyi|boşluğu|aşağıdaki)/.test(
    t,
  );
}

export function lookupTurkish(italian: string): string | null {
  const key = normalizeIt(italian);
  if (!key) return null;
  const hit = VOCAB_BY_IT.get(key);
  if (hit?.tr?.length) return hit.tr.join(' · ');
  // Soft: match without trailing punctuation / articles noise
  for (const [k, v] of VOCAB_BY_IT) {
    if (k === key || key.startsWith(k + ' ') || k.startsWith(key + ' ')) {
      if (v.tr?.length) return v.tr.join(' · ');
    }
  }
  return null;
}

const SRS_TYPES = new Set([
  'AUDIO_WORD',
  'LISTEN_REPEAT',
  'SPEAK_SENTENCE',
  'DICTATION',
  'FREE_TRANSLATION',
  'WORD_MATCH',
  'MCQ',
  'MINIMAL_PAIR',
  'CONJUGATE',
  'TRANSFORM',
]);

/**
 * Build an IT → TR flashcard from an exercise.
 * Returns null when the exercise is not suitable for SRS.
 */
export function cardFromExercise(ex: Exercise): SrsCard | null {
  if (!SRS_TYPES.has(ex.type) || ex.type === 'EXPLAIN') return null;

  if (ex.type === 'WORD_MATCH' && ex.pairs?.[0]) {
    const { left, right } = ex.pairs[0];
    if (!left || !right || isInstructionCopy(right)) return null;
    return createCard(ex.id, left, right, left);
  }

  if (ex.type === 'CONJUGATE' && ex.lemma && ex.acceptedAnswers?.[0]) {
    const front = ex.acceptedAnswers[0];
    const back = `${ex.lemma} — ${ex.person ?? ''}`.trim();
    return createCard(ex.id, front, back, front);
  }

  const front =
    ex.audioText?.trim() ||
    ex.acceptedAnswers?.[0]?.trim() ||
    ex.promptIt?.trim() ||
    '';

  if (!front || front.length > 80) return null;
  // Skip if "front" looks like a Turkish instruction
  if (isInstructionCopy(front)) return null;

  let back =
    (ex.pairs?.[0]?.right && !isInstructionCopy(ex.pairs[0].right)
      ? ex.pairs[0].right
      : null) ||
    lookupTurkish(front) ||
    (ex.hint && !isInstructionCopy(ex.hint) ? ex.hint : null) ||
    null;

  // Never store promptTr when it's an exercise instruction
  if (!back && ex.promptTr && !isInstructionCopy(ex.promptTr)) {
    back = ex.promptTr;
  }

  if (!back) {
    back = 'Anlamını hatırla — bu ifade derste geçti.';
  }

  return createCard(ex.id, front, back, ex.audioText ?? front);
}

/** Fix legacy cards that stored exercise prompts as the “back”. */
export function repairSrsCard(card: SrsCard): SrsCard {
  if (!isInstructionCopy(card.back) && card.back.trim()) return card;
  const meaning = lookupTurkish(card.front);
  if (meaning) {
    return { ...card, back: meaning, audioText: card.audioText ?? card.front };
  }
  return {
    ...card,
    back: 'Anlamını hatırla — bu ifade derste geçti.',
    audioText: card.audioText ?? card.front,
  };
}

export function repairSrsDeck(cards: SrsCard[]): SrsCard[] {
  return cards.map(repairSrsCard);
}
