'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendFeedback } from '@/lib/sync'

interface Props {
  onClose: () => void
}

export default function Feedback({ onClose }: Props) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    const trimmed = message.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError(null)
    const { error } = await sendFeedback(trimmed)
    setBusy(false)
    if (error) setError('could not send — try again in a moment')
    else setSent(true)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
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
          leave a note
        </p>

        {sent ? (
          <p className="text-[15px] font-light leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            received. thank you — it goes straight to the person building this.
          </p>
        ) : (
          <>
            <p className="text-[14px] font-light leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              what worked, what didn&apos;t, what you wish it did. anything helps.
            </p>
            <textarea
              autoFocus
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="write here…"
              className="w-full bg-transparent outline-none resize-none border-b pb-3 mb-6 text-[15px] font-light leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.9)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            />
            {error && (
              <p className="text-[13px] font-light mb-4" style={{ color: 'rgba(255,120,120,0.7)' }}>
                {error}
              </p>
            )}
            <button
              onPointerDown={handleSend}
              style={{ touchAction: 'manipulation', minHeight: 52, opacity: message.trim() && !busy ? 1 : 0.3 }}
              className="w-full flex items-center justify-between py-3 text-left transition-opacity active:opacity-50"
            >
              <span className="text-[13px] tracking-[0.22em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {busy ? 'sending…' : 'send'}
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
