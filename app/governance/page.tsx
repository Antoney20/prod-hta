import type { Metadata } from 'next'
import TeamClient from './client'


export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the dedicated experts of the Health Benefits Package and Tariffs Advisory Panel (HBPTAP) working to advance evidence-based healthcare decision-making in Kenya.',
  openGraph: {
    title: 'Our Team | Health Benefits and Tariffs Advisory Panel',
    description: 'Meet the dedicated experts of the Benefits Package and Tariffs Advisory Panel (HBPTAP) working to advance evidence-based healthcare decision-making in Kenya.',
    url: 'https://hta-chi.vercel.app/team',
    images: [
      {
        url: '/og-team.jpg',
        width: 1200,
        height: 630,
        alt: 'Health Benefits and Tariffs Advisory Panel Team',
      },
    ],
  },
}

export default function TeamPage() {
  return <TeamClient />
}