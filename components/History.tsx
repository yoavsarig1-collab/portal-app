'use client'

import { motion } from 'framer-motion'
import { getHistory, SessionEntry } from '@/lib/engine'
import { practices, domainColors, domainLabels } from '@/lib/practices'

interface Props {
  onClose: () => void
}

const practiceMap = Object.fromEntries(practices.map(p => [p.id, p]))

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function History({ onClose }: Props) {
  const history = getHistory()
  const completed = history.filter(h => h.completed)
  const skipped = history.filter(h => !h.completed)

  const domainCount: Record<string, number> = {}
  completed.forEach(h => {
    const p = practiceMap[h.practiceId]
    if (p) domainCount[p.domain] = (domainCount[p.domain] || 0) + 1
  })

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col z-50"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="px-8 pt-14 pb-6 flex items-center justify-between border-b border-white/[0.06]">
        <span className="text-white/40 text-xs tracking-widest uppercase">history</span>
        <button
          onClick={onClose}
          className="text-white/25 text-xs tracking-widest uppercase hover:text-white/60 transition-colors py-2 pl-4"
        >
          close
        </button>
      </div>

      {/* Stats strip */}
      {completed.length > 0 && (
        <div className="px-8 py-5 flex gap-6 border-b border-white/[0.06]">
          <div className="flex flex-col gap-0.5">
            <span className="text-white/70 text-xl font-light font-serif">{completed.length}</span>
            <span className="text-white/25 text-xs tracking-widest">completed</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white/70 text-xl font-light font-serif">{skipped.length}</span>
            <span className="text-white/25 text-xs tracking-widest">skipped</span>
          </div>
          <div className="flex flex-col gap-1 ml-auto">
            <div className="flex gap-2 items-center flex-wrap justify-end">
              {Object.entries(domainCount).map(([domain, count]) => (
                <div key={domain} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: domainColors[domain as keyof typeof domainColors] }} />
                  <span className="text-white/25 text-xs">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log */}
      <div className="flex-1 overflow-y-auto px-8 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-white/20 text-sm font-light">nothing yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {history.slice(0, 60).map((entry, i) => {
              const p = practiceMap[entry.practiceId]
              if (!p) return null
              const color = domainColors[p.domain]
              return (
                <motion.div
                  key={i}
                  className="flex items-start gap-4 py-4 border-b border-white/[0.05]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {/* Domain dot + completed indicator */}
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color, opacity: entry.completed ? 1 : 0.3 }}
                    />
                    {entry.completed && (
                      <div className="w-px flex-1 min-h-[8px]" style={{ backgroundColor: color, opacity: 0.15 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="text-sm font-light truncate"
                        style={{ color: entry.completed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
                      >
                        {p.name}
                      </span>
                      <span className="text-white/20 text-xs flex-shrink-0">{timeAgo(entry.timestamp)}</span>
                    </div>
                    {entry.reflection && (
                      <p className="text-white/25 text-xs italic mt-1 leading-relaxed">{entry.reflection}</p>
                    )}
                    {entry.context && (
                      <p className="text-white/15 text-xs mt-0.5">
                        {entry.context.location} · {entry.context.state}
                        {entry.context.field !== 'any' && ` · ${entry.context.field}`}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
