// Per-user profile — entered once at onboarding, stored on device

const PROFILE_KEY = 'portal_user_profile'

export interface UserProfile {
  name: string
  interests: string[]
  seekingNow: string[]
  createdAt: number
}

// Onboarding options — labels shown to the user, values are practice tags
export const interestOptions: { tag: string; label: string }[] = [
  { tag: 'movement', label: 'movement' },
  { tag: 'music', label: 'music' },
  { tag: 'djing', label: 'djing' },
  { tag: 'drawing', label: 'drawing' },
  { tag: 'art', label: 'visual art' },
  { tag: 'writing', label: 'writing' },
  { tag: 'voice', label: 'voice' },
  { tag: 'rhythm', label: 'rhythm' },
  { tag: 'nature', label: 'nature' },
  { tag: 'outdoor', label: 'outdoors' },
  { tag: 'breath', label: 'breath' },
  { tag: 'improvisation', label: 'improvisation' },
]

export const seekingOptions: { tag: string; label: string }[] = [
  { tag: 'play', label: 'play' },
  { tag: 'presence', label: 'presence' },
  { tag: 'focus', label: 'focus' },
  { tag: 'grounding', label: 'grounding' },
  { tag: 'rest', label: 'rest' },
  { tag: 'stillness', label: 'stillness' },
  { tag: 'awareness', label: 'awareness' },
  { tag: 'expressive', label: 'expression' },
]

export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.interests) || !Array.isArray(parsed.seekingNow)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
