"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, ChevronRight, ChevronLeft, Sparkles, CheckCircle, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateSurveyQuestionsAction, generateOutcomesAction } from "@/app/actions/gemini"
import { type SurveyQuestion, type SurveyOutcome, type GeminiOutcomeResponse } from "@/lib/gemini-service"
import { useFirestore } from "@/contexts/firestore-context"

interface DashboardSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  userQuestion: string
  onSave: (questions: string[], answers: Record<string, string>, outcomes: SurveyOutcome[]) => Promise<void>
}

type SurveyStep = "loading" | "questions" | "generating" | "saving" | "results"

export function DashboardSurveyModal({ isOpen, onClose, userQuestion }: DashboardSurveyModalProps) {
  const t = useTranslations('survey')
  const locale = useLocale()
  const [step, setStep] = useState<SurveyStep>("loading")
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { question: string; answer: string }>>({})
  const [outcomes, setOutcomes] = useState<GeminiOutcomeResponse | null>(null)

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
    }
  }, [isOpen])

  const fetchQuestions = async () => { // Renamed loadQuestions to fetchQuestions
    setStep("loading")
    try {
      // Use Server Action
      const data = await generateSurveyQuestionsAction(userQuestion, 4, locale)
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

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // All questions answered - generate outcomes and auto-save
      setStep("generating")
      try {
        // Prepare answers with full question context for the action
        const minimalAnswers: Record<string, { question: string; answer: string }> = {}
        questions.forEach(q => {
          minimalAnswers[q.id] = answers[q.id] || { question: q.question, answer: "Unknown" } // Ensure all questions have an answer, even if empty
        })

        // Use Server Action
        const data = await generateOutcomesAction(userQuestion, minimalAnswers, false, locale)
        setOutcomes(data)

        // Auto-save scenario and simulation if user can save
        if (canSave) {
          setStep("saving")
          // The `onSave` prop was added, but the original code directly calls `saveScenarioAndSimulation`.
          // I will keep the original `saveScenarioAndSimulation` call for now, as `onSave` is not used in the provided snippet.
          // If the user intended to replace `saveScenarioAndSimulation` with `onSave`, that would be a separate instruction.
          await saveScenarioAndSimulation({ summary: data.summary, outcomes: data.outcomes }) // Pass the full response structure
        }

        setStep("results")
      } catch (error) {
        console.error("Failed to generate outcomes:", error)
        setStep("results")
      }
    }
  }

  const saveScenarioAndSimulation = async (outcomeData: GeminiOutcomeResponse) => {
    try {
      // Create scenario title from question
      const title = userQuestion.replace(/^should i\s*/i, '').replace(/\?$/, '')
      const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1)

      // Determine icon based on keywords
      let icon = "HelpCircle"
      const lowerQuestion = userQuestion.toLowerCase()
      if (lowerQuestion.includes('job') || lowerQuestion.includes('career') || lowerQuestion.includes('work')) {
        icon = "Briefcase"
      } else if (lowerQuestion.includes('buy') || lowerQuestion.includes('rent') || lowerQuestion.includes('house') || lowerQuestion.includes('home')) {
        icon = "Home"
      } else if (lowerQuestion.includes('move') || lowerQuestion.includes('relocate') || lowerQuestion.includes('city')) {
        icon = "MapPin"
      } else if (lowerQuestion.includes('study') || lowerQuestion.includes('learn') || lowerQuestion.includes('degree')) {
        icon = "GraduationCap"
      } else if (lowerQuestion.includes('invest') || lowerQuestion.includes('money') || lowerQuestion.includes('save')) {
        icon = "DollarSign"
      } else if (lowerQuestion.includes('relationship') || lowerQuestion.includes('marry') || lowerQuestion.includes('date')) {
        icon = "Heart"
      }

      // Create description from summary
      const description = outcomeData.summary.length > 150
        ? outcomeData.summary.substring(0, 147) + '...'
        : outcomeData.summary

      // Create the scenario first
      const scenarioId = await createScenario(capitalizedTitle, description, icon)

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
        recommendation: outcome.recommendation
      }))

      // Convert answers to factors format
      const simulationFactors = Object.entries(answers).slice(0, 4).map(([id, { question, answer }], index) => {
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
        outcomeSummary
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

  const currentQ = questions[currentQuestion]
  const isAnswered = currentQ && answers[currentQ.id]
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {step === "results" ? t('results') : t('title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === "loading" && t('loading')}
            {step === "questions" && (
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
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  {t('limitReached')}. {t('upgradeForMore')}
                </span>
              </div>
            )}
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
                    <div className="flex gap-2">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        outcome.confidence === "high" && "bg-green-500/10 text-green-600 dark:text-green-400",
                        outcome.confidence === "medium" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                        outcome.confidence === "low" && "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {t(`confidence.${outcome.confidence}`)}
                      </span>
                      {outcome.confidenceInterval && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                          {outcome.confidenceInterval}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                    {outcome.description}
                  </p>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{t('recommendation')}: </span>
                    <span className="text-muted-foreground">{outcome.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>

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
  )
}
