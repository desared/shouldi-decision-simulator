"use client"
import { User } from "firebase/auth"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { ArrowLeft, RotateCcw, TrendingUp, TrendingDown, Minus, Trophy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { OutcomeBar } from "@/components/outcome-bar"
import { MoreSimulationsSection } from "@/components/sections/more-simulations-section"

interface Factor {
  id: string
  label: string
  value: number
  min: number
  max: number
  unit: string
}

interface Outcome {
  id: string
  label: string
  value: number
  rangeMin: number
  rangeMax: number
  trend: "up" | "down" | "stable"
}

interface SimulationPanelProps {
  title: string
  description: string
  factors: Factor[]
  outcomes: Outcome[]
  onBack: () => void
  onSignUp: () => void
  user: User | null
}

export function SimulationPanelTranslated({
  title,
  description,
  factors: initialFactors,
  outcomes: initialOutcomes,
  onBack,
  onSignUp,
  user
}: SimulationPanelProps) {
  const t = useTranslations('simulation')
  const tDecision = useTranslations('decisionScore')
  const [factors, setFactors] = useState(initialFactors)
  const [outcomes, setOutcomes] = useState(initialOutcomes)
  const [isSimulating, setIsSimulating] = useState(false)
  const [hasSimulated, setHasSimulated] = useState(false)
  const [simulationTime, setSimulationTime] = useState("00:00")
  const [startTime, setStartTime] = useState<number | null>(null)

  // Decision score breakdown categories
  const [decisionBreakdown, setDecisionBreakdown] = useState([
    { id: 'financial-impact', labelKey: 'financialImpact', value: 0 },
    { id: 'risk-assessment', labelKey: 'riskAssessment', value: 0 },
    { id: 'life-quality', labelKey: 'lifeQuality', value: 0 },
    { id: 'long-term-growth', labelKey: 'longTermGrowth', value: 0 },
  ])

  const handleFactorChange = (id: string, newValue: number[]) => {
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, value: newValue[0] } : f)))
    if (!startTime) {
      setStartTime(Date.now())
    }
  }

  const runSimulation = () => {
    setIsSimulating(true)

    // Calculate time taken
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0')
      const secs = (elapsed % 60).toString().padStart(2, '0')
      setSimulationTime(`${mins}:${secs}`)
    } else {
      setSimulationTime("00:05")
    }

    setTimeout(() => {
      setOutcomes((prev) =>
        prev.map((outcome) => ({
          ...outcome,
          value: Math.round(Math.max(0, Math.min(100, outcome.value + (Math.random() - 0.5) * 20))),
          rangeMin: Math.round(Math.max(0, outcome.rangeMin + (Math.random() - 0.5) * 10)),
          rangeMax: Math.round(Math.min(100, outcome.rangeMax + (Math.random() - 0.5) * 10)),
        }))
      )

      // Update decision breakdown
      setDecisionBreakdown([
        { id: 'financial-impact', labelKey: 'financialImpact', value: Math.round(50 + Math.random() * 40) },
        { id: 'risk-assessment', labelKey: 'riskAssessment', value: Math.round(40 + Math.random() * 50) },
        { id: 'life-quality', labelKey: 'lifeQuality', value: Math.round(55 + Math.random() * 35) },
        { id: 'long-term-growth', labelKey: 'longTermGrowth', value: Math.round(45 + Math.random() * 45) },
      ])

      setIsSimulating(false)
      setHasSimulated(true)
    }, 1500)
  }

  const resetSimulation = () => {
    setFactors(initialFactors)
    setOutcomes(initialOutcomes)
    setHasSimulated(false)
    setStartTime(null)
    setSimulationTime("00:00")
    setDecisionBreakdown([
      { id: 'financial-impact', labelKey: 'financialImpact', value: 0 },
      { id: 'risk-assessment', labelKey: 'riskAssessment', value: 0 },
      { id: 'life-quality', labelKey: 'lifeQuality', value: 0 },
      { id: 'long-term-growth', labelKey: 'longTermGrowth', value: 0 },
    ])
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Calculate final decision score
  const finalScore = hasSimulated
    ? Math.round(decisionBreakdown.reduce((acc, item) => acc + item.value, 0) / decisionBreakdown.length)
    : 0

  // Filter out decision-score from regular outcomes (we'll show it separately)
  const regularOutcomes = outcomes.filter(o => o.id !== 'decision-score')

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Button variant="ghost" onClick={onBack} className="mb-6 md:mb-8 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>

        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {/* Factors Panel */}
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <h2 className="mb-4 md:mb-6 text-lg font-semibold text-foreground">{t('adjustFactors')}</h2>
            <div className="space-y-5 md:space-y-6">
              {factors.map((factor) => (
                <div key={factor.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{factor.label}</label>
                    <span className="text-sm font-semibold text-primary">
                      {factor.value}
                      {factor.unit}
                    </span>
                  </div>
                  <Slider
                    value={[factor.value]}
                    min={factor.min}
                    max={factor.max}
                    step={1}
                    onValueChange={(value) => handleFactorChange(factor.id, value)}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {factor.min}
                      {factor.unit}
                    </span>
                    <span>
                      {factor.max}
                      {factor.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 flex gap-3">
              <Button
                onClick={runSimulation}
                disabled={isSimulating}
                className="flex-1 gradient-primary text-white"
              >
                {isSimulating ? t('running') : t('runSimulation')}
              </Button>
              {hasSimulated && (
                <Button variant="outline" onClick={resetSimulation}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Outcomes Panel */}
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <h2 className="mb-4 md:mb-6 text-lg font-semibold text-foreground">{t('predictedOutcomes')}</h2>
            <div className="space-y-5 md:space-y-6">
              {regularOutcomes.map((outcome) => (
                <div key={outcome.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{outcome.label}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(outcome.trend)}
                      <span className="text-sm font-semibold text-foreground">{Math.round(outcome.value)}%</span>
                    </div>
                  </div>
                  <OutcomeBar
                    label=""
                    value={Math.round(outcome.value)}
                    maxValue={100}
                    variant={outcome.trend === "up" ? "positive" : outcome.trend === "down" ? "negative" : "neutral"}
                    showRange
                    rangeMin={Math.round(outcome.rangeMin)}
                    rangeMax={Math.round(outcome.rangeMax)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('confidenceRange')}: {Math.round(outcome.rangeMin)}% - {Math.round(outcome.rangeMax)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Score Section */}
        {hasSimulated && (
          <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header with completed message */}
            <div className="bg-primary/5 p-6 text-center border-b border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                {tDecision('completed')}
              </h2>

              {/* Score and Time boxes */}
              <div className="flex justify-center gap-4 md:gap-6">
                <div className="bg-card rounded-xl border border-border p-4 md:p-6 min-w-[120px] md:min-w-[150px]">
                  <div className="flex justify-center mb-2">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground">{finalScore}</div>
                  <div className="text-sm text-muted-foreground mt-1">{tDecision('finalScore')}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 md:p-6 min-w-[120px] md:min-w-[150px]">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground">{simulationTime}</div>
                  <div className="text-sm text-muted-foreground mt-1">{tDecision('timeTaken')}</div>
                </div>
              </div>
            </div>

            {/* Decision Score Breakdown */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">{tDecision('title')}</h3>
                <p className="text-sm text-muted-foreground">{tDecision('subtitle')}</p>
              </div>

              <div className="space-y-4">
                {decisionBreakdown.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {tDecision(item.labelKey)}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* More Simulations CTA */}
      {/* More Simulations CTA - Only show if not logged in */}
      {!user && <MoreSimulationsSection onSignUp={onSignUp} />}
    </div>
  )
}
