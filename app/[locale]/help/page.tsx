"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function HelpPage() {
  const t = useTranslations('helpPage')
  const params = useParams()
  const locale = params.locale || 'en'

  const categories = [
    {
      key: 'gettingStarted',
      questions: ['q1', 'q2', 'q3']
    },
    {
      key: 'simulations',
      questions: ['q1', 'q2', 'q3']
    },
    {
      key: 'account',
      questions: ['q1', 'q2', 'q3']
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

        <div className="text-center mb-12">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.key}>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t(`${category.key}.title`)}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((q) => (
                  <AccordionItem key={q} value={`${category.key}-${q}`} className="border-border">
                    <AccordionTrigger className="text-left text-foreground hover:text-primary">
                      {t(`${category.key}.${q}.question`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t(`${category.key}.${q}.answer`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center rounded-2xl border border-border bg-card p-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('contactTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('contactText')}
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
