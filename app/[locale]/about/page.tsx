"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { LogoIcon } from '@/components/logo-icon'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import { FooterSection } from '@/components/sections/footer-section'

export default function AboutPage() {
  const t = useTranslations('aboutPage')
  const params = useParams()
  const locale = params.locale || 'en'

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
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('missionTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('missionText')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('storyTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('storyText')}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('builtByTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('builtByText')}
            </p>
            <a href="https://ActOnData.io" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                {t('visitActOnData')}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
