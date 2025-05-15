import type { Metadata } from 'next'
import GovernanceClient from './governance'


export const metadata: Metadata = {
  title: 'Governance | Health Technology Assessment | BPTAP',
  description: 'Explore the governance structure and stakeholder roles within the Health Technology Assessment (HTA) process in Kenya, supporting Universal Health Coverage (UHC) through evidence-based decision-making.',
  keywords: 'Health Technology Assessment, HTA Governance, Kenya healthcare policy, Universal Health Coverage, Ministry of Health Kenya, evidence-based healthcare, healthcare stakeholders, HTA process',
  openGraph: {
    title: 'Governance | Health Technology Assessment | BPTAP',
    description: 'Explore the governance structure and stakeholder roles within the Health Technology Assessment (HTA) process in Kenya, supporting Universal Health Coverage (UHC) through evidence-based decision-making.',
    url: 'https://hta-chi.vercel.app/governance',
    siteName: 'Health Technology Assessment Panel',
    images: [
      {
        url: '/images/governance-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Governance of HTA process in Kenya led by Ministry of Health and stakeholders',
      },
    ],
    type: 'website',
  },
}

export default function GovernancePage() {
  return <GovernanceClient />
}