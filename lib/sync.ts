// Optional cloud sync — guest-first. Everything works from localStorage;
// a signed-in user gets their profile + history mirrored to Supabase
// and merged back on any device they sign into.

import { supabase } from './supabase'
import { getUserProfile, saveUserProfile, UserProfile } from './userProfile'
import { getHistory, SessionEntry } from './engine'

const HISTORY_KEY = 'portal_history'

export async function getSessionUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

export async function signInWithEmail(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'cloud save is not available' }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? { error: error.message } : {}
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export function onAuthChange(cb: (userEmail: string | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.email ?? null)
  })
  return () => data.subscription.unsubscribe()
}

// --- push: local → cloud ---

export async function pushProfile(profile?: UserProfile) {
  if (!supabase) return
  const user = await getSessionUser()
  if (!user) return
  const p = profile ?? getUserProfile()
  if (!p) return
  await supabase.from('profiles').upsert({
    user_id: user.id,
    name: p.name,
    interests: p.interests,
    seeking: p.seekingNow,
    updated_at: new Date().toISOString(),
  })
}

export async function pushEntry(entry: SessionEntry) {
  if (!supabase) return
  const user = await getSessionUser()
  if (!user) return
  await supabase.from('history').upsert(
    {
      user_id: user.id,
      practice_id: entry.practiceId,
      ts: entry.timestamp,
      completed: entry.completed,
      skipped_after_ms: entry.skippedAfterMs ?? null,
      reflection: entry.reflection ?? null,
      context: entry.context ?? null,
    },
    { onConflict: 'user_id,practice_id,ts' },
  )
}

// --- full sync on login: merge local + cloud both ways ---

export async function fullSync(): Promise<void> {
  if (!supabase) return
  const user = await getSessionUser()
  if (!user) return

  // profile: local wins if it exists (freshly onboarded device),
  // otherwise adopt the cloud profile
  const local = getUserProfile()
  if (local) {
    await pushProfile(local)
  } else {
    const { data } = await supabase
      .from('profiles').select().eq('user_id', user.id).maybeSingle()
    if (data) {
      saveUserProfile({
        name: data.name ?? '',
        interests: data.interests ?? [],
        seekingNow: data.seeking ?? [],
        createdAt: Date.now(),
      })
    }
  }

  // history: union of local + cloud, deduped by (practiceId, timestamp)
  const localHistory = getHistory()
  const { data: cloudRows } = await supabase
    .from('history').select().eq('user_id', user.id)

  const cloudHistory: SessionEntry[] = (cloudRows ?? []).map(r => ({
    practiceId: r.practice_id,
    timestamp: Number(r.ts),
    completed: r.completed,
    skippedAfterMs: r.skipped_after_ms ?? undefined,
    reflection: r.reflection ?? undefined,
    context: r.context ?? undefined,
  }))

  const seen = new Set(cloudHistory.map(e => `${e.practiceId}:${e.timestamp}`))
  const localOnly = localHistory.filter(e => !seen.has(`${e.practiceId}:${e.timestamp}`))

  // upload entries the cloud doesn't have
  for (const entry of localOnly) {
    await pushEntry(entry)
  }

  // merge into localStorage, newest first
  const merged = [...localHistory, ...cloudHistory]
    .filter((e, i, arr) =>
      arr.findIndex(x => x.practiceId === e.practiceId && x.timestamp === e.timestamp) === i)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 500)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(merged))
}
