"use client"

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, Sparkles, ChevronDown, Check, Wand2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { SkillIcon } from '@/lib/skills/skill-icon'
import { getAllSkills, getSkill } from '@/lib/skills/registry'
import { detectSkill } from '@/lib/skills/detector'
import { moderateContent } from '@/lib/moderation'
import type { SkillId, SupportedLocale } from '@/lib/skills/types'

interface HeroSectionProps {
  customQuestion: string
  setCustomQuestion: (value: string) => void
  onCustomQuestionSubmit: (question: string, skillId?: SkillId) => void
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
  const tAdvisors = useTranslations('advisors')
  const locale = useLocale() as SupportedLocale
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [selectedSkill, setSelectedSkill] = useState<SkillId | "auto">("auto")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mismatchOpen, setMismatchOpen] = useState(false)
  const [mismatchData, setMismatchData] = useState<{ question: string; detectedSkillId: SkillId } | null>(null)
  const [moderationOpen, setModerationOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const rotatingQuestions = locale === 'de' ? rotatingQuestionsDe : rotatingQuestionsEn
  const skills = getAllSkills()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingQuestions.length)
      setAnimationKey((prev) => prev + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [rotatingQuestions.length])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buildQuestion = (input: string): string => {
    if (input.toLowerCase().startsWith('should i') || input.toLowerCase().startsWith('should')) {
      return input
    }
    return `Should I ${input}?`
  }

  const tModeration = useTranslations('moderation')

  const handleSimulateClick = () => {
    const trimmed = customQuestion.trim()
    if (!trimmed) return
    const question = buildQuestion(trimmed)

    // Content moderation check
    const modResult = moderateContent(question)
    if (modResult.blocked) {
      setModerationOpen(true)
      return
    }

    // If auto-detect or no specific advisor, proceed directly
    if (selectedSkill === "auto") {
      onCustomQuestionSubmit(question)
      return
    }

    // Check for mismatch between selected advisor and question topic
    const detected = detectSkill(question, locale)
    if (detected.skillId !== "generic" && detected.skillId !== selectedSkill) {
      setMismatchData({ question, detectedSkillId: detected.skillId })
      setMismatchOpen(true)
      return
    }

    // No mismatch or question is generic — proceed with selected advisor
    onCustomQuestionSubmit(question, selectedSkill)
  }

  const handleMismatchSwitch = () => {
    if (!mismatchData) return
    setSelectedSkill(mismatchData.detectedSkillId)
    onCustomQuestionSubmit(mismatchData.question, mismatchData.detectedSkillId)
    setMismatchOpen(false)
    setMismatchData(null)
  }

  const handleMismatchAutoDetect = () => {
    if (!mismatchData) return
    setSelectedSkill("auto")
    onCustomQuestionSubmit(mismatchData.question)
    setMismatchOpen(false)
    setMismatchData(null)
  }

  const handleMismatchContinue = () => {
    if (!mismatchData) return
    onCustomQuestionSubmit(mismatchData.question, selectedSkill === "auto" ? undefined : selectedSkill)
    setMismatchOpen(false)
    setMismatchData(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSimulateClick()
    }
  }

  const getSelectedLabel = () => {
    if (selectedSkill === "auto") {
      return t('autoAssigned')
    }
    const skill = skills.find(s => s.id === selectedSkill)
    return skill?.displayName[locale] ?? t('autoAssigned')
  }

  const getSelectedIcon = () => {
    if (selectedSkill === "auto") return null
    const skill = skills.find(s => s.id === selectedSkill)
    return skill?.icon ?? null
  }

  return (
    <section className="relative pb-16 pt-12 md:pb-24 md:pt-20">
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

          {/* Chatbot-style search bar */}
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border-2 border-border bg-card shadow-xl transition-colors focus-within:border-primary">
              {/* Input area */}
              <div className="flex items-center gap-2 px-4 py-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <input
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-3 py-2 rounded-b-2xl">
                {/* Skill selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {getSelectedIcon() ? (
                      <SkillIcon name={getSelectedIcon()!} className="h-4 w-4 text-primary" />
                    ) : (
                      <Wand2 className="h-4 w-4 text-primary" />
                    )}
                    <span>{getSelectedLabel()}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {t('advisorLabel')}
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto py-1">
                        {/* Auto-detect option */}
                        <button
                          onClick={() => { setSelectedSkill("auto"); setIsDropdownOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <Wand2 className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{t('autoAssigned')}</p>
                            <p className="text-xs text-muted-foreground truncate">{t('autoDescription')}</p>
                          </div>
                          {selectedSkill === "auto" && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>

                        <div className="h-px bg-border mx-3 my-1" />

                        {/* Skill options */}
                        {skills.map((skill) => {
                          const advisorKey = skill.id === "real-estate" ? "realEstate" : skill.id
                          return (
                            <button
                              key={skill.id}
                              onClick={() => { setSelectedSkill(skill.id); setIsDropdownOpen(false) }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                <SkillIcon name={skill.icon} className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{skill.displayName[locale]}</p>
                                <p className="text-xs text-muted-foreground truncate">{tAdvisors(`${advisorKey}.description`)}</p>
                              </div>
                              {selectedSkill === skill.id && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleSimulateClick}
                  disabled={!customQuestion.trim()}
                  size="sm"
                  className="gradient-primary text-white font-semibold hover:opacity-90 transition-opacity gap-1.5"
                >
                  {t('simulate')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {t('tryExample')}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              {t('freeHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Mismatch Warning Dialog */}
      <AlertDialog open={mismatchOpen} onOpenChange={setMismatchOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t('mismatchTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mismatchData && t('mismatchDescription', {
                detected: getSkill(mismatchData.detectedSkillId).displayName[locale],
                selected: selectedSkill !== "auto" ? getSkill(selectedSkill).displayName[locale] : t('autoAssigned')
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            {mismatchData && (
              <Button onClick={handleMismatchSwitch} className="w-full gradient-primary text-white gap-2">
                <SkillIcon name={getSkill(mismatchData.detectedSkillId).icon} className="h-4 w-4" />
                {t('switchTo', { advisor: getSkill(mismatchData.detectedSkillId).displayName[locale] })}
              </Button>
            )}
            <Button onClick={handleMismatchAutoDetect} variant="outline" className="w-full gap-2">
              <Wand2 className="h-4 w-4" />
              {t('useAutoDetect')}
            </Button>
            <Button onClick={handleMismatchContinue} variant="ghost" className="w-full text-muted-foreground">
              {t('continueAnyway')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Content Moderation Warning */}
      <AlertDialog open={moderationOpen} onOpenChange={setModerationOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {tModeration('title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tModeration('description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setModerationOpen(false)} variant="outline">
              {tModeration('close')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
