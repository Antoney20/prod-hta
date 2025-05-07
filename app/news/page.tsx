import type { Metadata } from 'next'
import NewsClient from './client';


export const metadata: Metadata = {
  title: "News & Updates | Health Technology Assessment Kenya",
  description:
    "Stay informed about Health Technology Assessment Panel's ongoing projects, research progress, field activities, and upcoming events in the field of healthcare technology assessment in Kenya.",
  keywords: [
    "health technology assessment news",
    "HTA updates",
    "healthcare news Kenya",
    "healthcare technology assessment",
    "Kenya healthcare policy",
    "universal health coverage Kenya",
    "health benefits package",
    "healthcare tariffs",
    "evidence-based healthcare",
    "HTA events",
    "health research Kenya",
    "healthcare workshops"
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  openGraph: {
    title: "News & Updates | Health Technology Assessment Kenya",
    description:
      "Get the latest news and updates from the Health Technology Assessment Panel on healthcare-related research, programs, collaborations, and events in Kenya.",
    url: "https://hta-chi.vercel.app/news", 
    siteName: "Health Technology Assessment Kenya",
    images: [
      {
        url: "/images/news/news-og.jpg", 
        width: 1200,
        height: 630,
        alt: "Health Technology Assessment News and Updates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News & Updates | Health Technology Assessment Kenya",
    description:
      "Follow the Health Technology Assessment Panel's latest activities, project milestones, and event announcements in Kenya's healthcare sector.",
    images: ["/images/news/news-og.jpg"], 
  },
  alternates: {
    canonical: "https://hta-chi.vercel.app/news",
  },
};

export default function NewsPage() {
  return <NewsClient />
}