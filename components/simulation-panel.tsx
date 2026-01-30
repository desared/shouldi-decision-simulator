"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { OutcomeBar } from "@/components/outcome-bar"
import { ArrowLeft, Play, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Factor {
  id: string
  label: string
  value: number
  min: number
  max: number
  unit?: string
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
}

export function SimulationPanel({ title, description, factors: initialFactors, outcomes: initialOutcomes, onBack }: SimulationPanelProps) {
  const [factors, setFactors] = useState(initialFactors)
  const [outcomes, setOutcomes] = useState(initialOutcomes)
  const [isSimulating, setIsSimulating] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const handleFactorChange = (id: string, value: number[]) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: value[0] } : f))
    )
  }

  const runSimulation = () => {
    setIsSimulating(true)
    setTimeout(() => {
      // Simulate outcome changes based on factors
      setOutcomes((prev) =>
        prev.map((o) => ({
          ...o,
          value: Math.min(100, Math.max(0, o.value + Math.floor(Math.random() * 20 - 10))),
          rangeMin: Math.max(0, o.rangeMin + Math.floor(Math.random() * 10 - 5)),
          rangeMax: Math.min(100, o.rangeMax + Math.floor(Math.random() * 10 - 5)),
        }))
      )
      setIsSimulating(false)
      setHasRun(true)
    }, 1500)
  }

  const resetSimulation = () => {
    setFactors(initialFactors)
    setOutcomes(initialOutcomes)
    setHasRun(false)
  }

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-chart-2" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Factors */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Adjust Variables</h3>
          <div className="space-y-6">
            {factors.map((factor) => (
              <div key={factor.id} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{factor.label}</span>
                  <span className="font-medium text-foreground">
                    {factor.value}
                    {factor.unit}
                  </span>
                </div>
                <Slider
                  value={[factor.value]}
                  onValueChange={(value) => handleFactorChange(factor.id, value)}
                  min={factor.min}
                  max={factor.max}
                  step={1}
                  className="[&_[role=slider]]:bg-accent"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={runSimulation}
              disabled={isSimulating}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
            {hasRun && (
              <Button variant="outline" onClick={resetSimulation}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Projected Outcomes</h3>
          <div className={cn("space-y-5 transition-opacity", isSimulating && "opacity-50")}>
            {outcomes.map((outcome) => (
              <div key={outcome.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={outcome.trend} />
                  <span className="text-sm font-medium text-foreground">{outcome.label}</span>
                </div>
                <OutcomeBar
                  label=""
                  value={outcome.value}
                  variant={outcome.trend === "up" ? "positive" : outcome.trend === "down" ? "negative" : "neutral"}
                  showRange
                  rangeMin={outcome.rangeMin}
                  rangeMax={outcome.rangeMax}
                />
                <p className="text-xs text-muted-foreground">
                  Confidence range: {outcome.rangeMin}% - {outcome.rangeMax}%
                </p>
              </div>
            ))}
          </div>
          {!hasRun && (
            <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Adjust variables and run simulation to see projected outcomes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
