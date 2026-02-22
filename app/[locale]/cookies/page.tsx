"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Lock, BarChart3, Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'

export default function CookiesPage() {
  const t = useTranslations('cookiesPage')
  const params = useParams()
  const locale = params.locale || 'en'

  const cookieCategories = [
    {
      key: 'necessary',
      icon: Lock,
      mandatory: true,
      cookies: ['session', 'consent', 'csrf']
    },
    {
      key: 'analytics',
      icon: BarChart3,
      mandatory: false,
      cookies: ['vercelAnalytics', 'performance']
    },
    {
      key: 'marketing',
      icon: Megaphone,
      mandatory: false,
      cookies: ['adPersonalization', 'retargeting']
    }
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

        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t('lastUpdated')}
        </p>
        <p className="text-muted-foreground leading-relaxed mb-12">
          {t('intro')}
        </p>

        {/* What are cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">{t('whatAreCookies.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('whatAreCookies.text')}</p>
        </section>

        {/* Cookie categories */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-6">{t('categoriesTitle')}</h2>
          <div className="space-y-6">
            {cookieCategories.map((category) => (
              <div
                key={category.key}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {t(`categories.${category.key}.title`)}
                      </h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        category.mandatory
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {category.mandatory ? t('mandatory') : t('optional')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(`categories.${category.key}.description`)}
                    </p>
                  </div>
                </div>

                <div className="ml-14 space-y-3">
                  {category.cookies.map((cookie) => (
                    <div key={cookie} className="border-t border-border pt-3">
                      <p className="text-sm font-medium text-foreground">
                        {t(`categories.${category.key}.cookies.${cookie}.name`)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(`categories.${category.key}.cookies.${cookie}.purpose`)}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {t('duration')}: {t(`categories.${category.key}.cookies.${cookie}.duration`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Managing cookies */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">{t('managing.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('managing.text')}</p>
        </section>

      </main>

      <FooterSection />
    </div>
  )
}
