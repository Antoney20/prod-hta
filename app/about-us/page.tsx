import type { Metadata } from 'next'
import AboutClient from './client'


export const metadata: Metadata = {
  title: 'About Us | Health Technology Assessment Panel',
  description: 'The Health Technology Assessment Panel (HealthTA) is dedicated to transparent, evidence-informed healthcare decision-making to advance Universal Health Coverage in Kenya.',
  keywords: 'Health Technology Assessment, HTA, Kenya healthcare, Benefits Package, Tariffs Advisory Panel, Universal Health Coverage, evidence-based healthcare',
  openGraph: {
    title: 'About Us | Health Technology Assessment Panel',
    description: 'The Health Technology Assessment Panel (HealthTA) is dedicated to transparent, evidence-informed healthcare decision-making to advance Universal Health Coverage in Kenya.',
    url: 'https://healthta.ke/about',
    siteName: 'Health Technology Assessment Panel',
    images: [
      {
        url: '/images/about-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Health Technology Assessment Panel team working on healthcare solutions',
      },
    ],
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutClient />
}