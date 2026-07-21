export type NormalizeOpts = {
  ignoreCase?: boolean;
  ignoreAccents?: boolean;
  ignorePunctuation?: boolean;
  apostropheSensitive?: boolean;
};

const DEFAULTS: Required<NormalizeOpts> = {
  ignoreCase: true,
  ignoreAccents: false,
  ignorePunctuation: true,
  apostropheSensitive: true,
};

export function normalizeAnswer(input: string, opts: NormalizeOpts = {}): string {
  const o = { ...DEFAULTS, ...opts };
  let s = (input ?? '').trim().replace(/\s+/g, ' ');

  if (o.ignoreCase) s = s.toLowerCase();

  if (!o.apostropheSensitive) {
    s = s.replace(/['’`]/g, '');
  } else {
    s = s.replace(/[’`]/g, "'");
  }

  if (o.ignoreAccents) {
    s = s.normalize('NFD').replace(/\p{M}/gu, '');
  }

  if (o.ignorePunctuation) {
    s = s.replace(/[.,!?;:…«»""„]/g, '').trim();
  }

  return s.replace(/\s+/g, ' ').trim();
}

export function answersMatch(
  user: string,
  accepted: string[],
  opts: NormalizeOpts = {},
): boolean {
  const u = normalizeAnswer(user, opts);
  return accepted.some((a) => normalizeAnswer(a, opts) === u);
}

/** Accept if any accepted answer is a close enough typo (1 edit for short, 2 for longer). */
export function softMatch(
  user: string,
  accepted: string[],
  opts: NormalizeOpts = {},
): 'exact' | 'typo' | false {
  if (answersMatch(user, accepted, opts)) return 'exact';
  const u = normalizeAnswer(user, opts);
  for (const a of accepted) {
    const t = normalizeAnswer(a, opts);
    const max = t.length <= 5 ? 1 : 2;
    if (editDistance(u, t) <= max) return 'typo';
  }
  return false;
}

function editDistance(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function turkishIncludesAny(user: string, accepted: string[]): boolean {
  const u = normalizeAnswer(user, { ignoreAccents: true, ignoreCase: true });
  return accepted.some((a) => {
    const t = normalizeAnswer(a, { ignoreAccents: true, ignoreCase: true });
    return u === t || u.includes(t) || t.includes(u);
  });
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
