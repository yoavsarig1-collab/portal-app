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
  state:    'how do you feel?',
  field:    'what calls you?',
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

  const labels: Record<string, string> =
    step === 'location' ? locationLabels :
    step === 'state' ? stateLabels :
    fieldLabels

  const current =
    step === 'location' ? ctx.location :
    step === 'state' ? ctx.state :
    ctx.field

  const stepIndex = steps.indexOf(step)

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
          {/* Step dots */}
          <div className="flex gap-2 mb-10">
            {steps.map((s, i) => (
              <div
                key={s}
                className="h-px rounded-full transition-all duration-500"
                style={{
                  width: i === stepIndex ? 20 : 10,
                  backgroundColor: i <= stepIndex ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          {/* Question */}
          <p
            className="text-[11px] tracking-[0.22em] uppercase font-light mb-8"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {stepQuestions[step]}
          </p>

          {/* Options */}
          <div className="flex flex-col">
            {(options as string[]).map((opt, i) => {
              const isSelected = opt === current
              return (
                <motion.button
                  key={opt}
                  onPointerDown={() => select(opt)}
                  style={{ touchAction: 'manipulation', minHeight: 52 }}
                  className="w-full flex items-center justify-between py-3 text-left transition-all active:opacity-50"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: 'easeOut' }}
                >
                  <span
                    className="text-[17px] font-light tracking-wide transition-all duration-200"
                    style={{
                      color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    {labels[opt]}
                  </span>
                  {isSelected && (
                    <div className="w-1 h-1 rounded-full bg-white opacity-60 flex-shrink-0" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
