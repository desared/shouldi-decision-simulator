"use client"

import { useTranslations } from 'next-intl'
import { ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeroSectionProps {
  customQuestion: string
  setCustomQuestion: (value: string) => void
  onCustomQuestionSubmit: (question: string) => void
}

export function HeroSection({
  customQuestion,
  setCustomQuestion,
  onCustomQuestionSubmit
}: HeroSectionProps) {
  const t = useTranslations('hero')

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
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
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
          <p className="mx-auto mb-8 md:mb-10 max-w-2xl text-base md:text-lg text-muted-foreground lg:text-xl">
            {t('subtitle')}
          </p>

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
