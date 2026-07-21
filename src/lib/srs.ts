import type { SrsCard } from '../types/curriculum';

const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30, 60];

export function createCard(
  id: string,
  front: string,
  back: string,
  audioText?: string,
): SrsCard {
  return {
    id,
    front,
    back,
    audioText,
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    reps: 0,
    lapses: 0,
  };
}

/** SM-2 inspired: quality 0-5 */
export function reviewCard(card: SrsCard, quality: number): SrsCard {
  const q = Math.max(0, Math.min(5, quality));
  const next = { ...card };

  if (q < 3) {
    next.reps = 0;
    next.lapses += 1;
    next.interval = 0;
    next.due = Date.now() + 10 * 60 * 1000; // 10 min
    next.ease = Math.max(1.3, next.ease - 0.2);
    return next;
  }

  next.reps += 1;
  next.ease = Math.max(1.3, next.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (next.reps === 1) next.interval = INTERVALS_DAYS[1];
  else if (next.reps === 2) next.interval = INTERVALS_DAYS[2];
  else next.interval = Math.round(next.interval * next.ease);

  next.due = Date.now() + next.interval * 24 * 60 * 60 * 1000;
  return next;
}

export function dueCards(cards: SrsCard[], limit = 20): SrsCard[] {
  const now = Date.now();
  return cards
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, limit);
}
