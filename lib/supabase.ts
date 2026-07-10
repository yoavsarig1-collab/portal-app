import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cloud save is optional — when env vars are absent the app is local-only
// and all account UI stays hidden
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const cloudEnabled = supabase !== null
