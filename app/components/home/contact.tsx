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
          >
            <h3 className="text-xl font-bold mb-6 text-[#020e3c]">Contact Information</h3>
            <p className="text-gray-700 mb-8">
              The Health Technology Assessment Panel is dedicated to promoting transparent, 
              evidence-informed approaches to healthcare decision-making in Kenya. 
              Get in touch to learn more about our work.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-[#1338BE]/10 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-[#020e3c]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Email Us</h4>
                  <p className="text-gray-700 mb-1">For general inquiries:</p>
                  <a 
                    href="#" 
                    className="text-[#020e3c] hover:text-[#63C5DA] transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#1338BE]/10 p-3 rounded-full mr-4">
                  <MapPin className="h-6 w-6 text-[#020e3c]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Visit Us</h4>
                  <p className="text-gray-700">
                    Center for Epidemiological Modelling and Analysis<br />
                    University of Nairobi<br />
                    Nairobi, Kenya
                  </p>
                  <a
                    href="https://cema-africa.uonbi.ac.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center px-4 py-2 rounded-md bg-[#1338BE] text-white hover:bg-[#63C5DA] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1338BE]"
                  >
                    Learn more about CEMA
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#1338BE]/10 p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-[#020e3c]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Call Us</h4>
                  <p className="text-gray-700 mb-1">Monday to Friday, 8am - 5pm EAT</p>
                  <a 
                    href="#" 
                    className="text-[#020e3c] hover:text-[#63C5DA] transition-colors"
                  >
                    Coming soon
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h4 className="text-lg font-medium mb-4">Connect With Us</h4>
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