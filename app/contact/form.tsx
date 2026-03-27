'use client'

import React, { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import CTA from '../components/home/cta'
import ContactFormSection from './contactF'
import { subscribeToNewsletter } from '../api/newsletter'

export default function ContactClient() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setSubscriptionStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setIsSubscribing(true)
    setSubscriptionStatus({ type: null, message: '' })

    try {
      const result = await subscribeToNewsletter({ email })
      setSubscriptionStatus({ type: result.success ? 'success' : 'error', message: result.message })
      if (result.success) setEmail('')
    } catch {
      setSubscriptionStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubscribing(false)
      setTimeout(() => setSubscriptionStatus({ type: null, message: '' }), 5000)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ContactFormSection />
      <CTA />
      
      <Footer />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="bg-white  ">
      <div className="container mx-auto px-2 border-b-2 border-gray-900 py-14">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#27aae1]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
              Contact Us
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-5">
            Get in Touch
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Have questions about the Benefits Package and Tariffs Advisory Panel?
            We&apos;re here to help advance evidence-based healthcare decisions in Kenya.
          </p>
        </div>
      </div>
    </section>
  )
}


interface SubscribeSectionProps {
  email: string
  setEmail: (email: string) => void
  isSubscribing: boolean
  subscriptionStatus: { type: 'success' | 'error' | null; message: string }
  handleSubscribe: (e: React.FormEvent) => void
}
