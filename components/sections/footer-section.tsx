"use client"

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo-icon'

export function FooterSection() {
  const t = useTranslations('footer')
  const params = useParams()
  const locale = params.locale || 'en'

  const footerLinks = [
    {
      title: t('product.title'),
      links: [
        { label: t('product.scenarios'), href: `/${locale}/scenarios` },
        { label: t('product.pricing'), href: `/${locale}/pricing` }
      ]
    },
    {
      title: t('company.title'),
      links: [
        { label: t('company.about'), href: `/${locale}/about` }
      ]
    },
    {
      title: t('resources.title'),
      links: [
        { label: t('resources.help'), href: `/${locale}/help` },
        { label: t('resources.guides'), href: `/${locale}/guides` }
      ]
    },
    {
      title: t('legal.title'),
      links: [
        { label: t('legal.privacy'), href: `/${locale}/privacy` },
        { label: t('legal.terms'), href: `/${locale}/terms` }
      ]
    }
  ]

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <LogoIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">should<span className="text-primary">i</span></span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
