'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerProps {
  durationSeconds: number
  color: string
  onComplete: () => void
  onCancel: () => void
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m === 0) return `${sec}`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Timer({ durationSeconds, color, onComplete, onCancel }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [paused, setPaused] = useState(false)
  const startRef = useRef(Date.now())
  const pausedAtRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (pausedAtRef.current !== null) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    const elapsed = (Date.now() - startRef.current) / 1000
    const left = Math.max(0, durationSeconds - elapsed)
    setRemaining(Math.ceil(left))
    if (left <= 0) {
      onComplete()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [durationSeconds, onComplete])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [tick])

  const togglePause = () => {
    if (paused) {
      // resume: shift start time forward by paused duration
      const pausedDuration = Date.now() - (pausedAtRef.current ?? Date.now())
      startRef.current += pausedDuration
      pausedAtRef.current = null
      setPaused(false)
    } else {
      pausedAtRef.current = Date.now()
      setPaused(true)
    }
  }

  const progress = 1 - remaining / durationSeconds
  const radius = 100
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * (1 - progress)

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Breathing ring */}
      <div className="relative flex items-center justify-center mb-12">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 260, height: 260, backgroundColor: color, opacity: 0.04 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg width={260} height={260} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={130} cy={130} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.12}
          />
          {/* Progress */}
          <circle
            cx={130} cy={130} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>

        {/* Time display */}
        <div className="flex flex-col items-center gap-1 relative z-10">
          <span
            className="font-serif text-6xl font-light tracking-tight"
            style={{ color }}
          >
            {formatTime(remaining)}
          </span>
          {paused && (
            <span className="text-white/30 text-xs tracking-widest uppercase">paused</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-10">
        <button
          onClick={onCancel}
          className="text-white/20 text-sm tracking-widest uppercase hover:text-white/50 transition-colors"
        >
          end
        </button>
        <button
          onClick={togglePause}
          className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40 transition-all"
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 2L12 7L3 12V2Z" fill="white" fillOpacity={0.6} />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="2" width="3" height="10" rx="1" fill="white" fillOpacity={0.6} />
              <rect x="8" y="2" width="3" height="10" rx="1" fill="white" fillOpacity={0.6} />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  )
}
