import { practices, Practice, Domain, Volume } from './practices'
import { getTimeState, timeStateWeights, timeStateVolumeWeights } from './profile'
import { getContext, locationTagBoosts, stateTagBoosts, fieldTagBoosts } from './context'
import { getActivePerson } from './people'

const SKIP_COOLDOWN_MS = 2 * 60 * 60 * 1000
const COMPLETE_COOLDOWN_MS = 4 * 60 * 60 * 1000
const NEGLECT_THRESHOLD = 10

function historyKey(): string {
  const person = getActivePerson()
  return `portal_history_${person?.id ?? 'default'}`
}

export interface SessionEntry {
  practiceId: string
  timestamp: number
  completed: boolean
  skippedAfterMs?: number
  reflection?: string
  context?: {
    location: string
    state: string
    field: string
  }
}

export function getHistory(): SessionEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(historyKey()) || '[]')
  } catch {
    return []
  }
}

export function saveEntry(entry: SessionEntry) {
  const history = getHistory()
  history.unshift(entry)
  localStorage.setItem(historyKey(), JSON.stringify(history.slice(0, 500)))
}

function domainRecency(history: SessionEntry[]): Record<Domain, number> {
  const recency: Record<Domain, number> = { physical: 999, mental: 999, spiritual: 999, creative: 999 }
  const practiceMap = Object.fromEntries(practices.map(p => [p.id, p]))
  history.forEach((entry, i) => {
    if (!entry.completed) return
    const p = practiceMap[entry.practiceId]
    if (!p) return
    if (recency[p.domain] === 999) recency[p.domain] = i
  })
  return recency
}

function hasTag(p: Practice, tags: string[]): boolean {
  return tags.some(t => p.tags.includes(t))
}

function score(p: Practice, history: SessionEntry[], now: number): number {
  const timeState = getTimeState()
  const ctx = getContext()

  const domainWeight = timeStateWeights[timeState][p.domain]
  const volumeWeight = timeStateVolumeWeights[timeState][p.volume]

  // recency suppression
  const recentEntry = history.find(h => h.practiceId === p.id)
  if (recentEntry) {
    const age = now - recentEntry.timestamp
    const cooldown = recentEntry.completed ? COMPLETE_COOLDOWN_MS : SKIP_COOLDOWN_MS
    if (age < cooldown) return 0
  }

  // quick-skip penalty
  const quickSkips = history.filter(h => h.practiceId === p.id && (h.skippedAfterMs ?? 99999) < 5000).length
  const skipPenalty = Math.max(0.1, 1 - quickSkips * 0.25)

  // completion boost
  const completions = history.filter(h => h.practiceId === p.id && h.completed).length
  const completionBoost = 1 + Math.min(completions * 0.1, 0.4)

  // neglect boost
  const recency = domainRecency(history)
  const neglectBoost = recency[p.domain] > NEGLECT_THRESHOLD ? 1.4 : 1.0

  // profile interest boosts
  const person = getActivePerson()
  const interestMatch = person && hasTag(p, person.profile.interests) ? 1.2 : 1.0
  const seekingMatch = person && hasTag(p, person.profile.seekingNow) ? 1.3 : 1.0
  const avoidPenalty = person && hasTag(p, person.profile.avoids) ? 0.3 : 1.0

  // context boosts — location, state, field
  const locationBoost = hasTag(p, locationTagBoosts[ctx.location]) ? 1.5 : 1.0
  const stateBoost = hasTag(p, stateTagBoosts[ctx.state]) ? 1.6 : 1.0

  // field: if not 'any', strongly boost matching tags, suppress non-matching
  let fieldBoost = 1.0
  if (ctx.field !== 'any') {
    const fieldTags = fieldTagBoosts[ctx.field]
    fieldBoost = hasTag(p, fieldTags) ? 2.0 : 0.4
  }

  // random noise for unexpectedness
  const noise = 0.8 + Math.random() * 0.4

  return (
    domainWeight *
    volumeWeight *
    skipPenalty *
    completionBoost *
    neglectBoost *
    interestMatch *
    seekingMatch *
    avoidPenalty *
    locationBoost *
    stateBoost *
    fieldBoost *
    noise
  )
}

export function getNextPractice(excludeIds: string[] = []): Practice {
  const history = getHistory()
  const now = Date.now()

  const candidates = practices
    .filter(p => !excludeIds.includes(p.id))
    .map(p => ({ practice: p, score: score(p, history, now) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)

  const top = candidates.slice(0, Math.min(4, candidates.length))
  if (top.length === 0) return practices[Math.floor(Math.random() * practices.length)]

  const totalScore = top.reduce((s, c) => s + c.score, 0)
  let r = Math.random() * totalScore
  for (const c of top) {
    r -= c.score
    if (r <= 0) return c.practice
  }
  return top[0].practice
}

export function recordSkip(practiceId: string, afterMs: number) {
  const ctx = getContext()
  saveEntry({
    practiceId,
    timestamp: Date.now(),
    completed: false,
    skippedAfterMs: afterMs,
    context: { location: ctx.location, state: ctx.state, field: ctx.field },
  })
}

export function recordComplete(practiceId: string, reflection?: string) {
  const ctx = getContext()
  saveEntry({
    practiceId,
    timestamp: Date.now(),
    completed: true,
    reflection,
    context: { location: ctx.location, state: ctx.state, field: ctx.field },
  })
}
