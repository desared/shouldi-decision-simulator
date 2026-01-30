"use client"

import { cn } from "@/lib/utils"

interface OutcomeBarProps {
  label: string
  value: number
  maxValue?: number
  variant?: "positive" | "negative" | "neutral"
  showRange?: boolean
  rangeMin?: number
  rangeMax?: number
}

export function OutcomeBar({
  label,
  value,
  maxValue = 100,
  variant = "neutral",
  showRange = false,
  rangeMin = 0,
  rangeMax = 100,
}: OutcomeBarProps) {
  const percentage = (value / maxValue) * 100
  const rangeMinPercent = (rangeMin / maxValue) * 100
  const rangeMaxPercent = (rangeMax / maxValue) * 100

  const barColor = {
    positive: "bg-chart-2",
    negative: "bg-destructive",
    neutral: "bg-accent",
  }[variant]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {showRange ? `${rangeMin}% - ${rangeMax}%` : `${value}%`}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
        {showRange ? (
          <>
            <div
              className={cn("absolute h-full opacity-30", barColor)}
              style={{ left: `${rangeMinPercent}%`, width: `${rangeMaxPercent - rangeMinPercent}%` }}
            />
            <div
              className={cn("absolute h-full", barColor)}
              style={{ left: `${rangeMinPercent}%`, width: `${percentage - rangeMinPercent}%` }}
            />
          </>
        ) : (
          <div
            className={cn("h-full transition-all duration-500", barColor)}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}
