'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

// --- Hockney pool water ---
// Meandering hand-drawn light lines over turquoise, after the pool in
// Portrait of an Artist. Each line slowly morphs between two jittered
// shapes; pausing stills the water.

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Meandering caustic line along a tilted axis: both variants share the same
// command structure so framer-motion can morph between them
function meanderPair(seed: number, cx: number, cy: number, length: number, amp: number, angle: number) {
  const rand = mulberry32(seed)
  const segs = 6
  const step = length / segs
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const pt = (t: number, off: number) => {
    const lx = -length / 2 + t
    return [cx + lx * cos - off * sin, cy + lx * sin + off * cos]
  }

  const build = (drift: number) => {
    const offs: number[] = []
    for (let i = 0; i <= segs * 3; i++) offs.push((rand() - 0.5) * amp * 2)
    const [sx, sy] = pt(0, offs[0] + drift)
    let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`
    for (let i = 0; i < segs; i++) {
      const flip = i % 2 === 0 ? 1 : -1
      const [c1x, c1y] = pt(step * (i + 0.35), offs[i * 3 + 1] + drift * flip)
      const [c2x, c2y] = pt(step * (i + 0.65), offs[i * 3 + 2] - drift * flip)
      const [nx, ny] = pt(step * (i + 1), offs[i * 3 + 3] ?? (rand() - 0.5) * amp)
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}`
    }
    return d
  }

  return [build(amp * 0.6), build(-amp * 0.6)]
}

// Small closed squiggle loop — the little light cells in Hockney's water
function loopPair(seed: number, cx: number, cy: number, rx: number, ry: number) {
  const rand = mulberry32(seed)
  const n = 6
  const build = (phase: number) => {
    const pts: number[][] = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const jr = 1 + (rand() - 0.5) * 0.5 + Math.sin(a * 2 + phase) * 0.15
      pts.push([cx + Math.cos(a) * rx * jr, cy + Math.sin(a) * ry * jr])
    }
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
    for (let i = 0; i < n; i++) {
      const p1 = pts[i]
      const p2 = pts[(i + 1) % n]
      const mx = (p1[0] + p2[0]) / 2 + (rand() - 0.5) * 6
      const my = (p1[1] + p2[1]) / 2 + (rand() - 0.5) * 6
      d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
    }
    return d + ' Z'
  }
  return [build(0), build(Math.PI)]
}

interface LineSpec {
  a: string
  b: string
  width: number
  opacity: number
  duration: number
  delay: number
}

function buildLines(): LineSpec[] {
  const rand = mulberry32(42)
  const specs: LineSpec[] = []

  // long meanders at varied angles, scattered over the pool
  const meanders = [
    { cx: 150, cy: 78,  len: 150, amp: 7,  ang: -0.12, sw: 1.8, op: 0.45 },
    { cx: 132, cy: 106, len: 195, amp: 10, ang: 0.10,  sw: 2.6, op: 0.65 },
    { cx: 160, cy: 136, len: 210, amp: 12, ang: -0.06, sw: 2.2, op: 0.5 },
    { cx: 145, cy: 168, len: 205, amp: 11, ang: 0.14,  sw: 2.9, op: 0.7 },
    { cx: 158, cy: 198, len: 175, amp: 9,  ang: -0.16, sw: 2.0, op: 0.5 },
    { cx: 148, cy: 226, len: 120, amp: 6,  ang: 0.08,  sw: 1.5, op: 0.35 },
  ]
  meanders.forEach((m, i) => {
    const [a, b] = meanderPair(1000 + i * 97, m.cx, m.cy, m.len, m.amp, m.ang)
    specs.push({ a, b, width: m.sw, opacity: m.op, duration: 5 + (i % 4) * 1.3, delay: i * 0.5 })
  })

  // closed light cells between the meanders
  const loops = [
    { cx: 108, cy: 92,  rx: 16, ry: 9 },
    { cx: 196, cy: 118, rx: 20, ry: 11 },
    { cx: 118, cy: 152, rx: 14, ry: 8 },
    { cx: 184, cy: 182, rx: 18, ry: 10 },
    { cx: 138, cy: 212, rx: 13, ry: 7 },
    { cx: 208, cy: 152, rx: 11, ry: 7 },
  ]
  loops.forEach((l, i) => {
    const [a, b] = loopPair(2000 + i * 131, l.cx, l.cy, l.rx, l.ry)
    specs.push({
      a, b,
      width: 1.3 + rand() * 1.0,
      opacity: 0.3 + rand() * 0.25,
      duration: 6 + (i % 3) * 1.5,
      delay: 0.3 + i * 0.7,
    })
  })

  return specs
}

function HockneyPool({ color, paused }: { color: string; paused: boolean }) {
  const lines = useMemo(buildLines, [])

  return (
    <motion.svg
      width={300} height={300} viewBox="0 0 300 300"
      className="absolute inset-0"
      animate={{ opacity: paused ? 0.45 : 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <defs>
        <radialGradient id="pool-water" cx="42%" cy="38%" r="78%">
          <stop offset="0%" stopColor="#A9E6F2" />
          <stop offset="42%" stopColor="#5FC4DE" />
          <stop offset="100%" stopColor="#2D93B5" />
        </radialGradient>
        <radialGradient id="pool-patch" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4EEF7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C4EEF7" stopOpacity="0" />
        </radialGradient>
        <clipPath id="pool-clip">
          <circle cx={150} cy={150} r={118} />
        </clipPath>
        {/* painterly wobble on the light lines */}
        <filter id="pool-texture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
      </defs>

      {/* water */}
      <circle cx={150} cy={150} r={118} fill="url(#pool-water)" opacity={0.92} />

      {/* pale light patches under the lines */}
      <g clipPath="url(#pool-clip)">
        <ellipse cx={122} cy={110} rx={52} ry={34} fill="url(#pool-patch)" />
        <ellipse cx={188} cy={172} rx={58} ry={38} fill="url(#pool-patch)" />
        <ellipse cx={142} cy={214} rx={40} ry={24} fill="url(#pool-patch)" />
      </g>

      {/* dancing light lines */}
      <g clipPath="url(#pool-clip)" filter="url(#pool-texture)">
        {lines.map((l, i) => (
          <motion.path
            key={i}
            fill="none"
            stroke="#F5FBFC"
            strokeWidth={l.width}
            strokeLinecap="round"
            opacity={l.opacity}
            initial={{ d: l.a }}
            animate={paused ? { d: l.a } : { d: [l.a, l.b, l.a] }}
            transition={paused
              ? { duration: 2.5, ease: 'easeOut' }
              : { duration: l.duration, delay: l.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </g>

      {/* soft domain-color halo around the pool */}
      <circle
        cx={150} cy={150} r={118}
        fill="none" stroke={color} strokeWidth={1} opacity={0.25}
      />
    </motion.svg>
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
      {/* Pool scene */}
      <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

        {/* Hockney water */}
        <HockneyPool color={color} paused={paused} />

        {/* Progress arc — very subtle, just outside the water */}
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
