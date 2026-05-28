'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ReflectionProps {
  prompt: string
  color: string
  onDone: (text?: string) => void
}

export default function Reflection({ prompt, color, onDone }: ReflectionProps) {
  const [text, setText] = useState('')

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
    >
      <div className="w-full max-w-xs px-8 flex flex-col gap-9">

        {/* Accent line */}
        <motion.div
          className="h-px"
          style={{ backgroundColor: color, opacity: 0.4 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 1.0, ease: 'easeOut' }}
        />

        {/* Prompt */}
        <motion.p
          className="text-[15px] font-light leading-loose"
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontStyle: 'italic',
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        >
          {prompt}
        </motion.p>

        {/* Textarea */}
        <motion.textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="…"
          rows={3}
          className="w-full bg-transparent text-[14px] font-light leading-loose resize-none outline-none transition-colors duration-200"
          style={{
            color: 'rgba(255,255,255,0.6)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            caretColor: color,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
          onFocus={e => { e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)' }}
          onBlur={e => { e.target.style.borderBottomColor = 'rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        />

        {/* Continue */}
        <motion.button
          onPointerDown={() => onDone(text || undefined)}
          style={{ touchAction: 'manipulation', minHeight: 52, alignSelf: 'center', color: 'rgba(255,255,255,0.22)' }}
          className="text-[11px] tracking-[0.22em] uppercase font-light active:opacity-40 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          continue
        </motion.button>
      </div>
    </motion.div>
  )
}
