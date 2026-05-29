'use client'

import { useEffect, useRef, useState } from 'react'
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
  if (m === 0) return `${sec}s`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// One expanding ripple ring
function Ripple({ color, delay, size }: { color: string; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        border: `0.5px solid ${color}`,
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
      }}
      initial={{ scale: 0.05, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 0,
        ease: [0.2, 0.6, 0.4, 1],
      }}
    />
  )
}

// A single falling drop
function Drop({ color, paused }: { color: string; paused: boolean }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 3,
        height: 5,
        backgroundColor: color,
        left: '50%',
        x: '-50%',
        top: '30%',
        opacity: 0.6,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      }}
      animate={paused ? {} : {
        y: [0, 60],
        opacity: [0, 0.7, 0],
        scaleY: [1, 1.3, 0.8],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 1.4,
        ease: 'easeIn',
      }}
    />
  )
}

// Rising air particles
function AirParticle({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 1.5,
        height: 1.5,
        backgroundColor: color,
        left: `calc(50% + ${x}px)`,
        bottom: '32%',
        opacity: 0,
      }}
      animate={{
        y: [0, -80],
        opacity: [0, 0.35, 0],
        x: [0, x > 0 ? 6 : -6],
      }}
      transition={{
        duration: 4.5,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: 'easeOut',
      }}
    />
  )
}

export default function Timer({ durationSeconds, color, onComplete, onCancel }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [paused, setPaused] = useState(false)

  const pausedRef      = useRef(false)
  const startRef       = useRef(Date.now())
  const totalPausedRef = useRef(0)
  const pausedAtRef    = useRef<number | null>(null)
  const doneRef        = useRef(false)
  const onCompleteRef  = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })
  const onCancelRef    = useRef(onCancel)
  useEffect(() => { onCancelRef.current = onCancel })

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

  const handleEnd = () => {
    if (!doneRef.current) {
      doneRef.current = true
      onCancelRef.current()
    }
  }

  // Progress arc
  const progress = 1 - remaining / durationSeconds
  const radius = 130
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * progress

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
    >
      {/* Elemental scene */}
      <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

        {/* Outer progress arc — very subtle */}
        <svg
          width={300} height={300}
          className="absolute inset-0"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={150} cy={150} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            opacity={0.08}
          />
          <circle
            cx={150} cy={150} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            opacity={0.2}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s linear' }}
          />
        </svg>

        {/* Ripples — water element */}
        {[0, 1, 2, 3].map(i => (
          <Ripple key={i} color={color} delay={i * 1.0} size={200} />
        ))}

        {/* Inner tight ripples */}
        {[0, 1].map(i => (
          <Ripple key={`inner-${i}`} color={color} delay={i * 1.0} size={80} />
        ))}

        {/* Air particles — rising */}
        {[-18, -8, 0, 8, 18].map((x, i) => (
          <AirParticle key={i} color={color} x={x} delay={i * 0.9} />
        ))}

        {/* Falling drop — water element */}
        <Drop color={color} paused={paused} />

        {/* Central orb */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 6, height: 6, backgroundColor: color, left: '50%', top: '50%', x: '-50%', y: '-50%' }}
          animate={{
            opacity: paused ? [0.2, 0.5, 0.2] : [0.6, 1, 0.6],
            scale: paused ? [1, 1, 1] : [1, 1.4, 1],
            boxShadow: paused
              ? [`0 0 6px 2px ${color}20`]
              : [`0 0 8px 3px ${color}30`, `0 0 16px 6px ${color}50`, `0 0 8px 3px ${color}30`],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Time */}
      <motion.div
        className="mt-6 mb-12 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          {paused ? (
            <motion.span
              key="paused"
              className="text-xs tracking-[0.22em] uppercase"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Inter', system-ui, sans-serif" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              paused
            </motion.span>
          ) : (
            <motion.span
              key="time"
              className="text-base font-light tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', system-ui, sans-serif" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {formatTime(remaining)}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-14">
        <button
          onPointerDown={handleEnd}
          style={{ touchAction: 'manipulation', minHeight: 56, minWidth: 64 }}
          className="text-[11px] tracking-[0.2em] uppercase font-light active:opacity-40 transition-opacity"
          aria-label="End practice"
        >
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>end</span>
        </button>

        <button
          onPointerDown={togglePause}
          style={{ touchAction: 'manipulation', minHeight: 56, minWidth: 56 }}
          className="w-11 h-11 rounded-full flex items-center justify-center active:opacity-50 transition-opacity"
          aria-label={paused ? 'Resume' : 'Pause'}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {paused ? (
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                <path d="M1.5 1.5L9.5 6.5L1.5 11.5V1.5Z" fill="white" fillOpacity={0.5} />
              </svg>
            ) : (
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                <rect x="1.5" y="1.5" width="3" height="10" rx="1" fill="white" fillOpacity={0.5} />
                <rect x="6.5" y="1.5" width="3" height="10" rx="1" fill="white" fillOpacity={0.5} />
              </svg>
            )}
          </div>
        </button>
      </div>
    </motion.div>
  )
}
