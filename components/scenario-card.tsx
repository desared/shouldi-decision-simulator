"use client"

import React from "react"

import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScenarioCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  className?: string
}

export function ScenarioCard({ title, description, icon, onClick, className }: ScenarioCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-accent hover:bg-secondary",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-accent">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-accent">
        <span>Explore scenario</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  )
}
