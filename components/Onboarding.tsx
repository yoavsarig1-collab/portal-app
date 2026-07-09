'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserProfile, saveUserProfile,
  interestOptions, seekingOptions,
} from '@/lib/userProfile'

interface Props {
  onDone: (profile: UserProfile) => void
}

type Step = 'welcome' | 'name' | 'interests' | 'seeking'
const steps: Step[] = ['welcome', 'name', 'interests', 'seeking']

const stepQuestions: Record<Step, string> = {
  welcome: '',
  name: 'what do we call you?',
  interests: 'what draws you? pick a few',
  seeking: 'what are you seeking? pick a few',
}

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [seeking, setSeeking] = useState<string[]>([])

  const stepIndex = steps.indexOf(step)

  function next() {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1])
    } else {
      const profile: UserProfile = {
        name: name.trim(),
        interests,
        seekingNow: seeking,
        createdAt: Date.now(),
      }
      saveUserProfile(profile)
      onDone(profile)
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag])
  }

  const multiOptions = step === 'interests' ? interestOptions : seekingOptions
  const multiSelected = step === 'interests' ? interests : seeking
  const multiSetter = step === 'interests' ? setInterests : setSeeking
  const canContinue =
    step === 'welcome' ? true :
    step === 'name' ? name.trim().length > 0 :
    multiSelected.length > 0

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="w-full max-w-xs flex flex-col"
          style={{ paddingLeft: 32, paddingRight: 32 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {step === 'welcome' ? (
            <>
              <p
                className="text-[26px] font-light tracking-wide mb-4"
                style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Lora', Georgia, serif" }}
              >
                portal
              </p>
              <p
                className="text-[15px] font-light leading-relaxed mb-12"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                a practice for shifting state.
                tell us a little about yourself
                and the practices will find you.
              </p>
            </>
          ) : (
            <>
              {/* Step dots */}
              <div className="flex gap-2 mb-10">
                {steps.slice(1).map((s, i) => (
                  <div
                    key={s}
                    className="h-px rounded-full transition-all duration-500"
                    style={{
                      width: i === stepIndex - 1 ? 20 : 10,
                      backgroundColor: i <= stepIndex - 1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>

              <p
                className="text-[11px] tracking-[0.22em] uppercase font-light mb-8"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {stepQuestions[step]}
              </p>
            </>
          )}

          {step === 'name' && (
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canContinue) next() }}
              placeholder="your name"
              maxLength={40}
              className="w-full bg-transparent outline-none border-b pb-3 mb-4 text-[20px] font-light tracking-wide"
              style={{
                color: 'rgba(255,255,255,0.9)',
                borderColor: 'rgba(255,255,255,0.15)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
          )}

          {(step === 'interests' || step === 'seeking') && (
            <div className="flex flex-wrap gap-x-2 gap-y-3 mb-4">
              {multiOptions.map((opt, i) => {
                const isSelected = multiSelected.includes(opt.tag)
                return (
                  <motion.button
                    key={opt.tag}
                    onPointerDown={() => toggle(multiSelected, multiSetter, opt.tag)}
                    style={{
                      touchAction: 'manipulation',
                      minHeight: 44,
                      color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                      borderColor: isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    className="px-4 rounded-full border text-[15px] font-light tracking-wide transition-all duration-200 active:opacity-50"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35, ease: 'easeOut' }}
                  >
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>
          )}

          <motion.button
            onPointerDown={() => { if (canContinue) next() }}
            style={{ touchAction: 'manipulation', minHeight: 52 }}
            className="w-full flex items-center justify-between py-3 mt-8 text-left transition-all active:opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: canContinue ? 1 : 0.25 }}
            transition={{ duration: 0.35 }}
          >
            <span
              className="text-[13px] tracking-[0.22em] uppercase font-light"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {step === 'welcome' ? 'begin' : step === 'seeking' ? 'enter' : 'continue'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>→</span>
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
