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
      <ContactFormSection />
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
      {/* Background Pattern */}
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

function ContactFormSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
          >
            <h3 className="text-2xl font-bold mb-6 text-[#020e3c]">Send Us a Message</h3>
            <p className="text-gray-600 mb-8">
              Fill out the form below and our team will respond within 24-48 hours.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                  placeholder="Your organization (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                  placeholder="What can we help you with?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              
              <Button type="submit" className="w-full bg-[#1338BE] hover:bg-[#63C5DA] text-white py-3">
                Send Message <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#020e3c]">Contact Information</h3>
              <p className="text-gray-700 mb-8">
                The Health Benefits and Tariffs Advisory Panel is committed to promoting transparent, 
                evidence-informed approaches to healthcare decision-making in Kenya. 
                We welcome inquiries from stakeholders, researchers, and partners.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-start mb-6">
                <div className="bg-[#1338BE]/10 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-[#020e3c]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Email Us</h4>
                  <p className="text-gray-700 mb-2">For general inquiries contact.</p>
                  <a 
                    href="#" 
                    className="text-[#020e3c] hover:text-black transition-colors"
                  >
                  hbtap@uonbi.ac.ke
                  </a>
                </div>
              </div>
            
              
              <div className="flex items-start">
                <div className="bg-[#1338BE]/10 p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-[#020e3c]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Office Hours</h4>
                  <p className="text-gray-700">Monday to Friday, 8:00 AM - 5:00 PM EAT</p>
                  <p className="text-gray-600 text-sm mt-1">Closed on public holidays</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-medium mb-4">Connect With Us</h4>
              <p className="text-gray-700 mb-4">Follow us on social media for the latest updates:</p>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-gray-100 hover:bg-[#1338BE] hover:text-white transition-colors w-10 h-10 rounded-full flex items-center justify-center"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#1338BE] hover:text-white transition-colors w-10 h-10 rounded-full flex items-center justify-center"
                  aria-label="Connect with us on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#1338BE] hover:text-white transition-colors w-10 h-10 rounded-full flex items-center justify-center"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
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