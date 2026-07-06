'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Person, PersonProfile, emptyProfile,
  getPeople, addPerson, setActivePerson,
  interestOptions, seekingOptions, avoidOptions,
} from '@/lib/people'

interface Props {
  onDone: (person: Person) => void
}

type Step = 'pick' | 'name' | 'interests' | 'seeking' | 'avoids'

const tagLabel = (t: string) => t.replace(/-/g, ' ')

export default function PersonSelector({ onDone }: Props) {
  const [step, setStep] = useState<Step>('pick')
  const [people] = useState<Person[]>(() => getPeople())
  const [name, setName] = useState('')
  const [profile, setProfile] = useState<PersonProfile>({ ...emptyProfile })

  function choosePerson(person: Person) {
    setActivePerson(person.id)
    onDone(person)
  }

  function toggleTag(field: keyof PersonProfile, tag: string) {
    setProfile(prev => {
      const list = prev[field]
      const next = list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]
      return { ...prev, [field]: next }
    })
  }

  function finishCreate() {
    const person = addPerson(name.trim() || 'Someone', profile)
    setActivePerson(person.id)
    onDone(person)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait">
        {step === 'pick' && (
          <motion.div
            key="pick"
            className="w-full max-w-xs flex flex-col"
            style={{ paddingLeft: 32, paddingRight: 32 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p
              className="text-[11px] tracking-[0.22em] uppercase font-light mb-8"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              who&rsquo;s practicing?
            </p>
            <div className="flex flex-col">
              {people.map((p, i) => (
                <motion.button
                  key={p.id}
                  onPointerDown={() => choosePerson(p)}
                  style={{ touchAction: 'manipulation', minHeight: 52 }}
                  className="w-full flex items-center justify-between py-3 text-left active:opacity-50"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: 'easeOut' }}
                >
                  <span
                    className="text-[17px] font-light tracking-wide"
                    style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', system-ui, sans-serif" }}
                  >
                    {p.name}
                  </span>
                </motion.button>
              ))}
              <motion.button
                onPointerDown={() => setStep('name')}
                style={{ touchAction: 'manipulation', minHeight: 52 }}
                className="w-full flex items-center justify-between py-3 text-left active:opacity-50"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: people.length * 0.04, duration: 0.35, ease: 'easeOut' }}
              >
                <span
                  className="text-[17px] font-light tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  + new person
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'name' && (
          <motion.div
            key="name"
            className="w-full max-w-xs flex flex-col"
            style={{ paddingLeft: 32, paddingRight: 32 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p
              className="text-[11px] tracking-[0.22em] uppercase font-light mb-8"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              what&rsquo;s your name?
            </p>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) setStep('interests')
              }}
              className="bg-transparent border-b border-white/15 text-[17px] font-light tracking-wide text-white/90 py-3 outline-none focus:border-white/40 transition-colors"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              placeholder="name"
            />
            <button
              onPointerDown={() => name.trim() && setStep('interests')}
              disabled={!name.trim()}
              style={{ touchAction: 'manipulation', minHeight: 52 }}
              className="mt-8 text-[11px] tracking-[0.18em] uppercase font-light text-left active:opacity-50 disabled:opacity-20"
            >
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>continue</span>
            </button>
          </motion.div>
        )}

        {(step === 'interests' || step === 'seeking' || step === 'avoids') && (
          <TagStep
            key={step}
            step={step}
            profile={profile}
            onToggle={toggleTag}
            onNext={() => {
              if (step === 'interests') setStep('seeking')
              else if (step === 'seeking') setStep('avoids')
              else finishCreate()
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const stepMeta: Record<'interests' | 'seeking' | 'avoids', { question: string; field: keyof PersonProfile; options: string[]; cta: string }> = {
  interests: { question: 'what draws you in?', field: 'interests', options: interestOptions, cta: 'continue' },
  seeking: { question: 'what are you seeking now?', field: 'seekingNow', options: seekingOptions, cta: 'continue' },
  avoids: { question: 'anything to avoid?', field: 'avoids', options: avoidOptions, cta: 'done' },
}

function TagStep({
  step, profile, onToggle, onNext,
}: {
  step: 'interests' | 'seeking' | 'avoids'
  profile: PersonProfile
  onToggle: (field: keyof PersonProfile, tag: string) => void
  onNext: () => void
}) {
  const meta = stepMeta[step]
  const selected = profile[meta.field]

  return (
    <motion.div
      className="w-full max-w-xs flex flex-col"
      style={{ paddingLeft: 32, paddingRight: 32 }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <p
        className="text-[11px] tracking-[0.22em] uppercase font-light mb-8"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {meta.question}
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {meta.options.map((tag, i) => {
          const isSelected = selected.includes(tag)
          return (
            <motion.button
              key={tag}
              onPointerDown={() => onToggle(meta.field, tag)}
              style={{
                touchAction: 'manipulation',
                minHeight: 40,
                borderColor: isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
              }}
              className="px-3.5 py-2 rounded-full border text-[13px] font-light tracking-wide active:opacity-60 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
            >
              <span style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}>
                {tagLabel(tag)}
              </span>
            </motion.button>
          )
        })}
      </div>
      <button
        onPointerDown={onNext}
        style={{ touchAction: 'manipulation', minHeight: 52 }}
        className="text-[11px] tracking-[0.18em] uppercase font-light text-left active:opacity-50"
      >
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>{meta.cta}</span>
      </button>
    </motion.div>
  )
}
