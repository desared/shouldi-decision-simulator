import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieConsentProvider } from '@/components/cookie-consent'
import { JsonLd } from '@/components/json-ld'
import '../globals.css'

const BASE_URL = 'https://shouldi.io'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    en: 'shouldi - AI Decision Simulator | See Your Future Before You Decide',
    de: 'shouldi - KI-Entscheidungssimulator | Sehen Sie Ihre Zukunft Bevor Sie Entscheiden',
  }
  const descriptions: Record<string, string> = {
    en: 'Simulate your decisions and explore possible futures with AI-powered scenario analysis. Free decision simulator for career, finance, health, and life choices.',
    de: 'Simulieren Sie Ihre Entscheidungen und erkunden Sie mögliche Zukünfte mit KI-gestützter Szenarioanalyse. Kostenloser Entscheidungssimulator für Karriere, Finanzen, Gesundheit und Lebensentscheidungen.',
  }

  const title = titles[locale] || titles.en
  const description = descriptions[locale] || descriptions.en

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: '%s | shouldi',
    },
    description,
    keywords: locale === 'de'
      ? ['Entscheidungssimulator', 'KI', 'Szenarioanalyse', 'Entscheidungshilfe', 'shouldi', 'Was-wäre-wenn']
      : ['decision simulator', 'AI', 'scenario analysis', 'decision making', 'shouldi', 'what if analysis', 'life decisions'],
    authors: [{ name: 'shouldi', url: BASE_URL }],
    creator: 'shouldi',
    publisher: 'shouldi',
    generator: 'shouldi',
    openGraph: {
      type: 'website',
      siteName: 'shouldi',
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'shouldi - AI Decision Simulator',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        de: `${BASE_URL}/de`,
      },
    },
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
  }
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }];
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'shouldi',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.svg`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@actondata.io',
    contactType: 'customer support',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <CookieConsentProvider>
              {children}
            </CookieConsentProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <JsonLd data={organizationSchema} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
