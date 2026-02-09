"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, Home, MapPin } from 'lucide-react'
import { LogoIcon } from '@/components/logo-icon'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { FooterSection } from '@/components/sections/footer-section'

export default function ScenariosPage() {
  const t = useTranslations('scenariosPage')
  const tScenarios = useTranslations('scenarios')
  const params = useParams()
  const locale = params.locale || 'en'

  const scenarios = [
    {
      id: 'job-change',
      icon: Briefcase,
      title: tScenarios('jobChange.title'),
      description: tScenarios('jobChange.description'),
    },
    {
      id: 'buy-rent',
      icon: Home,
      title: tScenarios('buyRent.title'),
      description: tScenarios('buyRent.description'),
    },
    {
      id: 'relocate',
      icon: MapPin,
      title: tScenarios('relocate.title'),
      description: tScenarios('relocate.description'),
    }
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

        <div className="text-center mb-12">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {tScenarios('free')}
                </span>
              </div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <scenario.icon className="h-6 w-6" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground pr-16">
                {scenario.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {scenario.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('moreComingSoon')}</h3>
            <p className="text-sm text-muted-foreground">{t('moreComingSoonDesc')}</p>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
