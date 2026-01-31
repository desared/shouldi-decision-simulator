"use client"

import { useTranslations } from 'next-intl'
import { Briefcase, MapPin, Home, Clock, Lock } from 'lucide-react'

interface ScenariosSectionProps {
  onSelectScenario: (id: string) => void
  onPremiumClick: () => void
}

export function ScenariosSection({ onSelectScenario, onPremiumClick }: ScenariosSectionProps) {
  const t = useTranslations('scenarios')

  const scenarios = [
    {
      id: 'job-change',
      icon: Briefcase,
      titleKey: 'jobChange.title',
      descriptionKey: 'jobChange.description',
      premium: false
    },
    {
      id: 'relocate',
      icon: MapPin,
      titleKey: 'relocate.title',
      descriptionKey: 'relocate.description',
      premium: false
    },
    {
      id: 'buy-rent',
      icon: Home,
      titleKey: 'buyRent.title',
      descriptionKey: 'buyRent.description',
      premium: false
    },
    {
      id: 'work-hours',
      icon: Clock,
      titleKey: 'workHours.title',
      descriptionKey: 'workHours.description',
      premium: true
    }
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => scenario.premium ? onPremiumClick() : onSelectScenario(scenario.id)}
              className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:shadow-lg ${
                scenario.premium
                  ? 'border-border bg-card/50 hover:border-accent/50'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
                {scenario.premium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    <Lock className="h-3 w-3" />
                    {t('premium')}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {t('free')}
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                scenario.premium
                  ? 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'
                  : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
              }`}>
                <scenario.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground pr-16">
                {t(scenario.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t(scenario.descriptionKey)}
              </p>

              {/* Action hint */}
              <div className={`flex items-center text-sm font-medium ${
                scenario.premium ? 'text-accent' : 'text-primary'
              }`}>
                {scenario.premium ? t('unlockPremium') : t('tryScenario')}
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Premium overlay */}
              {scenario.premium && (
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
