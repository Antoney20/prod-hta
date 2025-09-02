import type { Metadata } from 'next'
import AboutClient from './client'


export const metadata: Metadata = {
  title: 'About Us | The Benefits Package and Tariffs Advisory Panel',
  description: 'The Benefits Package and Tariffs Advisory Panel is dedicated to transparent, evidence-informed healthcare decision-making to advance Universal Health Coverage in Kenya.',
  keywords: 'Health Technology Assessment, HTA, Kenya healthcare, Benefits Package, Tariffs Advisory Panel, Universal Health Coverage, evidence-based healthcare',
  openGraph: {
    title: 'About Us | The Benefits Package and Tariffs Advisory Panel',
    description: 'The Benefits Package and Tariffs Advisory Panelis dedicated to transparent, evidence-informed healthcare decision-making to advance Universal Health Coverage in Kenya.',
    url: 'https://hbtap-chi.vercel.app/about-us',
    siteName: ' The Benefits Package and Tariffs Advisory Panel',
    images: [
      {
        url: '/images/hbtap-design.png',
        width: 1200,
        height: 630,
        alt: ' hta design image',
      },
    ],
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutClient />
}