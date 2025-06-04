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
    <section className="py-16 md:py-20 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#138788]/5 via-white to-[#27aae1]/5"></div>
      

      <div className="absolute top-10 left-10 w-20 h-20 bg-[#fe7105]/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#27aae1]/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-[#138788]/15 rotate-45 blur-lg animate-bounce" style={{animationDelay: '0.5s'}}></div>
      
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="contact-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#138788" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-grid)" />
        </svg>
      </div>


      <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0,50 Q50,0 100,50 Q50,100 0,50" fill="#138788"/>
        </svg>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M100,50 Q50,0 0,50 Q50,100 100,50" fill="#27aae1"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Get in <span className="text-[#27aae1]">Touch</span>
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            The Health Benefits and Tariffs Advisory Panel is committed to promoting transparent and evidence-informed approaches to healthcare decision-making in Kenya. We welcome inquiries from stakeholders.
          </p>
        </motion.div>

        {/* Main CTA Card */}
        <motion.div 
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#138788]/20 to-[#27aae1]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 md:p-12 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Ready to Connect?
                </h3>
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
                  <Link href='/contact' className='font-bold text-[#27aae1] hover:text-[#138788] transition-colors hover:underline'>
                    Contact us
                  </Link>
                  {' '}for general inquiries. To propose interventions,{' '}
                  <Link className='font-bold text-[#27aae1] hover:text-[#138788] transition-colors hover:underline' href='/interventions-form'>
                    fill this form
                  </Link>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button className="bg-[#27aae1] hover:bg-[#138788] text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      General Inquiries
                      <Mail className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Link href="/interventions-form">
                    <Button variant="outline" className="border-2 border-[#27aae1] text-[#27aae1] hover:bg-[#27aae1] hover:text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300">
                      Submit Proposal
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-[#138788]/30 rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-[#fe7105]/20 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}