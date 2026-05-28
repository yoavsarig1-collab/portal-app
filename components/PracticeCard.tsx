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
  if (m === 0) return `${s}s`
  if (s === 0) return `${m} min`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PracticeCard({ practice, onBegin, onSkip }: PracticeCardProps) {
  const color = domainColors[practice.domain]

  return (
    <motion.div
      key={practice.id}
      className="fixed inset-0 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeInOut' }}
    >
      {/* Top domain indicator — subtle line */}
      <motion.div
        className="h-px w-full"
        style={{ backgroundColor: color, opacity: 0.35 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      />

      {/* Domain label */}
      <motion.div
        className="px-8 pt-10 pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <span
          className="text-xs tracking-widest uppercase font-light"
          style={{ color, opacity: 0.7 }}
        >
          {domainLabels[practice.domain]}
        </span>
      </motion.div>

      {/* Main content — vertically centered */}
      <div className="flex-1 flex flex-col items-start justify-center px-8 gap-8">
        <motion.h1
          className="font-serif text-4xl font-light text-white leading-tight tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
        >
          {practice.name}
        </motion.h1>

        <motion.p
          className="text-white/45 text-base font-light leading-relaxed max-w-xs"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
        >
          {practice.cue}
        </motion.p>

        {/* Duration */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} />
          <span className="text-white/25 text-xs tracking-widest">{formatDuration(practice.durationSeconds)}</span>
        </motion.div>
      </div>

      {/* Bottom actions */}
      <motion.div
        className="px-8 pb-14 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        {/* Skip */}
        <button
          onClick={onSkip}
          className="text-white/18 text-sm tracking-widest uppercase hover:text-white/45 transition-colors active:text-white/60 py-3 pr-4"
        >
          not now
        </button>

        {/* Begin */}
        <button
          onClick={onBegin}
          className="flex items-center gap-3 group py-3 pl-4"
          aria-label="Begin practice"
        >
          <span className="text-white/55 text-sm tracking-widest uppercase group-hover:text-white/80 transition-colors">
            begin
          </span>
          <motion.div
            className="w-8 h-8 rounded-full border flex items-center justify-center"
            style={{ borderColor: color + '80' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2.5 1.5L7.5 5L2.5 8.5V1.5Z" fill={color} fillOpacity={0.8} />
            </svg>
          </motion.div>
        </button>
      </motion.div>
    </motion.div>
  )
}
