import type { Metadata } from 'next'
import AboutClient from './client'


export const metadata: Metadata = {
  title: 'About Us | Health Benefits and  Tariffs Advisory panel',
  description: 'The  Health Benefits and  Tariffs Advisory panel is dedicated to transparent, evidence-informed healthcare decision-making to advance Universal Health Coverage in Kenya.',
  keywords: 'Health Technology Assessment, HTA, Kenya healthcare, Benefits Package, Tariffs Advisory Panel, Universal Health Coverage, evidence-based healthcare',
  openGraph: {
    title: 'About Us |  Health Benefits and  Tariffs Advisory panel',
    description: 'The  Health Benefits and  Tariffs Advisory panelis dedicated to transparent, evidence-informed healthcare decision-making to advance Universal Health Coverage in Kenya.',
    url: 'https://hbtap-chi.vercel.app/about-us',
    siteName: ' Health Benefits and  Tariffs Advisory panel',
    images: [
      {
        url: '/images/hbtap-design.png',
        width: 1200,
        height: 630,
        alt: ' Health Benefits and  Tariffs Advisory panel design image',
      },
    ],
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutClient />
}