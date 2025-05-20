import type { Metadata } from 'next'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

export const metadata: Metadata = {
  title: 'Capacity Building | Health Benefits and Tariffs Advisory Panel',
  description: 'Explore our capacity building initiatives at the Health Benefits and Tariffs Advisory Panel (HBTAP), aimed at strengthening Kenya\'s healthcare decision-making through training, mentorship, and stakeholder engagement.',
  openGraph: {
    title: 'Capacity Building | Health Benefits and Tariffs Advisory Panel',
    description: 'Learn about HBTAP\'s capacity building efforts focused on developing technical expertise, enhancing evidence-informed policymaking, and supporting sustainable health system reforms in Kenya.',
    url: 'https://hta-chi.vercel.app/capacity-building',
    images: [
      {
        url: '/og-capacity-building.jpg', // Replace with actual image if available
        width: 1200,
        height: 630,
        alt: 'Capacity Building at Health Benefits and Tariffs Advisory Panel',
      },
    ],
  },
}

export default function CapacityBuildingPage() {
  return (
    <>
    <Navbar />
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Capacity Building</h1>
          <p className="text-lg text-gray-600">This page is coming soon. Please check back later.</p>
      </main>
      <Footer />
    </>
  )
}
