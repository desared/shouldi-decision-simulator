"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, ChevronRight, ChevronLeft, Sparkles, CheckCircle, Lock, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ConfidenceChart } from "@/components/ui/confidence-chart"
import { cn } from "@/lib/utils"
import { moderateContent } from "@/lib/moderation"
import { generateSurveyQuestionsAction, generateOutcomesAction } from "@/app/actions/gemini"
import { type SurveyQuestion, type SurveyOutcome, type GeminiOutcomeResponse } from "@/lib/gemini-service"
import { useFirestore } from "@/contexts/firestore-context"
import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { detectSkill } from "@/lib/skills/detector"
import { getSkill } from "@/lib/skills/registry"
import { SkillIcon } from "@/lib/skills/skill-icon"
import type { SupportedLocale, SkillId } from "@/lib/skills/types"

interface DashboardSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  userQuestion: string
  forcedSkillId?: SkillId
  onSave?: (questions: string[], answers: Record<string, string>, outcomes: SurveyOutcome[]) => Promise<void>
}

type SurveyStep = "loading" | "questions" | "freetext" | "generating" | "saving" | "results"

export function DashboardSurveyModal({ isOpen, onClose, userQuestion, forcedSkillId }: DashboardSurveyModalProps) {
  const t = useTranslations('survey')
  const tModeration = useTranslations('moderation')
  const locale = useLocale()
  const [step, setStep] = useState<SurveyStep>("loading")
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { question: string; answer: string }>>({})
  const [outcomes, setOutcomes] = useState<GeminiOutcomeResponse | null>(null)
  const [detectedSkillId, setDetectedSkillId] = useState<SkillId>("generic")
  const [freetextValue, setFreetextValue] = useState("")
  const [moderationOpen, setModerationOpen] = useState(false)

  const { createScenario, createSimulation, selectScenario, canCreateScenario } = useFirestore()
  const canSave = canCreateScenario()

  useEffect(() => {
    if (isOpen && userQuestion) {
      fetchQuestions() // Renamed loadQuestions to fetchQuestions
    }
  }, [isOpen, userQuestion])

  useEffect(() => {
    if (!isOpen) {
      setStep("loading")
      setQuestions([])
      setCurrentQuestion(0)
      setAnswers({})
      setOutcomes(null)
      setDetectedSkillId("generic")
      setFreetextValue("")
      setModerationOpen(false)
    }
  }, [isOpen])

  const fetchQuestions = async () => {
    setStep("loading")
    try {
      // Use forced skill if provided, otherwise auto-detect
      const skillId = forcedSkillId ?? detectSkill(userQuestion, locale as SupportedLocale).skillId
      setDetectedSkillId(skillId)

      // Use Server Action
      const data = await generateSurveyQuestionsAction(userQuestion, 5, locale, skillId)
      setQuestions(data.questions)

      // Initialize current answers (this part was in the user's snippet, but the original code handles answers differently)
      // The original code's `answers` state stores `{ question: string; answer: string }`
      // The user's snippet implies `answers` would store just the option value.
      // I will keep the original `answers` structure and initialize it with empty answers.
      const initialAnswers: Record<string, { question: string; answer: string }> = {}
      data.questions.forEach(q => {
        initialAnswers[q.id] = { question: q.question, answer: "" }
      })
      setAnswers(initialAnswers) // Initialize answers for all questions
      setStep("questions")
    } catch (error) {
      console.error("Failed to fetch questions:", error)
      onClose()
    }
  }

  const handleAnswer = (questionId: string, question: string, optionLabel: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { question, answer: optionLabel }
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setStep("freetext")
    }
  }

  const handleFreetextSubmit = async (skip: boolean) => {
    if (!skip && freetextValue.trim()) {
      const modResult = moderateContent(freetextValue)
      if (modResult.blocked) {
        setModerationOpen(true)
        return
      }
    }

    // Build final answers including freetext if provided
    const finalAnswers: Record<string, { question: string; answer: string }> = {}
    questions.forEach(q => {
      finalAnswers[q.id] = answers[q.id] || { question: q.question, answer: "Unknown" }
    })
    if (!skip && freetextValue.trim()) {
      finalAnswers["freetext"] = {
        question: t('freetextQuestion'),
        answer: freetextValue.trim()
      }
    }

    // Update answers state so saveScenarioAndSimulation uses all answers
    setAnswers(finalAnswers)

    setStep("generating")
    try {
      const data = await generateOutcomesAction(userQuestion, finalAnswers, false, locale, detectedSkillId !== "generic" ? detectedSkillId : undefined)
      setOutcomes(data)

      if (canSave) {
        setStep("saving")
        await saveScenarioAndSimulation(data, finalAnswers)
      }

      setStep("results")
    } catch (error) {
      console.error("Failed to generate outcomes:", error)
      setStep("results")
    }
  }

  const saveScenarioAndSimulation = async (outcomeData: GeminiOutcomeResponse, answersToSave?: Record<string, { question: string; answer: string }>) => {
    const effectiveAnswers = answersToSave || answers
    try {
      // Create scenario title from question
      const title = userQuestion.replace(/^should i\s*/i, '').replace(/\?$/, '')
      const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1)

      // Use detected skill for icon
      const skill = getSkill(detectedSkillId)
      const icon = skill.icon

      // Create description from summary
      const description = outcomeData.summary.length > 150
        ? outcomeData.summary.substring(0, 147) + '...'
        : outcomeData.summary

      // Create the scenario first
      const scenarioId = await createScenario(capitalizedTitle, description, icon, detectedSkillId !== "generic" ? detectedSkillId : undefined)

      // Select the new scenario to create simulation under it
      selectScenario(scenarioId)

      // Convert outcomes to simulation format
      const simulationOutcomes = outcomeData.outcomes.map((outcome, index) => ({
        id: `outcome-${index}`,
        label: outcome.title,
        value: outcome.confidence === 'high' ? 80 : outcome.confidence === 'medium' ? 60 : 40,
        rangeMin: outcome.confidence === 'high' ? 70 : outcome.confidence === 'medium' ? 45 : 25,
        rangeMax: outcome.confidence === 'high' ? 90 : outcome.confidence === 'medium' ? 75 : 55,
        trend: outcome.confidence === 'high' ? 'up' as const : outcome.confidence === 'medium' ? 'stable' as const : 'down' as const,
        description: outcome.description,
        confidence: outcome.confidence,
        confidenceInterval: outcome.confidenceInterval,
      }))

      // Convert answers to factors format
      const simulationFactors = Object.entries(effectiveAnswers).map(([id, { question, answer }], index) => {
        // Map answer sentiment to value
        let value = 50
        const lowerAnswer = answer.toLowerCase()
        if (lowerAnswer.includes('very') && (lowerAnswer.includes('happy') || lowerAnswer.includes('confident') || lowerAnswer.includes('prepared') || lowerAnswer.includes('extensively'))) {
          value = 90
        } else if (lowerAnswer.includes('okay') || lowerAnswer.includes('fairly') || lowerAnswer.includes('quite') || lowerAnswer.includes('some') || lowerAnswer.includes('reasonably')) {
          value = 70
        } else if (lowerAnswer.includes('somewhat') || lowerAnswer.includes('little') || lowerAnswer.includes('slightly')) {
          value = 40
        } else if (lowerAnswer.includes('not') || lowerAnswer.includes('no ') || lowerAnswer.includes('unhappy')) {
          value = 20
        }

        return {
          id: `factor-${index}`,
          label: question.length > 50 ? question.substring(0, 47) + '...' : question, // Increased length limit for label
          value,
          min: 0,
          max: 100,
          unit: '%',
          question, // Store full question
          answer    // Store actual answer text
        }
      })

      // Calculate overall status
      const avgValue = simulationOutcomes.reduce((acc, o) => acc + o.value, 0) / simulationOutcomes.length
      const status: "optimal" | "moderate" | "risk" = avgValue >= 70 ? "optimal" : avgValue >= 40 ? "moderate" : "risk"

      // Create input summary from first 2 factors
      const inputSummary = simulationFactors.slice(0, 2).map(f => ({
        label: f.label,
        value: `${f.value}${f.unit}`
      }))

      // Create outcome summary from first outcome
      const primaryOutcome = simulationOutcomes[0]
      const outcomeSummary = {
        label: primaryOutcome.label,
        value: `${primaryOutcome.value}%`,
        trend: primaryOutcome.trend === 'up' ? 'positive' as const : primaryOutcome.trend === 'down' ? 'negative' as const : 'neutral' as const
      }

      // Create the simulation with the scenarioId
      await createSimulation({
        title: `Analysis: ${capitalizedTitle}`,
        status,
        factors: simulationFactors,
        outcomes: simulationOutcomes,
        inputSummary,
        outcomeSummary,
        recommendation: outcomeData.recommendation
      }, scenarioId)
    } catch (error) {
      console.error("Failed to save scenario and simulation:", error)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleModerationClose = () => {
    setModerationOpen(false)
    onClose()
  }

  const currentQ = questions[currentQuestion]
  const isAnswered = currentQ && answers[currentQ.id]
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {step === "results" ? t('results') : t('title')}
            {detectedSkillId !== "generic" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                <SkillIcon name={getSkill(detectedSkillId).icon} className="h-3 w-3" />
                {getSkill(detectedSkillId).displayName[locale as SupportedLocale]}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === "loading" && t('loading')}
            {step === "questions" && (
              <span className="font-medium text-foreground">&quot;{userQuestion}&quot;</span>
            )}
            {step === "freetext" && (
              <span className="font-medium text-foreground">&quot;{userQuestion}&quot;</span>
            )}
            {step === "generating" && t('generating')}
            {step === "saving" && t('saving')}
            {step === "results" && t('resultsDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">{t('preparingQuestions')}</p>
          </div>
        )}

        {/* Questions State */}
        {step === "questions" && currentQ && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('questionOf', { current: currentQuestion + 1, total: questions.length })}
                </span>
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQ.id, currentQ.question, option.label)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                      answers[currentQ.id]?.answer === option.label
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50 text-foreground"
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('back')}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAnswered || !canSave}
                className="gap-2"
              >
                {currentQuestion === questions.length - 1 ? t('seeResults') : t('next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Show limit warning */}
            {!canSave && (
              <button onClick={() => setUpgradeDialogOpen(true)} className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:opacity-80 transition-opacity w-full text-left">
                <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400 underline">
                  {t('limitReached')}. {t('upgradeForMore')}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Freetext Step */}
        {step === "freetext" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                {t('freetextTitle')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('freetextDescription')}
              </p>
              <textarea
                value={freetextValue}
                onChange={(e) => setFreetextValue(e.target.value)}
                placeholder={t('freetextPlaceholder')}
                rows={4}
                className="w-full rounded-lg border-2 border-border bg-background p-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep("questions")}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('back')}
              </Button>
              <Button
                onClick={() => handleFreetextSubmit(false)}
                className="gap-2"
              >
                {t('seeResults')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Generating State */}
        {(step === "generating" || step === "saving") && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              {step === "generating" ? t('analyzingResponses') : t('savingResults')}
            </p>
          </div>
        )}

        {/* Results State */}
        {step === "results" && outcomes && (
          <div className="space-y-6">
            {/* Success indicator */}
            {canSave && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {t('savedSuccessfully')}
                </span>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">{t('summary')}</h4>
              <p className="text-sm text-foreground">{outcomes.summary}</p>
            </div>

            {/* Input Factors (Questions & Answers) */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Input Factors</h4>
              <div className="space-y-3">
                {Object.entries(answers).map(([questionId, { question, answer }], index) => (
                  <div key={questionId} className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {index + 1}. {question}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Answer:</span> {answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">{t('possibleOutcomes')}</h4>
              {outcomes.outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{outcome.title}</h5>
                    {outcome.confidenceInterval && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                        {outcome.confidenceInterval}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {outcome.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Confidence Interval Chart */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold text-foreground mb-3">{t('confidenceChart')}</h4>
              <ConfidenceChart
                items={outcomes.outcomes.map(o => ({ label: o.title, confidenceInterval: o.confidenceInterval }))}
              />
            </div>

            {/* Recommendation */}
            {outcomes.recommendation && (
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">{t('recommendation')}</h4>
                <p className="text-sm text-muted-foreground">{outcomes.recommendation}</p>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-center pt-4">
              <Button onClick={onClose} className="gap-2 gradient-primary text-white">
                {t('done')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />

    <AlertDialog open={moderationOpen} onOpenChange={setModerationOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {tModeration('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tModeration('surveyDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={handleModerationClose} variant="outline">
            {tModeration('close')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
