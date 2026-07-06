const PEOPLE_KEY = 'portal_people'
const ACTIVE_KEY = 'portal_active_person'
const ACTIVE_TTL_MS = 3 * 60 * 60 * 1000

export interface PersonProfile {
  interests: string[]
  seekingNow: string[]
  avoids: string[]
}

export interface Person {
  id: string
  name: string
  profile: PersonProfile
  createdAt: number
}

export const emptyProfile: PersonProfile = { interests: [], seekingNow: [], avoids: [] }

// Seed person — Yoav's original hardcoded profile, preserved so existing
// history/behavior carries over for the first person on a device.
const yoavSeed: Person = {
  id: 'yoav',
  name: 'Yoav',
  profile: {
    interests: ['music', 'djing', 'surfing', 'basketball', 'nature', 'drawing', 'collage', 'writing'],
    seekingNow: ['play', 'presence', 'relaxation'],
    avoids: ['sustained-presence', 'long-reading', 'deep-learning'],
  },
  createdAt: 0,
}

interface ActiveState {
  id: string
  setAt: number
}

export function getPeople(): Person[] {
  if (typeof window === 'undefined') return [yoavSeed]
  try {
    const raw = localStorage.getItem(PEOPLE_KEY)
    if (!raw) {
      savePeople([yoavSeed])
      return [yoavSeed]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [yoavSeed]
  } catch {
    return [yoavSeed]
  }
}

export function savePeople(people: Person[]) {
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people))
}

export function addPerson(name: string, profile: PersonProfile = emptyProfile): Person {
  const person: Person = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    profile,
    createdAt: Date.now(),
  }
  savePeople([...getPeople(), person])
  return person
}

export function updatePerson(id: string, updates: Partial<Pick<Person, 'name' | 'profile'>>) {
  savePeople(getPeople().map(p => (p.id === id ? { ...p, ...updates } : p)))
}

export function deletePerson(id: string) {
  savePeople(getPeople().filter(p => p.id !== id))
  const active = getActiveState()
  if (active?.id === id) clearActivePerson()
}

export function getActiveState(): ActiveState | null {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null')
  } catch {
    return null
  }
}

export function setActivePerson(id: string) {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify({ id, setAt: Date.now() }))
}

export function clearActivePerson() {
  localStorage.removeItem(ACTIVE_KEY)
}

export function getActivePerson(): Person | null {
  const active = getActiveState()
  if (!active) return null
  return getPeople().find(p => p.id === active.id) ?? null
}

export function isActivePersonFresh(): boolean {
  const active = getActiveState()
  if (!active) return false
  return Date.now() - active.setAt < ACTIVE_TTL_MS
}

// Curated, real tag values (see lib/practices.ts) so preferences actually
// affect scoring — not just decorative labels.
export const interestOptions = [
  'music', 'djing', 'drawing', 'collage', 'writing', 'art',
  'basketball', 'surfing', 'nature', 'movement-culture',
  'yoga-adjacent', 'strength', 'walking', 'acrobatics', 'meditation',
]

export const seekingOptions = [
  'play', 'presence', 'rest', 'calm', 'focus', 'energy', 'creativity', 'grounding', 'flow',
]

export const avoidOptions = [
  'strength', 'inversion', 'acrobatics', 'stillness', 'eyes-closed', 'outdoor',
]
