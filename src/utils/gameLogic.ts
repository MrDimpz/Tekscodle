import { Difficulty, SupermarketItem, SUPERMARKET_ITEMS, getItemsPoolForDifficulty } from '../data/items';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  subtitle: string;
  poolDescription: string;
  marginPct: number; // e.g., 10 = 10% away cutoff
  minZonePoints: number;
  maxRoundPoints: number;
  maxTotalPoints: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    subtitle: 'Everyday Staples',
    poolDescription: 'Common household essentials with a generous 15% scoring margin.',
    marginPct: 15,
    minZonePoints: 80,
    maxRoundPoints: 800,
    maxTotalPoints: 2400,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    subtitle: 'Classic Mix',
    poolDescription: 'Staples plus mid-tier favourites with the standard 10% scoring margin.',
    marginPct: 10,
    minZonePoints: 100,
    maxRoundPoints: 1000,
    maxTotalPoints: 3000,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    subtitle: 'Finest & Niche',
    poolDescription: 'Specialty, Finest & promotional items with a tight 7% scoring margin.',
    marginPct: 7,
    minZonePoints: 125,
    maxRoundPoints: 1250,
    maxTotalPoints: 3750,
  },
};

export interface RoundConfig {
  roundNumber: 1 | 2 | 3;
  title: string;
  itemCount: 1 | 3 | 5;
  items: SupermarketItem[];
  actualTotalPence: number;
}

export interface RoundResult {
  roundNumber: number;
  title: string;
  itemCount: number;
  items: SupermarketItem[];
  actualTotalPence: number;
  guessPence: number;
  diffPence: number; // signed: guess - actual
  absErrorPct: number; // percentage e.g. 4.25
  points: number;
  maxPoints: number;
  marginPct: number;
  inZone: boolean;
  ratingLabel: string;
}

export function formatGBP(pence: number): string {
  const isNegative = pence < 0;
  const absPence = Math.abs(Math.round(pence));
  const pounds = (absPence / 100).toFixed(2);
  return `${isNegative ? '-' : ''}£${pounds}`;
}

