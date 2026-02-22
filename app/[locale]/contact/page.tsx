"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Mail } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'

export default function ContactPage() {
  const t = useTranslations('contactPage')
  const params = useParams()
  const locale = params.locale || 'en'

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

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">{t('emailTitle')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('emailDescription')}
              </p>
              <a
                href="mailto:info@shouldi.io"
                className="text-primary font-medium hover:underline"
              >
                info@shouldi.io
              </a>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
