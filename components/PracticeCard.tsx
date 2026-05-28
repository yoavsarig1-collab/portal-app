'use client'

import { motion } from 'framer-motion'
import { Practice, domainColors, domainLabels } from '@/lib/practices'

interface PracticeCardProps {
  practice: Practice
  onBegin: () => void
  onSkip: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (s === 0 && m > 0) return `${m} min`
  if (m === 0) return `${s}s`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PracticeCard({ practice, onBegin, onSkip }: PracticeCardProps) {
  const color = domainColors[practice.domain]

  return (
    <motion.div
      key={practice.id}
      className="fixed inset-0 bg-black flex flex-col"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Top domain line — 1px, full width */}
      <motion.div
        className="h-px w-full flex-shrink-0"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.5 }}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
      />

      {/* Domain label */}
      <motion.div
        className="px-8 pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <span
          className="text-[10px] tracking-[0.2em] uppercase font-light"
          style={{ color, opacity: 0.6 }}
        >
          {domainLabels[practice.domain]}
        </span>
      </motion.div>

      {/* Main content — vertically centered with generous spacing */}
      <div className="flex-1 flex flex-col justify-center px-8 gap-7">

        {/* Practice name */}
        <motion.h1
          className="text-[2.6rem] leading-tight font-light text-white"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", opacity: 0.9 }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        >
          {practice.name}
        </motion.h1>

        {/* Cue */}
        <motion.p
          className="text-[15px] font-light leading-[1.75] max-w-[280px]"
          style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: 'easeOut' }}
        >
          {practice.cue}
        </motion.p>

        {/* Duration */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: color, opacity: 0.5 }}
          />
          <span
            className="text-[11px] tracking-[0.18em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            {formatDuration(practice.durationSeconds)}
          </span>
        </motion.div>
      </div>

      {/* Bottom actions — large touch targets */}
      <motion.div
        className="flex items-end justify-between px-7 pb-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.7 }}
      >
        {/* Skip */}
        <button
          onPointerDown={onSkip}
          style={{ touchAction: 'manipulation', minHeight: 56, minWidth: 80 }}
          className="flex items-center justify-start text-[11px] tracking-[0.18em] uppercase font-light active:opacity-60 transition-opacity"
          aria-label="Skip this practice"
        >
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>not now</span>
        </button>

        {/* Begin */}
        <button
          onPointerDown={onBegin}
          style={{ touchAction: 'manipulation', minHeight: 56, minWidth: 80 }}
          className="flex items-center gap-3 justify-end active:opacity-70 transition-opacity group"
          aria-label="Begin practice"
        >
          <span
            className="text-[11px] tracking-[0.18em] uppercase font-light"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            begin
          </span>
          <motion.div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: `1px solid ${color}60` }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
              <path d="M1 1L8 5.5L1 10V1Z" fill={color} fillOpacity={0.85} />
            </svg>
          </motion.div>
        </button>
      </motion.div>
    </motion.div>
  )
}
