import type { Metadata } from 'next'
import NewsClient from './client';


export const metadata: Metadata = {
  title: "News & Updates | Health Benefits and Tariffs Advisory Panel Kenya",
  description:
    "Stay informed about Health Benefits and Tariffs Advisory Panel ongoing projects, research progress, field activities, and upcoming events in the field of healthcare technology assessment in Kenya.",
  keywords: [
    "Health Benefits and Tariffs Advisory Panel news",
    "HTA updates",
    "cema hta", 
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
    title: "News & Updates | Health Benefits and Tariffs Advisory Panel Kenya",
    description:
      "Get the latest news and updates from the Health Benefits and Tariffs Advisory Panel Panel on healthcare-related research, programs, collaborations, and events in Kenya.",
    url: "https://hta-chi.vercel.app/news", 
    siteName: "Health Benefits and Tariffs Advisory Panel Kenya",
    images: [
      {
        url: "/images/news/news-og.jpg", 
        width: 1200,
        height: 630,
        alt: "Health Benefits and Tariffs Advisory Panel News and Updates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News & Updates | Health Benefits and Tariffs Advisory Panel Kenya",
    description:
      "Follow the Health Benefits and Tariffs Advisory Panel latest activities, project milestones, and event announcements in Kenya's healthcare sector.",
    images: ["/images/news/news-og.jpg"], 
  },
  alternates: {
    canonical: "https://hta-chi.vercel.app/news",
  },
};

export default function NewsPage() {
  return <NewsClient />
}