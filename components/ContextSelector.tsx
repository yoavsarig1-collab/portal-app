'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Location, StateOfBeing, Field,
  locationLabels, stateLabels, fieldLabels,
  UserContext, saveContext,
} from '@/lib/context'

interface Props {
  initial: UserContext
  onDone: (ctx: UserContext) => void
}

type Step = 'location' | 'state' | 'field'
const steps: Step[] = ['location', 'state', 'field']

const locationOptions: Location[] = ['home', 'outdoors', 'gym', 'work', 'traveling']
const stateOptions: StateOfBeing[] = ['energized', 'calm', 'restless', 'scattered', 'anxious', 'tired', 'heavy']
const fieldOptions: Field[] = ['any', 'movement', 'music', 'art', 'writing']

const stepQuestions: Record<Step, string> = {
  location: 'where are you?',
  state: 'how do you feel?',
  field: 'what calls you?',
}

export default function ContextSelector({ initial, onDone }: Props) {
  const [step, setStep] = useState<Step>('location')
  const [ctx, setCtx] = useState<UserContext>(initial)

  function select(value: string) {
    const updated = { ...ctx, [step]: value }
    setCtx(updated)
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1])
    } else {
      saveContext(updated)
      onDone(updated)
    }
  }

  const options =
    step === 'location' ? locationOptions :
    step === 'state' ? stateOptions :
    fieldOptions

  const labels =
    step === 'location' ? locationLabels :
    step === 'state' ? stateLabels :
    fieldLabels

  const current =
    step === 'location' ? ctx.location :
    step === 'state' ? ctx.state :
    ctx.field

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="w-full max-w-xs flex flex-col gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Step indicator */}
          <div className="flex gap-1.5 justify-center">
            {steps.map(s => (
              <div
                key={s}
                className="h-px w-6 rounded-full"
                style={{ backgroundColor: steps.indexOf(s) <= steps.indexOf(step) ? '#fff' : '#333' }}
              />
            ))}
          </div>

          <p className="text-center text-white/35 text-xs tracking-widest uppercase">
            {stepQuestions[step]}
          </p>

          <div className="flex flex-col gap-2">
            {(options as string[]).map(opt => (
              <button
                key={opt}
                onClick={() => select(opt)}
                className="w-full py-3.5 px-5 text-left rounded-none border-b flex items-center justify-between group transition-all"
                style={{
                  borderColor: opt === current ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                  backgroundColor: opt === current ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                <span
                  className="text-base font-light tracking-wide transition-colors"
                  style={{ color: opt === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}
                >
                  {(labels as Record<string, string>)[opt]}
                </span>
                {opt === current && (
                  <div className="w-1 h-1 rounded-full bg-white/60" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
