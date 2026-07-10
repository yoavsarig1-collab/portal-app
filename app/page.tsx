'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PracticeCard from '@/components/PracticeCard'
import Timer from '@/components/Timer'
import Reflection from '@/components/Reflection'
import ContextSelector from '@/components/ContextSelector'
import History from '@/components/History'
import Onboarding from '@/components/Onboarding'
import Account from '@/components/Account'
import { getNextPractice, recordSkip, recordComplete } from '@/lib/engine'
import { getContext, UserContext } from '@/lib/context'
import { getUserProfile } from '@/lib/userProfile'
import { cloudEnabled } from '@/lib/supabase'
import { onAuthChange, fullSync } from '@/lib/sync'
import { Practice, domainColors } from '@/lib/practices'

type Phase = 'onboarding' | 'context' | 'card' | 'timer' | 'reflection'
type Overlay = 'history' | 'account' | null

export default function Portal() {
  const [practice, setPractice] = useState<Practice | null>(null)
  const [phase, setPhase] = useState<Phase>('context')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [ctx, setCtx] = useState<UserContext | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const cardShownAt = useRef<number>(Date.now())

  // optional cloud account — sync once whenever a session appears
  useEffect(() => {
    if (!cloudEnabled) return
    const unsubscribe = onAuthChange(email => {
      setUserEmail(prev => {
        if (email && email !== prev) fullSync().catch(() => {})
        return email
      })
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const saved = getContext()
    setCtx(saved)
    // first visit — no profile yet, onboard before anything else
    if (!getUserProfile()) {
      setPhase('onboarding')
      return
    }
    // if context was set in last 3 hours, skip the selector
    if (saved.setAt && Date.now() - saved.setAt < 3 * 60 * 60 * 1000) {
      setPhase('card')
    } else {
      setPhase('context')
    }
  }, [])

  const advance = useCallback((exclude: string[] = []) => {
    const next = getNextPractice(exclude)
    setPractice(next)
    setPhase('card')
    cardShownAt.current = Date.now()
  }, [])

  useEffect(() => {
    if (phase === 'card' && !practice) {
      advance()
    }
  }, [phase, practice, advance])

  const handleContextDone = (newCtx: UserContext) => {
    setCtx(newCtx)
    advance()
  }

  const handleBegin = () => setPhase('timer')

  const handleSkip = () => {
    if (!practice) return
    const afterMs = Date.now() - cardShownAt.current
    recordSkip(practice.id, afterMs)
    const newRecent = [practice.id, ...recentIds].slice(0, 5)
    setRecentIds(newRecent)
    advance(newRecent)
  }

  const handleTimerComplete = () => setPhase('reflection')
  const handleTimerCancel = () => setPhase('reflection')

  const handleReflectionDone = (text?: string) => {
    if (!practice) return
    recordComplete(practice.id, text)
    const newRecent = [practice.id, ...recentIds].slice(0, 5)
    setRecentIds(newRecent)
    advance(newRecent)
  }

  if (!ctx) return null

  const color = practice ? domainColors[practice.domain] : '#ffffff'

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">

      {/* History button — visible on card phase only */}
      <AnimatePresence>
        {phase === 'card' && overlay === null && (
          <motion.button
            onClick={() => setOverlay('history')}
            className="fixed bottom-6 left-8 text-white/15 text-xs tracking-widest uppercase z-40 py-2 hover:text-white/40 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            log
          </motion.button>
        )}
      </AnimatePresence>

      {/* Account button — visible on card phase, only when cloud save is configured */}
      <AnimatePresence>
        {cloudEnabled && phase === 'card' && overlay === null && (
          <motion.button
            onClick={() => setOverlay('account')}
            className="fixed bottom-6 right-8 text-white/15 text-xs tracking-widest uppercase z-40 py-2 hover:text-white/40 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            {userEmail ? 'synced' : 'save'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Context reset — visible on card phase */}
      <AnimatePresence>
        {phase === 'card' && overlay === null && ctx && (
          <motion.button
            onClick={() => setPhase('context')}
            className="fixed top-10 right-8 z-40 flex items-center gap-1.5 py-2 pl-4 group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <span className="text-white/15 text-xs tracking-widest uppercase group-hover:text-white/40 transition-colors">
              {ctx.location} · {ctx.state}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main phases */}
      <AnimatePresence mode="wait">
        {phase === 'onboarding' && (
          <Onboarding
            key="onboarding"
            onDone={() => setPhase('context')}
          />
        )}

        {phase === 'context' && ctx && (
          <ContextSelector
            key="context"
            initial={ctx}
            onDone={handleContextDone}
          />
        )}

        {phase === 'card' && practice && (
          <PracticeCard
            key={`card-${practice.id}`}
            practice={practice}
            onBegin={handleBegin}
            onSkip={handleSkip}
          />
        )}

        {phase === 'timer' && practice && (
          <Timer
            key={`timer-${practice.id}`}
            durationSeconds={practice.durationSeconds}
            color={color}
            onComplete={handleTimerComplete}
            onCancel={handleTimerCancel}
          />
        )}

        {phase === 'reflection' && practice && (
          <Reflection
            key={`reflection-${practice.id}`}
            prompt={practice.reflectionPrompt}
            color={color}
            onDone={handleReflectionDone}
          />
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {overlay === 'history' && (
          <History key="history" onClose={() => setOverlay(null)} />
        )}
        {overlay === 'account' && (
          <Account key="account" userEmail={userEmail} onClose={() => setOverlay(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}
