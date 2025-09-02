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
    <section className="py-16 md:py-16 overflow-x-hidden bg-white text-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get in <span className="text-[#020e3c]">Touch</span>
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            The Benefits Package and Tariffs Advisory Panel is committed to promoting transparent and evidence-informed approaches to healthcare decision-making in kenya. We welcome inquiries from stakeholders.
          </p>
        </div>
      </div>
    </section>
  )
}