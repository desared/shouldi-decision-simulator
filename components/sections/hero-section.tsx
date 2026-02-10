"use client"

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeroSectionProps {
  customQuestion: string
  setCustomQuestion: (value: string) => void
  onCustomQuestionSubmit: (question: string) => void
}

const rotatingQuestionsEn = [
  "Should I change careers?",
  "Should I move abroad?",
  "Should I start a business?",
  "Should I go back to school?",
  "Should I buy a house?",
]

const rotatingQuestionsDe = [
  "Sollte ich den Beruf wechseln?",
  "Sollte ich ins Ausland ziehen?",
  "Sollte ich ein Unternehmen gründen?",
  "Sollte ich wieder studieren?",
  "Sollte ich ein Haus kaufen?",
]

export function HeroSection({
  customQuestion,
  setCustomQuestion,
  onCustomQuestionSubmit
}: HeroSectionProps) {
  const t = useTranslations('hero')
  const locale = useLocale()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)

  const rotatingQuestions = locale === 'de' ? rotatingQuestionsDe : rotatingQuestionsEn

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingQuestions.length)
      setAnimationKey((prev) => prev + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [rotatingQuestions.length])

  const handleSimulateClick = () => {
    const trimmed = customQuestion.trim()
    if (!trimmed) return
    if (trimmed.toLowerCase().startsWith('should i') || trimmed.toLowerCase().startsWith('should')) {
      onCustomQuestionSubmit(trimmed)
    } else {
      onCustomQuestionSubmit(`Should I ${trimmed}?`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSimulateClick()
    }
  }

  return (
    <section className="relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              AI-Powered Decision Analysis
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-base md:text-lg text-muted-foreground lg:text-xl">
            {t('subtitle')}
          </p>

          {/* Rotating example questions */}
          <div className="mb-6 md:mb-8 h-10 flex items-center justify-center">
            <span
              key={animationKey}
              className="animate-fade-slide inline-block text-lg md:text-xl font-semibold gradient-text"
            >
              &ldquo;{rotatingQuestions[currentIndex]}&rdquo;
            </span>
          </div>

          {/* Search bar */}
          <div className="mx-auto mb-4 flex max-w-xl gap-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('inputPlaceholder')}
                className="h-14 pl-12 bg-card text-foreground placeholder:text-muted-foreground text-lg shadow-lg border-2 border-border focus:border-primary"
              />
            </div>
            <Button
              onClick={handleSimulateClick}
              disabled={!customQuestion.trim()}
              className="h-14 px-6 md:px-8 gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="hidden sm:inline">{t('simulate')}</span>
              <ArrowRight className="h-5 w-5 sm:ml-2" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('tryExample')}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            {t('freeHint')}
          </p>
        </div>
      </div>
    </section>
  )
}
