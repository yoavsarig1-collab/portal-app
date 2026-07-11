'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animate as anime } from 'animejs'

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

// --- Single-source water ---
// A drop lands at the center at an uneven, breathing rhythm. Perfect circles,
// physics-first: fast impact that settles slowly, every successive ring slower
// and fainter than the one before, the line thinning as it widens, thin short
// glints riding the leading edge. Pausing stills the water.

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255)
  return `rgb(${r}, ${g}, ${b})`
}

const SVG_NS = 'http://www.w3.org/2000/svg'

function WaterSource({ color, paused }: { color: string; paused: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  // anime.js returns an animation object with pause/play/cancel
  const animsRef = useRef<Set<ReturnType<typeof anime>>>(new Set())
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const anims = animsRef.current
    const glintColor = lighten(color, 0.45)

    const spawnDrop = (scale: number) => {
      const R = 118 * scale
      const rings = [
        { delay: 0,    dur: 14000, maxR: R,        sw: 1.6, op: 0.55 },
        { delay: 1100, dur: 18500, maxR: R * 0.8,  sw: 1.1, op: 0.34 },
        { delay: 2600, dur: 23000, maxR: R * 0.62, sw: 0.8, op: 0.2 },
      ]
      rings.forEach((ring, ri) => {
        const c = document.createElementNS(SVG_NS, 'circle')
        c.setAttribute('cx', '150'); c.setAttribute('cy', '150'); c.setAttribute('r', '0')
        c.setAttribute('fill', 'none'); c.setAttribute('stroke', color)
        c.setAttribute('stroke-width', String(ring.sw)); c.setAttribute('opacity', '0')
        svg.appendChild(c)

        let glint: SVGCircleElement | null = null
        if (ri === 0) {
          glint = document.createElementNS(SVG_NS, 'circle')
          glint.setAttribute('cx', '150'); glint.setAttribute('cy', '150'); glint.setAttribute('r', '0')
          glint.setAttribute('fill', 'none'); glint.setAttribute('stroke', glintColor)
          glint.setAttribute('pathLength', '100')
          glint.setAttribute('stroke-dasharray', '1.4 30 1 38 1.7 27.9')
          glint.setAttribute('stroke-linecap', 'round')
          glint.setAttribute('opacity', '0')
          svg.appendChild(glint)
        }

        const state = { t: 0, spin: 0 }
        const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)
        const draw = () => {
          const p = easeOutQuint(state.t)
          const r = 3 + p * ring.maxR
          const rise = Math.min(1, state.t / 0.06)
          const fall = 1 - Math.pow(state.t, 1.6)
          const o = ring.op * rise * fall
          const sw = ring.sw * (1 - p * 0.75)
          c.setAttribute('r', r.toFixed(1))
          c.setAttribute('opacity', o.toFixed(3))
          c.setAttribute('stroke-width', sw.toFixed(2))
          if (glint) {
            glint.setAttribute('r', r.toFixed(1))
            glint.setAttribute('opacity', (o * 1.15).toFixed(3))
            glint.setAttribute('stroke-width', (sw * 0.75).toFixed(2))
            glint.setAttribute('stroke-dashoffset', (state.spin * 100).toFixed(1))
          }
        }

        const grow = anime(state, {
          t: 1,
          duration: ring.dur,
          delay: ring.delay,
          ease: 'linear',
          onUpdate: draw,
          onComplete: () => {
            c.remove(); glint?.remove()
            anims.delete(grow)
          },
        })
        anims.add(grow)
        if (glint) {
          const spin = anime(state, {
            spin: 1, duration: ring.dur, ease: 'outSine',
            onComplete: () => anims.delete(spin),
          })
          anims.add(spin)
        }
        if (pausedRef.current) { /* spawned while paused shouldn't happen, but stay safe */ }
        draw()
      })
    }

    const scheduleNext = () => {
      dropTimerRef.current = setTimeout(() => {
        if (!pausedRef.current) spawnDrop(0.85 + Math.random() * 0.3)
        scheduleNext()
      }, 9000 + Math.random() * 9000)
    }

    spawnDrop(1)
    const early = setTimeout(() => { if (!pausedRef.current) spawnDrop(0.7) }, 1400)
    scheduleNext()

    return () => {
      clearTimeout(early)
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current)
      anims.forEach(a => a.cancel())
      anims.clear()
      while (svg.firstChild) svg.removeChild(svg.firstChild)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  // pausing stills the water
  useEffect(() => {
    const anims = animsRef.current
    if (paused) anims.forEach(a => a.pause())
    else anims.forEach(a => a.play())
  }, [paused])

  return (
    <motion.svg
      ref={svgRef}
      width={300} height={300} viewBox="0 0 300 300"
      className="absolute inset-0"
      animate={{ opacity: paused ? 0.45 : 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
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
      {/* Water scene */}
      <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

        {/* Single-source ripples */}
        <WaterSource color={color} paused={paused} />

        {/* Progress arc — very subtle */}
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

        {/* Still center point, barely breathing */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 4, height: 4, backgroundColor: color, left: '50%', top: '50%', x: '-50%', y: '-50%' }}
          animate={{ opacity: paused ? 0.25 : [0.3, 0.55, 0.3] }}
          transition={paused ? { duration: 1 } : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
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
