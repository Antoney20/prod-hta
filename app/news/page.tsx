import type { Metadata } from 'next'
import NewsClient from './client';


export const metadata: Metadata = {
  title: "News & Updates | Benefits package and Tariffs Advisory Panel Kenya",
  description:
    "Stay informed about Benefits package and Tariffs Advisory Panel ongoing projects, research progress, field activities, and upcoming events in the field of healthcare technology assessment in Kenya.",
  keywords: [
    "Benefits package and Tariffs Advisory Panel news",
    "HTA updates",
    "cema hta", 
    "healthcare news Kenya",
    "healthcare technology assessment",
    "Kenya healthcare policy",
    "universal health coverage Kenya",
    "Benefits package package",
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
    title: "News & Updates | Benefits package and Tariffs Advisory Panel Kenya",
    description:
      "Get the latest news and updates from the Benefits package and Tariffs Advisory Panel Panel on healthcare-related research, programs, collaborations, and events in Kenya.",
    url: "https://bptap.health.go.ke/news", 
    siteName: "Benefits package and Tariffs Advisory Panel Kenya",
    images: [
      {
        url: "/images/news/news-og.jpg", 
        width: 1200,
        height: 630,
        alt: "Benefits package and Tariffs Advisory Panel News and Updates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News & Updates | Benefits package and Tariffs Advisory Panel Kenya",
    description:
      "Follow the Benefits package and Tariffs Advisory Panel latest activities, project milestones, and event announcements in Kenya's healthcare sector.",
    images: ["/images/news/news-og.jpg"], 
  },
  alternates: {
    canonical: "https://bptap.health.go.ke/news",
  },

    verification: {
    google: "D0TeHRYuJqPMFxLbOlh6kR6MAkSElpgiXE6GOv_yARw",
  },
  category: "Healthcare",
};

export default function NewsPage() {
  return <NewsClient />
}