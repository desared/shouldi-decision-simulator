"use client"

import { useTranslations } from 'next-intl'
import { Briefcase, MapPin, Home } from 'lucide-react'

interface ScenariosSectionProps {
  onSelectScenario: (id: string) => void
}

export function ScenariosSection({ onSelectScenario }: ScenariosSectionProps) {
  const t = useTranslations('scenarios')

  const scenarios = [
    {
      id: 'job-change',
      icon: Briefcase,
      titleKey: 'jobChange.title',
      descriptionKey: 'jobChange.description',
    },
    {
      id: 'buy-rent',
      icon: Home,
      titleKey: 'buyRent.title',
      descriptionKey: 'buyRent.description',
    },
    {
      id: 'relocate',
      icon: MapPin,
      titleKey: 'relocate.title',
      descriptionKey: 'relocate.description',
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:shadow-lg hover:border-primary/50"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {t('free')}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
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
              <div className="flex items-center text-sm font-medium text-primary">
                {t('tryScenario')}
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
