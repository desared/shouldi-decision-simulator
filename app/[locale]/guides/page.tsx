"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ListChecks, Scale, Target } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'

export default function GuidesPage() {
  const t = useTranslations('guidesPage')
  const params = useParams()
  const locale = params.locale || 'en'

  const guides = [
    { key: 'proscons', icon: ListChecks },
    { key: 'weighted', icon: Scale },
    { key: 'goals', icon: Target },
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

        <div className="text-center mb-12">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {guides.map((guide) => (
            <div
              key={guide.key}
              className="rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <guide.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`${guide.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(`${guide.key}.description`)}
                  </p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {step}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {t(`${guide.key}.step${step}`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
