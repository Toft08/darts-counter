/**
 * Represents a single dart throw with full semantic information.
 * Having segment + multiplier separates the "what was hit" from the "score it produced",
 * which is essential for games like Half that care about HOW you hit, not just how many points.
 */
export interface DartThrow {
  /** Dartboard segment: 0 = miss, 1–20 = standard number, 25 = bull, -1 = synthetic (per-turn) */
  segment: number;
  /** Multiplier applied: 1 = single, 2 = double, 3 = triple */
  multiplier: 1 | 2 | 3;
  /** Calculated score. For segment 25: single = 25, double = 50 (no triple bull). */
  score: number;
}

/** Build a DartThrow from a segment + multiplier, calculating score automatically. */
export function makeDartThrow(segment: number, multiplier: 1 | 2 | 3): DartThrow {
  let score: number;
  if (segment === 0) {
    score = 0;
  } else if (segment === 25) {
    // Bull: single = 25, double = 50 (triple bull not used in standard darts)
    score = multiplier === 2 ? 50 : 25;
  } else {
    score = segment * multiplier;
  }
  return { segment, multiplier, score };
}

/**
 * Build a synthetic DartThrow for per-turn mode where individual dart data is unavailable.
 * These are identifiable by segment === -1.
 */
export function makeSyntheticThrow(totalScore: number): DartThrow {
  return { segment: -1, multiplier: 1, score: totalScore };
}

/** Returns true if the throw was entered in per-turn (numeric) mode. */
export function isSyntheticThrow(dart: DartThrow): boolean {
  return dart.segment === -1;
}
