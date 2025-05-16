'use client'

import React from 'react'
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
  Youtube 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactSection() {
  return (
    <section className="py-16 md:py-24 overflow-x-hidden bg-white text-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get in <span className="text-[#020e3c]">Touch</span>
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Have questions about our work or interested in collaboration? We're here to help.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white text-gray-900 p-8 rounded-xl shadow-lg border border-gray-100"
          >
            <h3 className="text-xl font-bold mb-6 text-[#020e3c]">Send Us a Message</h3>
            <p className="text-gray-600 mb-8">
              Fill out the form below and our team will get back to you as soon as possible.
            </p>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1338BE] focus:border-[#1338BE] outline-none transition resize-none"
                  placeholder="Your message..."
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