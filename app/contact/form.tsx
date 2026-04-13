'use client'

import React, { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import CTA from '../components/home/cta'
import ContactFormSection from './contactF'


export default function ContactClient() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })



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


