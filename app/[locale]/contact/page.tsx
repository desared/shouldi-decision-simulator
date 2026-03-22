import type { Metadata } from 'next'
import { generatePageMetadata, buildBreadcrumbSchema } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import ContactClient from './contact-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generatePageMetadata(locale, {
    titleEn: 'Contact Us',
    titleDe: 'Kontakt',
    descriptionEn: 'Get in touch with the shouldi team for questions, feedback, partnerships, or support at info@actondata.io.',
    descriptionDe: 'Kontaktieren Sie das shouldi-Team für Fragen, Feedback, Partnerschaften oder Support unter info@actondata.io.',
    path: '/contact',
  })
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <ContactClient />
      <JsonLd data={buildBreadcrumbSchema(locale, 'Contact', '/contact')} />
    </>
  )
}
