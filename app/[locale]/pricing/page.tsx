"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { LogoIcon } from '@/components/logo-icon'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { FooterSection } from '@/components/sections/footer-section'

export default function PricingPage() {
  const t = useTranslations('pricingPage')
  const params = useParams()
  const locale = params.locale || 'en'

  const plans = [
    { key: 'free', popular: false, comingSoon: false },
    { key: 'perScenario', popular: false, comingSoon: true },
    { key: 'monthly', popular: true, comingSoon: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <LogoIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">should<span className="text-primary">i</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Link href={`/${locale}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('backHome')}
        </Link>

        <div className="text-center mb-16">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h1>
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

              {plan.comingSoon && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {t('comingSoon')}
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

              <ul className="space-y-3">
                {(t.raw(`${plan.key}.features`) as string[]).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('note')}
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
