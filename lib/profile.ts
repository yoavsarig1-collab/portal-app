import type { Domain, Volume } from './practices'

// Yoav's starting profile — informed by conversation
export const yoavProfile = {
  interests: ['music', 'djing', 'surfing', 'basketball', 'nature', 'drawing', 'collage', 'writing'],
  seekingNow: ['play', 'presence', 'relaxation'],
  currentPractice: ['gym', 'running', 'group-workouts'],
  wantsToReturn: ['movement', 'yoga', 'basketball', 'surfing'],
  avoids: ['sustained-presence', 'long-reading', 'deep-learning'],
  adhd: true,
  nightOwl: true,
}

// Time of day → state profile name
export type TimeState = 'wake' | 'reset' | 'train' | 'play' | 'land' | 'deep-night'

export function getTimeState(): TimeState {
  const h = new Date().getHours()
  if (h >= 6 && h < 10) return 'wake'
  if (h >= 10 && h < 14) return 'reset'
  if (h >= 14 && h < 18) return 'train'
  if (h >= 18 && h < 22) return 'play'
  if (h >= 22 || h < 2) return 'land'
  return 'deep-night'
}

// Domain weights per time state (0–1, will be normalized)
export const timeStateWeights: Record<TimeState, Record<Domain, number>> = {
  wake:       { physical: 0.45, mental: 0.30, spiritual: 0.15, creative: 0.10 },
  reset:      { physical: 0.20, mental: 0.40, spiritual: 0.25, creative: 0.15 },
  train:      { physical: 0.40, mental: 0.15, spiritual: 0.10, creative: 0.35 },
  play:       { physical: 0.25, mental: 0.15, spiritual: 0.15, creative: 0.45 },
  land:       { physical: 0.10, mental: 0.15, spiritual: 0.50, creative: 0.25 },
  'deep-night': { physical: 0.05, mental: 0.10, spiritual: 0.65, creative: 0.20 },
}

// Volume weights per time state (for ADHD — bias toward micro/short by default)
export const timeStateVolumeWeights: Record<TimeState, Record<Volume, number>> = {
  wake:         { micro: 0.40, short: 0.40, medium: 0.15, long: 0.05 },
  reset:        { micro: 0.55, short: 0.35, medium: 0.08, long: 0.02 },
  train:        { micro: 0.15, short: 0.30, medium: 0.35, long: 0.20 },
  play:         { micro: 0.20, short: 0.35, medium: 0.30, long: 0.15 },
  land:         { micro: 0.45, short: 0.40, medium: 0.12, long: 0.03 },
  'deep-night': { micro: 0.60, short: 0.35, medium: 0.04, long: 0.01 },
}
