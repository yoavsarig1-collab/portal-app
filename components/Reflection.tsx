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
      className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="w-full max-w-sm flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Subtle divider */}
        <div className="w-8 h-px mx-auto" style={{ backgroundColor: color, opacity: 0.5 }} />

        <p className="text-center text-white/50 text-sm font-serif italic leading-relaxed tracking-wide">
          {prompt}
        </p>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="or just continue →"
          rows={3}
          className="w-full bg-transparent border-b border-white/10 text-white/70 text-sm
                     placeholder-white/20 resize-none outline-none py-2 leading-relaxed
                     focus:border-white/25 transition-colors"
          style={{ fontFamily: 'inherit' }}
          autoFocus={false}
        />

        <button
          onClick={() => onDone(text || undefined)}
          className="self-center text-white/25 text-xs tracking-widest uppercase hover:text-white/60 transition-colors py-2"
        >
          continue
        </button>
      </motion.div>
    </motion.div>
  )
}
