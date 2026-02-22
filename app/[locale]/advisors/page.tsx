"use client"

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { FooterSection } from '@/components/sections/footer-section'
import { SkillIcon } from '@/lib/skills/skill-icon'

const advisors = [
  { icon: "DollarSign", key: "finance", color: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  { icon: "Briefcase", key: "career", color: "from-blue-500 to-blue-600", bgLight: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
  { icon: "Heart", key: "health", color: "from-rose-500 to-rose-600", bgLight: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20" },
  { icon: "HeartHandshake", key: "relationships", color: "from-pink-500 to-pink-600", bgLight: "bg-pink-50 dark:bg-pink-500/10", border: "border-pink-200 dark:border-pink-500/20" },
  { icon: "GraduationCap", key: "education", color: "from-amber-500 to-amber-600", bgLight: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" },
  { icon: "Home", key: "realEstate", color: "from-violet-500 to-violet-600", bgLight: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/20" },
  { icon: "MapPin", key: "lifestyle", color: "from-teal-500 to-teal-600", bgLight: "bg-teal-50 dark:bg-teal-500/10", border: "border-teal-200 dark:border-teal-500/20" },
  { icon: "Rocket", key: "business", color: "from-orange-500 to-orange-600", bgLight: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20" },
]

export default function AdvisorsPage() {
  const t = useTranslations('advisorsPage')
  const tAdvisors = useTranslations('advisors')
  const params = useParams()
  const locale = params.locale || 'en'

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-16 md:py-24">
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

        <div className="space-y-6">
          {advisors.map((advisor) => {
            const specialties = (t(`${advisor.key}.specialties`) as string).split('|')
            return (
              <div
                key={advisor.key}
                className={`rounded-2xl border ${advisor.border} ${advisor.bgLight} p-6 md:p-8 transition-all hover:shadow-md`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  {/* Icon */}
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${advisor.color} text-white shadow-sm`}>
                    <SkillIcon name={advisor.icon} className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-foreground">
                        {tAdvisors(`${advisor.key}.title`)}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        {tAdvisors(`${advisor.key}.tagline`)}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {t(`${advisor.key}.longDescription`)}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${locale}#hero`}
                    className="hidden md:flex items-center gap-1 flex-shrink-0 text-sm font-medium text-primary hover:underline mt-1"
                  >
                    {t('tryNow')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center rounded-2xl border border-border bg-card p-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('ctaTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('ctaDescription')}
          </p>
          <Link
            href={`/${locale}#hero`}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {t('ctaButton')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
