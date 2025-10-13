'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import CTA from '../components/home/cta'
import ContactFormSection from './contactF'
import { subscribeToNewsletter } from '../api/newsletter'


export default function ContactClient() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setSubscriptionStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      })
      return
    }
    
    setIsSubscribing(true)
    setSubscriptionStatus({ type: null, message: '' })
    
    try {
      const result = await subscribeToNewsletter({ email })
      
      if (result.success) {
        setSubscriptionStatus({
          type: 'success',
          message: result.message
        })
        setEmail('')
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setSubscriptionStatus({ type: null, message: '' })
        }, 5000)
      } else {
        setSubscriptionStatus({
          type: 'error',
          message: result.message
        })
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setSubscriptionStatus({ type: null, message: '' })
        }, 5000)
      }
    } catch (error) {
      setSubscriptionStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      })
      
      setTimeout(() => {
        setSubscriptionStatus({ type: null, message: '' })
      }, 5000)
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ContactFormSection />
      <CTA/>
      <SubscribeSection 
        email={email}
        setEmail={setEmail}
        isSubscribing={isSubscribing}
        subscriptionStatus={subscriptionStatus}
        handleSubscribe={handleSubscribe}
      />
      <Footer />
    </main>
  )
}

function HeroSection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-[#1338BE]/10 to-transparent rounded-tr-full"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Have questions about the Benefits Package and Tariffs Advisory Panel? 
            We're here to help advance evidence-based healthcare decisions in Kenya.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

interface SubscribeSectionProps {
  email: string
  setEmail: (email: string) => void
  isSubscribing: boolean
  subscriptionStatus: {
    type: 'success' | 'error' | null;
    message: string;
  }
  handleSubscribe: (e: React.FormEvent) => void
}

function SubscribeSection({ 
  email, 
  setEmail, 
  isSubscribing, 
  subscriptionStatus, 
  handleSubscribe 
}: SubscribeSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-[#63C5DA] text-black">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Stay Updated
        </h2>
        <p className="text-xl mb-8">
          Subscribe to our newsletter for the latest updates on health technology assessment in Kenya
        </p>
        
        <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isSubscribing}
              className="flex-1 px-4 py-3 border border-[#020e3c] rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button 
              type="submit" 
              disabled={isSubscribing}
              className="bg-white text-[#020e3c] hover:bg-gray-100 px-10 py-6 mt-1 rounded-md font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#020e3c] mr-2"></div>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe <Send className="ml-2 h-6 w-6" />
                </>
              )}
            </Button>
          </div>
          
          {subscriptionStatus.type && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-md flex items-center justify-center ${
                subscriptionStatus.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {subscriptionStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span>{subscriptionStatus.message}</span>
            </motion.div>
          )}
        </form>
        
        <p className="text-sm text-[#020e3c] mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}