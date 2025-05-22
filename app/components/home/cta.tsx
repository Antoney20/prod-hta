'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function CTA() {
  return (
    <section className="py-16 mb-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#138788]/5 via-white to-[#27aae1]/5"></div>
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#fe7105]/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#27aae1]/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-[#138788]/15 rotate-45 blur-lg animate-bounce" style={{animationDelay: '0.5s'}}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#138788" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Main Content Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#138788]/20 to-[#27aae1]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              
              {/* Text Content */}
              <div className="mb-8">
                <span className="text-xl md:text-2xl text-gray-700 leading-relaxed block">
                  Fill the form below for general enquiries. To propose interventions, 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#138788] to-[#27aae1] font-semibold"> fill this form</span>
                </span>
              </div>

              {/* CTA Button */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1d8fc3] to-[#63C5DA] rounded-xl blur-lg opacity-30 animate-pulse"></div>
                
                <Link href="/interventions-form" aria-label="Get in touch to propose interventions">
                  <Button className="relative bg-gradient-to-r from-[#1d8fc3] to-[#63C5DA] hover:from-[#138788] hover:to-[#27aae1] text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 group">
                    get in touch 
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-[#138788]/30 rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-[#fe7105]/20 rounded-full"></div>
              
            </div>
          </div>

          {/* Subtle Bottom Accent */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-[#138788] via-[#27aae1] to-[#fe7105] rounded-full opacity-50"></div>
          </div>

        </div>
      </div>

      {/* Corner Decorations */}
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

    </section>
  )
}

export default CTA