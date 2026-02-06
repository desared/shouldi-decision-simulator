"use client"

import { useTranslations } from 'next-intl'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PricingSectionProps {
  onGetStarted: () => void
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const t = useTranslations('pricing')

  const plans = [
    {
      key: 'free',
      popular: false,
      comingSoon: false
    },
    {
      key: 'perScenario',
      popular: false,
      comingSoon: true
    },
    {
      key: 'monthly',
      popular: true,
      comingSoon: true
    }
  ]

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border ${
                plan.comingSoon
                  ? 'border-border opacity-60'
                  : plan.popular
                    ? 'border-primary shadow-xl scale-105'
                    : 'border-border'
              } bg-card p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-4 py-1 text-sm font-medium text-white">
                    <Sparkles className="h-4 w-4" />
                    {t(`${plan.key}.popular`)}
                  </span>
                </div>
              )}


              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t(`${plan.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`${plan.key}.description`)}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {t(`${plan.key}.price`)}
                </span>
                <span className="text-muted-foreground ml-2">
                  {t(`${plan.key}.period`)}
                </span>
              </div>

              <ul className="mb-8 space-y-3">
                {(t.raw(`${plan.key}.features`) as string[]).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={plan.comingSoon ? undefined : onGetStarted}
                disabled={plan.comingSoon}
                className={`w-full ${
                  plan.comingSoon ? 'opacity-50 cursor-not-allowed' : plan.popular ? 'gradient-primary text-white' : ''
                }`}
                variant={plan.popular && !plan.comingSoon ? 'default' : 'outline'}
              >
                {t(`${plan.key}.cta`)}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('freeTrial')} • {t('noCardRequired')}
          </p>
        </div>
      </div>
    </section>
  )
}
