"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'

export default function TermsPage() {
  const t = useTranslations('termsPage')
  const params = useParams()
  const locale = params.locale || 'en'

  const sections = ['acceptance', 'services', 'accounts', 'content', 'liability', 'changes']

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
        <p className="text-sm text-muted-foreground mb-12">
          {t('lastUpdated')}
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t(`${section}.title`)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(`${section}.text`)}
              </p>
            </section>
          ))}
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
