"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, Home, MapPin, Lightbulb } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'

export default function ScenariosPage() {
  const t = useTranslations('scenariosPage')
  const params = useParams()
  const locale = params.locale || 'en'

  const scenarios = [
    { key: 'jobChange', icon: Briefcase },
    { key: 'buyRent', icon: Home },
    { key: 'relocate', icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <Link href={`/${locale}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('backHome')}
        </Link>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          {t('subtitle')}
        </p>

        <div className="space-y-8">
          {scenarios.map((scenario) => (
            <div
              key={scenario.key}
              className="rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <scenario.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`${scenario.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`${scenario.key}.description`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('custom.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('custom.description')}
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
