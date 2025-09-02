import type { Metadata } from 'next'
import ContactClient from './form'


export const metadata: Metadata = {
  title: 'Contact Us | Health Technology Assessment ',
  description: 'Get in touch with the  Benefits Package and Tariffs Advisory Panel. We are here to answer your questions about health technology assessment, evidence-based healthcare, and our work in Kenya.',
  keywords: 'contact HTA Kenya, health technology assessment contact, healthcare policy Kenya, BPTAP contact, evidence-based healthcare',
  openGraph: {
    title: 'Contact Us | Health Technology Assessment Kenya',
    description: 'Get in touch with the  Benefits Package and Tariffs Advisory Panel for inquiries about our work in advancing evidence-based healthcare in Kenya.',
    url: 'https://hta-chi.vercel.app/contact',
    siteName: ' Benefits Package and Tariffs Advisory Panel',
    images: [
      {
        url: '/images/contact-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact the Benefits Package and Tariffs Advisory Panel Kenya',
      },
    ],
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactClient />
}