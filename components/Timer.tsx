'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TimerProps {
  durationSeconds: number
  color: string
  onComplete: () => void
  onCancel: () => void
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m === 0) return `${sec}s`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Timer({ durationSeconds, color, onComplete, onCancel }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [paused, setPaused] = useState(false)

  const pausedRef = useRef(false)
  const startRef = useRef(Date.now())
  const totalPausedRef = useRef(0)
  const pausedAtRef = useRef<number | null>(null)
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { onCompleteRef.current = onComplete })

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return
      const elapsed = (Date.now() - startRef.current - totalPausedRef.current) / 1000
      const left = Math.max(0, durationSeconds - elapsed)
      setRemaining(Math.ceil(left))
      if (left <= 0 && !doneRef.current) {
        doneRef.current = true
        clearInterval(interval)
        onCompleteRef.current()
      }
    }, 250)
    return () => clearInterval(interval)
  }, [durationSeconds])

  const togglePause = () => {
    if (pausedRef.current) {
      totalPausedRef.current += Date.now() - (pausedAtRef.current ?? Date.now())
      pausedAtRef.current = null
      pausedRef.current = false
      setPaused(false)
    } else {
      pausedAtRef.current = Date.now()
      pausedRef.current = true
      setPaused(true)
    }
  }

  const radius = 100
  const circumference = 2 * Math.PI * radius
  // starts at 0 (full circle), increases to circumference (empty) as time passes
  const strokeDashoffset = circumference * (1 - remaining / durationSeconds)

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative flex items-center justify-center mb-16">
        {/* Breathing glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 260, height: 260, backgroundColor: color, opacity: 0.04 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg width={260} height={260} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={130} cy={130} r={radius} fill="none" stroke={color} strokeWidth={1} opacity={0.12} />
          {/* Depleting arc */}
          <circle
            cx={130} cy={130} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.25s linear' }}
          />
        </svg>

        <div className="flex flex-col items-center gap-1.5 relative z-10">
          <span className="font-serif text-5xl font-light tracking-tight" style={{ color }}>
            {formatTime(remaining)}
          </span>
          {paused && (
            <span className="text-white/30 text-xs tracking-widest uppercase">paused</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-10">
        <button
          onClick={onCancel}
          className="text-white/20 text-sm tracking-widest uppercase hover:text-white/50 transition-colors py-3 pr-4"
        >
          end
        </button>
        <button
          onClick={togglePause}
          className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center hover:border-white/30 transition-all active:scale-95"
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