export function getTodayUtcDate(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Deterministic mulberry32 PRNG seeded from a string (for Daily Basket consistency).
 */
function seededRandom(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds the 3 escalating rounds (1 item, 3 items, 5 items = 9 unique items).
 */
export function buildThreeRoundSession(
  difficulty: Difficulty,
  mode: 'daily' | 'practice',
  dailyDate: string = getTodayUtcDate()
): RoundConfig[] {
  const pool = getItemsPoolForDifficulty(difficulty);
  const rng =
    mode === 'daily'
      ? seededRandom(`TEKSCOdle-${dailyDate}-${difficulty}`)
      : () => Math.random();

  const shuffled = shuffleWithRng(pool, rng);

  // Guarantee Hard mode features specialty items prominently across all 3 rounds
  let ordered = shuffled;
  if (difficulty === 'hard') {
    const specialty = shuffled.filter((i) => i.tier === 'specialty');
    const others = shuffled.filter((i) => i.tier !== 'specialty');
    // Put a specialty item in Round 1, 2 specialty + 1 mid-tier in Round 2, 3 specialty + 2 mid-tier in Round 3
    ordered = [
      specialty[0],
      specialty[1],
      specialty[2],
      others[0],
      specialty[3],
      specialty[4],
      specialty[5],
      others[1],
      others[2],
    ].filter((item): item is SupermarketItem => Boolean(item));
  }

  const r1Items = ordered.slice(0, 1);
  const r2Items = ordered.slice(1, 4);
  const r3Items = ordered.slice(4, 9);

  const sumPence = (items: SupermarketItem[]) =>
    items.reduce((acc, item) => acc + item.pricePence, 0);

  return [
    {
      roundNumber: 1,
      title: 'Express Basket',
      itemCount: 1,
      items: r1Items,
      actualTotalPence: sumPence(r1Items),
    },
    {
      roundNumber: 2,
      title: 'Midweek Top-Up',
      itemCount: 3,
      items: r2Items,
      actualTotalPence: sumPence(r2Items),
    },
    {
      roundNumber: 3,
      title: 'The Big Shop',
      itemCount: 5,
      items: r3Items,
      actualTotalPence: sumPence(r3Items),
    },
  ];
}

/**
 * Builds an instant single-round Quick Play basket with random 1, 3, or 5 items,
 * avoiding items shown in the immediately preceding Quick Play round.
 */
export function buildQuickPlayRound(
  difficulty: Difficulty,
  excludeIds: string[] = []
): RoundConfig {
  const counts: Array<1 | 3 | 5> = [1, 3, 5];
  const randomCount = counts[Math.floor(Math.random() * counts.length)];
  const fullPool =
    difficulty === 'medium'
      ? SUPERMARKET_ITEMS
      : getItemsPoolForDifficulty(difficulty);
  const filteredPool = fullPool.filter((item) => !excludeIds.includes(item.id));
  const pool = filteredPool.length >= randomCount ? filteredPool : fullPool;
  const shuffled = shuffleWithRng(pool, () => Math.random());
  const items = shuffled.slice(0, randomCount);
  const actualTotalPence = items.reduce((acc, item) => acc + item.pricePence, 0);

  const titles: Record<1 | 3 | 5, string> = {
    1: 'Quick Express (1 Item)',
    3: 'Quick Basket (3 Items)',
    5: 'Quick Big Shop (5 Items)',
  };

  return {
    roundNumber: 1,
    title: titles[randomCount],
    itemCount: randomCount,
    items,
    actualTotalPence,
  };
}

/**
 * Evaluates a player's basket guess.
 * Awards points starting at the difficulty's margin cutoff (10% on Medium, 15% on Easy, 7% on Hard)
 * and increasing smoothly as the player gets closer to the exact till price.
 */
export function scoreRoundGuess(
  round: RoundConfig,
  guessPence: number,
  difficulty: Difficulty
): RoundResult {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const actual = round.actualTotalPence;
  const diffPence = guessPence - actual;
  const rawErrorRatio = actual > 0 ? Math.abs(diffPence) / actual : 1;
  const absErrorPct = Math.round(rawErrorRatio * 10000) / 100; // 2 decimal places (e.g., 4.25%)
  const marginRatio = cfg.marginPct / 100;

  let points = 0;
  let inZone = false;

  if (rawErrorRatio <= marginRatio + 1e-9) {
    inZone = true;
    const clampedRatio = Math.min(rawErrorRatio, marginRatio);
    const closeness = (marginRatio - clampedRatio) / marginRatio; // 0 at edge, 1 at exact
    const scaled =
      cfg.minZonePoints +
      (cfg.maxRoundPoints - cfg.minZonePoints) * Math.pow(closeness, 1.35);
    points = Math.min(cfg.maxRoundPoints, Math.max(cfg.minZonePoints, Math.round(scaled)));
  }

  let ratingLabel = `Outside ${cfg.marginPct}% Zone`;
  if (diffPence === 0) {
    ratingLabel = 'Exact Till Hit';
  } else if (inZone) {
    const closeness = (marginRatio - Math.min(rawErrorRatio, marginRatio)) / marginRatio;
    if (closeness >= 0.8) {
      ratingLabel = 'Checkout Pro';
    } else if (closeness >= 0.5) {
      ratingLabel = 'Savvy Shopper';
    } else {
      ratingLabel = 'Within Margin';
    }
  }

  return {
    roundNumber: round.roundNumber,
    title: round.title,
    itemCount: round.itemCount,
    items: round.items,
    actualTotalPence: actual,
    guessPence,
    diffPence,
    absErrorPct,
    points,
    maxPoints: cfg.maxRoundPoints,
    marginPct: cfg.marginPct,
    inZone,
    ratingLabel,
  };
}

export function buildShareSummary(
  results: RoundResult[],
  difficulty: Difficulty,
  mode: 'daily' | 'practice' | 'quick',
  dailyDate: string
): string {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const totalScore = results.reduce((sum, r) => sum + r.points, 0);
  const maxScore = results.reduce((sum, r) => sum + r.maxPoints, 0);
  const modeHeader =
    mode === 'daily'
      ? `TEKSCOdle Daily ${dailyDate}`
      : mode === 'quick'
        ? 'TEKSCOdle Quick Play'
        : 'TEKSCOdle Practice';

  const lines = results.map((r) => {
    const mark = r.diffPence === 0 ? '[EXACT]' : r.inZone ? '[HIT]' : '[MISS]';
    return `${mark} ${r.itemCount} ${r.itemCount === 1 ? 'item' : 'items'}: ${formatGBP(r.guessPence)} vs ${formatGBP(r.actualTotalPence)} (${r.absErrorPct.toFixed(1)}% off) -> +${r.points} pts`;
  });

  return `${modeHeader} (${cfg.label})\nScore: ${totalScore.toLocaleString()} / ${maxScore.toLocaleString()} pts\n${lines.join('\n')}`;
}
