import type { Metadata } from 'next'
import FAQsSection from './details'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about the Health Benefits Package and Tariffs Advisory Panel (HBPTAP), intervention proposals, benefit packages, and healthcare decision-making processes in Kenya.',
  keywords: [
    'HBPTAP FAQ',
    'health benefits package questions',
    'intervention proposal FAQ',
    'healthcare tariffs Kenya',
    'Social Health Insurance Act',
    'benefit package intervention',
    'healthcare decision making',
    'health technology assessment',
    'Kenya healthcare FAQ'
  ],
  openGraph: {
    title: 'FAQs | Health Benefits and Tariffs Advisory Panel',
    description: 'Get answers to frequently asked questions about HBPTAP, intervention proposals, benefit packages, and healthcare decision-making processes in Kenya.',
    url: 'https://hta-chi.vercel.app/faqs',
    siteName: 'HBPTAP - Health Benefits and Tariffs Advisory Panel',
    images: [
      {
        url: '/og-faqs.jpg',
        width: 1200,
        height: 630,
        alt: 'HBPTAP Frequently Asked Questions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs | Health Benefits and Tariffs Advisory Panel',
    description: 'Get answers to frequently asked questions about HBPTAP, intervention proposals, and healthcare decision-making in Kenya.',
    images: ['/og-faqs.jpg'],
    creator: '@HBPTAP_Kenya',
    site: '@HBPTAP_Kenya',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://hta-chi.vercel.app/faqs',
  },
}

export default function FAQsPage() {
  return (
    <>
      <Navbar />
      <FAQsSection />
      <Footer />
    </>
  )
}