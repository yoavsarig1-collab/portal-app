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

// Hourglass SVG geometry
const W = 80
const H = 140
const PAD = 6
const NECK = 5  // half-width at neck

const topPath   = `M${PAD},${PAD} L${W - PAD},${PAD} L${W/2 + NECK},${H/2} L${W/2 - NECK},${H/2} Z`
const botPath   = `M${W/2 - NECK},${H/2} L${W/2 + NECK},${H/2} L${W - PAD},${H - PAD} L${PAD},${H - PAD} Z`
const outerPath = `M${PAD},${PAD} L${W - PAD},${PAD} L${W/2 + NECK},${H/2} L${W - PAD},${H - PAD} L${PAD},${H - PAD} L${W/2 - NECK},${H/2} Z`

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

  const progress = 1 - remaining / durationSeconds  // 0 → 1 as time passes

  // Sand levels
  const topHalf   = H / 2 - PAD                     // height of top compartment
  const botHalf   = H / 2 - PAD
  const topFill   = topHalf * (1 - progress)         // shrinks top to bottom
  const botFill   = botHalf * progress               // grows from bottom
  const topSandY  = PAD                              // sand rect top y
  const botSandY  = H / 2 + (botHalf - botFill)     // sand rect top y in bottom compartment

  // Drip: a small line at the neck that pulses when not paused
  const drip = !paused && progress > 0 && progress < 1

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hourglass */}
      <div className="relative flex items-center justify-center mb-14" style={{ width: 160, height: 280 }}>

        {/* Glow behind */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 120, height: 120, backgroundColor: color, filter: 'blur(40px)', opacity: 0.12 }}
          animate={{ opacity: paused ? 0.05 : [0.08, 0.16, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg
          width={W * 2}
          height={H * 2}
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <clipPath id="top-clip">
              <path d={topPath} />
            </clipPath>
            <clipPath id="bot-clip">
              <path d={botPath} />
            </clipPath>
            <filter id="sand-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer hourglass outline */}
          <path
            d={outerPath}
            fill="none"
            stroke={color}
            strokeWidth={0.6}
            opacity={0.25}
          />

          {/* Top sand */}
          <rect
            x={0} y={topSandY}
            width={W} height={topFill}
            fill={color}
            opacity={0.55}
            clipPath="url(#top-clip)"
            style={{ transition: 'height 0.3s linear, y 0s' }}
            filter="url(#sand-glow)"
          />

          {/* Bottom sand */}
          <rect
            x={0} y={botSandY}
            width={W} height={botFill}
            fill={color}
            opacity={0.7}
            clipPath="url(#bot-clip)"
            style={{ transition: 'height 0.3s linear, y 0.3s linear' }}
            filter="url(#sand-glow)"
          />

          {/* Drip at neck */}
          {drip && (
            <motion.circle
              cx={W / 2} cy={H / 2}
              r={1.2}
              fill={color}
              opacity={0.9}
              animate={{ opacity: [0.9, 0.3, 0.9], cy: [H / 2, H / 2 + 3, H / 2] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </svg>
      </div>

      {/* Time */}
      <motion.span
        className="text-sm font-light tracking-widest mb-12"
        style={{ color, opacity: 0.5 }}
        animate={{ opacity: paused ? [0.3, 0.6, 0.3] : 0.5 }}
        transition={{ duration: paused ? 1.2 : 0, repeat: paused ? Infinity : 0 }}
      >
        {paused ? 'paused' : formatTime(remaining)}
      </motion.span>

      {/* Controls */}
      <div className="flex items-center gap-12">
        <button
          onPointerDown={handleEnd}
          className="text-white/25 text-xs tracking-widest uppercase py-4 px-4"
          style={{ touchAction: 'manipulation' }}
        >
          end
        </button>

        <button
          onPointerDown={togglePause}
          className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center active:border-white/40"
          style={{ touchAction: 'manipulation' }}
        >
          {paused ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" fill="white" fillOpacity={0.7} />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2.5" y="1.5" width="2.5" height="9" rx="1" fill="white" fillOpacity={0.7} />
              <rect x="7" y="1.5" width="2.5" height="9" rx="1" fill="white" fillOpacity={0.7} />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  )
}
