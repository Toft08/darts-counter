/**
 * Tells the dart-by-dart input board which buttons are active for a given game mode.
 * Each game passes its own config so the same physical dartboard component works everywhere.
 */
export interface DartboardConfig {
  /** Which number segments (1–20) are active. 'all' enables every segment. */
  allowedSegments: number[] | 'all';
  /** Whether the Double (×2) multiplier button is enabled. */
  allowDouble: boolean;
  /** Whether the Triple (×3) multiplier button is enabled. */
  allowTriple: boolean;
  /** Whether the single bull (25) is enabled. */
  allowBull: boolean;
  /** Whether the double bull (50) is enabled. Requires allowBull. */
  allowDoubleBull: boolean;
}

/** Full dartboard — all segments, all multipliers. Used by X01 and Checkout. */
export const STANDARD_CONFIG: DartboardConfig = {
  allowedSegments: 'all',
  allowDouble: true,
  allowTriple: true,
  allowBull: true,
  allowDoubleBull: true,
};

/** Helper to build a config for a single-segment Half target (e.g. hit the 19). */
export function singleSegmentConfig(segment: number): DartboardConfig {
  return {
    allowedSegments: [segment],
    allowDouble: true,
    allowTriple: true,
    allowBull: false,
    allowDoubleBull: false,
  };
}
