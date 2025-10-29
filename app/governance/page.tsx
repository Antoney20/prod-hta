import type { Metadata } from 'next'
import TeamClient from './client'


export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the dedicated experts of the  Benefits Package and Tariffs Advisory Panel Panel (BPTAP) working to advance evidence-based healthcare decision-making in Kenya.',
  openGraph: {
    title: 'Our Team | The Benefits Package and Tariffs Advisory Panel',
    description: 'Meet the dedicated experts of the Benefits Package and Tariffs Advisory Panel (HBPTAP) working to advance evidence-based healthcare decision-making in Kenya.',
    url: 'https://bptap.health.go.ke/team',
    images: [
      {
        url: '/og-team.jpg',
        width: 1200,
        height: 630,
        alt: 'The Benefits Package and Tariffs Advisory Panel Team',
      },
    ],
  },
    robots: {
    index: true,
    follow: true,
  },
    verification: {
    google: "D0TeHRYuJqPMFxLbOlh6kR6MAkSElpgiXE6GOv_yARw",
  },
  category: "Healthcare",
}

export default function TeamPage() {
  return <TeamClient />
}