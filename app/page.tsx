"use client"

import { useState } from "react"
import { Briefcase, Home, MapPin, Clock, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScenarioCard } from "@/components/scenario-card"
import { SimulationPanel } from "@/components/simulation-panel"

const scenarios = [
  {
    id: "job-change",
    title: "Change Jobs",
    description: "Explore the financial and career impact of switching positions or industries",
    icon: <Briefcase className="h-6 w-6" />,
    factors: [
      { id: "salary-change", label: "Salary Change", value: 20, min: -50, max: 100, unit: "%" },
      { id: "commute-time", label: "Commute Time", value: 30, min: 0, max: 120, unit: " min" },
      { id: "job-satisfaction", label: "Expected Job Satisfaction", value: 70, min: 0, max: 100, unit: "%" },
      { id: "career-growth", label: "Career Growth Potential", value: 65, min: 0, max: 100, unit: "%" },
    ],
    outcomes: [
      { id: "financial", label: "Financial Stability (5 years)", value: 72, rangeMin: 60, rangeMax: 85, trend: "up" as const },
      { id: "happiness", label: "Work-Life Balance", value: 65, rangeMin: 50, rangeMax: 78, trend: "up" as const },
      { id: "stress", label: "Stress Level", value: 45, rangeMin: 35, rangeMax: 60, trend: "down" as const },
      { id: "growth", label: "Career Advancement", value: 78, rangeMin: 65, rangeMax: 90, trend: "up" as const },
    ],
  },
  {
    id: "buy-rent",
    title: "Buy vs Rent",
    description: "Compare long-term financial outcomes of buying a home versus renting",
    icon: <Home className="h-6 w-6" />,
    factors: [
      { id: "home-price", label: "Home Price", value: 350, min: 100, max: 1000, unit: "k" },
      { id: "down-payment", label: "Down Payment", value: 20, min: 5, max: 40, unit: "%" },
      { id: "rent-cost", label: "Monthly Rent", value: 1800, min: 500, max: 5000, unit: "" },
      { id: "years", label: "Time Horizon", value: 10, min: 1, max: 30, unit: " years" },
    ],
    outcomes: [
      { id: "equity", label: "Equity Built", value: 68, rangeMin: 55, rangeMax: 82, trend: "up" as const },
      { id: "flexibility", label: "Financial Flexibility", value: 45, rangeMin: 30, rangeMax: 55, trend: "down" as const },
      { id: "net-worth", label: "Net Worth Impact", value: 62, rangeMin: 48, rangeMax: 75, trend: "up" as const },
      { id: "risk", label: "Risk Exposure", value: 55, rangeMin: 40, rangeMax: 70, trend: "stable" as const },
    ],
  },
  {
    id: "relocate",
    title: "Move Cities",
    description: "Analyze the impact of relocating to a new city on your lifestyle and finances",
    icon: <MapPin className="h-6 w-6" />,
    factors: [
      { id: "cost-living", label: "Cost of Living Change", value: -15, min: -50, max: 50, unit: "%" },
      { id: "income-change", label: "Expected Income Change", value: 10, min: -30, max: 50, unit: "%" },
      { id: "social-network", label: "Social Network Strength", value: 40, min: 0, max: 100, unit: "%" },
      { id: "quality-life", label: "Quality of Life Rating", value: 75, min: 0, max: 100, unit: "%" },
    ],
    outcomes: [
      { id: "savings", label: "Savings Rate", value: 58, rangeMin: 45, rangeMax: 72, trend: "up" as const },
      { id: "social", label: "Social Wellbeing", value: 42, rangeMin: 28, rangeMax: 55, trend: "down" as const },
      { id: "career", label: "Career Opportunities", value: 70, rangeMin: 58, rangeMax: 85, trend: "up" as const },
      { id: "happiness", label: "Overall Happiness", value: 65, rangeMin: 50, rangeMax: 78, trend: "stable" as const },
    ],
  },
  {
    id: "work-hours",
    title: "Reduce Work Hours",
    description: "Understand the tradeoffs of working less for more personal time",
    icon: <Clock className="h-6 w-6" />,
    factors: [
      { id: "hours-reduction", label: "Hours Reduced Per Week", value: 10, min: 0, max: 20, unit: "h" },
      { id: "income-impact", label: "Income Reduction", value: 15, min: 0, max: 50, unit: "%" },
      { id: "side-projects", label: "Time for Side Projects", value: 60, min: 0, max: 100, unit: "%" },
      { id: "health-focus", label: "Health & Wellness Focus", value: 70, min: 0, max: 100, unit: "%" },
    ],
    outcomes: [
      { id: "income", label: "Monthly Income", value: 75, rangeMin: 65, rangeMax: 85, trend: "down" as const },
      { id: "health", label: "Health & Energy", value: 82, rangeMin: 70, rangeMax: 92, trend: "up" as const },
      { id: "relationships", label: "Relationship Quality", value: 78, rangeMin: 65, rangeMax: 88, trend: "up" as const },
      { id: "productivity", label: "Productivity Per Hour", value: 85, rangeMin: 72, rangeMax: 95, trend: "up" as const },
    ],
  },
]

export default function LifePathSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")

  const activeScenario = scenarios.find((s) => s.id === selectedScenario)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">LifePath</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </button>
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </button>
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Blog
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground">
              Sign in
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {!selectedScenario ? (
          <>
            {/* Hero Section */}
            <div className="mb-16 text-center">
              <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Simulate your life decisions.
                <br />
                <span className="text-muted-foreground">See what happens next.</span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                Stop second-guessing major life choices. Our AI-powered simulator models 
                probabilistic outcomes so you can make decisions with confidence.
              </p>
              
              {/* Custom Question Input */}
              <div className="mx-auto mb-4 flex max-w-xl gap-2">
                <Input
                  placeholder="What if I..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="h-12 bg-card text-foreground placeholder:text-muted-foreground"
                />
                <Button className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                  <span className="hidden sm:inline">Simulate</span>
                  <ArrowRight className="h-4 w-4 sm:ml-2" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Try: &quot;What if I quit my job to start a business?&quot;
              </p>
            </div>

            {/* Scenario Cards */}
            <div className="mb-16">
              <h2 className="mb-6 text-xl font-semibold text-foreground">Popular Scenarios</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {scenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    title={scenario.title}
                    description={scenario.description}
                    icon={scenario.icon}
                    onClick={() => setSelectedScenario(scenario.id)}
                  />
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Probabilistic Modeling</h3>
                  <p className="text-sm text-muted-foreground">
                    See ranges of possible outcomes, not just single predictions. 
                    Understand the uncertainty in every decision.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Instant Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Get results in seconds, not hours. Iterate quickly through 
                    different scenarios and assumptions.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Private & Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your life decisions stay private. We never share or sell 
                    your personal scenario data.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          activeScenario && (
            <SimulationPanel
              title={activeScenario.title}
              description={activeScenario.description}
              factors={activeScenario.factors}
              outcomes={activeScenario.outcomes}
              onBack={() => setSelectedScenario(null)}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">
            LifePath - Make better decisions with data
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button className="transition-colors hover:text-foreground">Privacy</button>
            <button className="transition-colors hover:text-foreground">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
