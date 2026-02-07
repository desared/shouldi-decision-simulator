"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
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
import {
  type SurveyQuestion,
  type GeminiOutcomeResponse
} from "@/lib/gemini-service"

interface SurveyModalProps {
  isOpen: boolean
  onClose: () => void
  userQuestion: string
  questionCount?: number
  bestCaseOnly?: boolean
}

type SurveyStep = "loading" | "questions" | "generating" | "results"

export function SurveyModal({ isOpen, onClose, userQuestion, questionCount = 4, bestCaseOnly = false }: SurveyModalProps) {
  const t = useTranslations('survey')
  const locale = useLocale()
  const [step, setStep] = useState<SurveyStep>("loading")
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { question: string; answer: string }>>({})
  const [outcomes, setOutcomes] = useState<GeminiOutcomeResponse | null>(null)

  useEffect(() => {
    if (isOpen && userQuestion) {
      loadQuestions()
    }
  }, [isOpen, userQuestion])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep("loading")
      setQuestions([])
      setCurrentQuestion(0)
      setAnswers({})
      setOutcomes(null)
    }
  }, [isOpen])

  const loadQuestions = async () => {
    setStep("loading")
    try {
      const response = await generateSurveyQuestionsAction(userQuestion, questionCount, locale)
      setQuestions(response.questions)
      setStep("questions")
    } catch (error) {
      console.error("Failed to load questions:", error)
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
      // All questions answered, generate outcomes
      setStep("generating")
      try {
        const response = await generateOutcomesAction(userQuestion, answers, bestCaseOnly, locale)
        setOutcomes(response)
        setStep("results")
      } catch (error) {
        console.error("Failed to generate outcomes:", error)
        setStep("results")
      }
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
                disabled={!isAnswered}
                className="gap-2"
              >
                {currentQuestion === questions.length - 1 ? t('seeResults') : t('next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Generating State */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">{t('analyzingResponses')}</p>
          </div>
        )}

        {/* Results State */}
        {step === "results" && outcomes && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">{t('summary')}</h4>
              <p className="text-sm text-foreground">{outcomes.summary}</p>
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
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      outcome.confidence === "high" && "bg-green-500/10 text-green-600 dark:text-green-400",
                      outcome.confidence === "medium" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                      outcome.confidence === "low" && "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                      {t(`confidence.${outcome.confidence}`)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {outcome.description}
                  </p>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{t('recommendation')}: </span>
                    <span className="text-muted-foreground">{outcome.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center pt-4">
              <Button onClick={onClose} className="gap-2">
                {t('done')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
