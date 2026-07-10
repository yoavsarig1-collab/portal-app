'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signInWithEmail, signOut } from '@/lib/sync'

interface Props {
  userEmail: string | null
  onClose: () => void
}

export default function Account({ userEmail, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSend() {
    const trimmed = email.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError(null)
    const { error } = await signInWithEmail(trimmed)
    setBusy(false)
    if (error) setError(error)
    else setSent(true)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="w-full max-w-xs flex flex-col" style={{ paddingLeft: 32, paddingRight: 32 }}>
        <p
          className="text-[11px] tracking-[0.22em] uppercase font-light mb-8"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          {userEmail ? 'your account' : 'save your practice'}
        </p>

        {userEmail ? (
          <>
            <p
              className="text-[17px] font-light tracking-wide mb-2"
              style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              {userEmail}
            </p>
            <p
              className="text-[14px] font-light leading-relaxed mb-10"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              your practice is synced. sign in with this email on any device to continue there.
            </p>
            <button
              onPointerDown={async () => { await signOut(); onClose() }}
              style={{ touchAction: 'manipulation', minHeight: 52 }}
              className="w-full py-3 text-left active:opacity-50"
            >
              <span className="text-[13px] tracking-[0.22em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
                sign out
              </span>
            </button>
          </>
        ) : sent ? (
          <p
            className="text-[15px] font-light leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            check your inbox — we sent you a link. open it on this device and you&apos;re in.
          </p>
        ) : (
          <>
            <p
              className="text-[14px] font-light leading-relaxed mb-8"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              everything already lives on this device.
              add your email only if you want your practice
              to follow you across devices. no password.
            </p>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
              placeholder="your email"
              className="w-full bg-transparent outline-none border-b pb-3 mb-6 text-[17px] font-light tracking-wide"
              style={{
                color: 'rgba(255,255,255,0.9)',
                borderColor: 'rgba(255,255,255,0.15)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            {error && (
              <p className="text-[13px] font-light mb-4" style={{ color: 'rgba(255,120,120,0.7)' }}>
                {error}
              </p>
            )}
            <button
              onPointerDown={handleSend}
              style={{ touchAction: 'manipulation', minHeight: 52, opacity: email.trim() && !busy ? 1 : 0.3 }}
              className="w-full flex items-center justify-between py-3 text-left transition-opacity active:opacity-50"
            >
              <span className="text-[13px] tracking-[0.22em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {busy ? 'sending…' : 'send me a link'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>→</span>
            </button>
          </>
        )}

        <button
          onPointerDown={onClose}
          style={{ touchAction: 'manipulation', minHeight: 52 }}
          className="w-full py-3 mt-6 text-left active:opacity-50"
        >
          <span className="text-[11px] tracking-[0.22em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.25)' }}>
            close
          </span>
        </button>
      </div>
    </motion.div>
  )
}
