'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  ExternalLink, 
  Mail, 
  MapPin, 
  Phone, 
  Twitter, 
  Linkedin, 
  Youtube,
  Send,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import CTA from '../components/home/cta'
import ContactFormSection from './contactF'


export default function ContactClient() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')

  const handleSubscribe = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSubscribing(true)
    
    setTimeout(() => {
      setIsSubscribing(false)
      setSubscriptionMessage('Thank you for subscribing to our newsletter!')
      setEmail('')
      
      setTimeout(() => {
        setSubscriptionMessage('')
      }, 5000)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ContactFormSection/>
      <CTA/>
      <SubscribeSection 
        email={email}
        setEmail={setEmail}
        isSubscribing={isSubscribing}
        subscriptionMessage={subscriptionMessage}
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
            Have questions about Health Benefits and Tariffs Advisory Panel? 
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
  subscriptionMessage: string
  handleSubscribe: (e: React.FormEvent) => void
}

function SubscribeSection({ email, setEmail, isSubscribing, subscriptionMessage, handleSubscribe }: SubscribeSectionProps) {
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
              className="flex-1 px-4 py-3 border  border-[#020e3c] rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button 
              type="submit" 
              disabled={isSubscribing}
              className="bg-white text-[#020e3c] hover:bg-gray-100 px-10 py-6 mt-1 rounded-md font-semibold"
            >
              {isSubscribing ? (
                <>Subscribing...</>
              ) : (
                <>
                  Subscribe <Send className="ml-2 h-6 w-6" />
                </>
              )}
            </Button>
          </div>
          
          {subscriptionMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center text-green-400"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {subscriptionMessage}
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