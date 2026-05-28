const CONTEXT_KEY = 'portal_context'

export type Location = 'home' | 'outdoors' | 'gym' | 'work' | 'traveling'
export type StateOfBeing = 'tired' | 'anxious' | 'energized' | 'calm' | 'scattered' | 'heavy' | 'restless'
export type Field = 'any' | 'movement' | 'music' | 'art' | 'writing'

export interface UserContext {
  location: Location
  state: StateOfBeing
  field: Field
  setAt: number
}

export const defaultContext: UserContext = {
  location: 'home',
  state: 'calm',
  field: 'any',
  setAt: 0,
}

export function getContext(): UserContext {
  if (typeof window === 'undefined') return defaultContext
  try {
    return JSON.parse(localStorage.getItem(CONTEXT_KEY) || 'null') ?? defaultContext
  } catch {
    return defaultContext
  }
}

export function saveContext(ctx: UserContext) {
  localStorage.setItem(CONTEXT_KEY, JSON.stringify({ ...ctx, setAt: Date.now() }))
}

export const locationLabels: Record<Location, string> = {
  home: 'Home',
  outdoors: 'Outside',
  gym: 'Gym',
  work: 'Work',
  traveling: 'Traveling',
}

export const stateLabels: Record<StateOfBeing, string> = {
  tired: 'Tired',
  anxious: 'Anxious',
  energized: 'Energized',
  calm: 'Calm',
  scattered: 'Scattered',
  heavy: 'Heavy',
  restless: 'Restless',
}

export const fieldLabels: Record<Field, string> = {
  any: 'Open',
  movement: 'Movement',
  music: 'Music',
  art: 'Art',
  writing: 'Writing',
}

// Tag multipliers per location
export const locationTagBoosts: Record<Location, string[]> = {
  home:      ['floor', 'indoor', 'micro', 'stillness', 'breath', 'music', 'art', 'writing'],
  outdoors:  ['outdoor', 'nature', 'locomotion', 'walking', 'barefoot', 'surfing'],
  gym:       ['strength', 'body-weight', 'inversion', 'coordination', 'handstand'],
  work:      ['micro', 'seated', 'breath', 'focus', 'mental'],
  traveling: ['micro', 'breath', 'body-scan', 'presence', 'awareness'],
}

// Tag multipliers per state
export const stateTagBoosts: Record<StateOfBeing, string[]> = {
  tired:     ['passive', 'micro', 'breath', 'stillness', 'gentle', 'decompression'],
  anxious:   ['breath', 'stillness', 'slow', 'body-scan', 'nervous-system', 'calm'],
  energized: ['locomotion', 'play', 'acrobatics', 'strength', 'improvisation', 'coordination'],
  calm:      ['flow', 'awareness', 'presence', 'mobility', 'creative'],
  scattered: ['micro', 'focus', 'adhd-friendly', 'single-focus', 'proprioception'],
  heavy:     ['gentle', 'floor', 'breath', 'gratitude', 'spiritual', 'rolling'],
  restless:  ['locomotion', 'play', 'movement', 'rhythm', 'improvisation'],
}

// Tag multipliers per field
export const fieldTagBoosts: Record<Field, string[]> = {
  any:      [],
  movement: ['locomotion', 'mobility', 'coordination', 'floor', 'body-weight', 'movement-culture'],
  music:    ['music', 'rhythm', 'djing', 'percussion', 'sound', 'listening'],
  art:      ['drawing', 'collage', 'art', 'visual', 'creative', 'expressive'],
  writing:  ['writing', 'reflection', 'journal', 'word', 'integration'],
}
