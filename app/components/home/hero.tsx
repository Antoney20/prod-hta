'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20">

      <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/50 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-[#1338BE]/20 to-transparent rounded-tr-full"></div>
        </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <motion.div 
            className="w-full lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
              <span className="text-[#1338BE]">Towards advancing</span> <br />
              Universal Health Coverage
            </h1>
            <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
              Promoting transparent, evidence-informed approaches to healthcare accessibility
              through the Social Health Authority program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/about">
                <Button className="bg-[#1338BE] hover:bg-[#63C5DA] text-white px-8 py-2 rounded-md text-base">
                  Learn More
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-[#1338BE] text-[#1338BE] hover:bg-[#1338BE] hover:text-white px-8 py-2 rounded-md text-base">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Image/Illustration */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-xl">
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#63C5DA]/20 to-[#1338BE]/20 z-10"></div>
              <Image
                src="/hero-image.jpg" 
                alt="HTA hero section image"
                fill
                style={{ objectFit: "cover" }}
                priority
                className="z-0"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Feature cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 2xl:mt-44"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#1338BE]">
            <h2 className="text-xl font-semibold mb-3">Health Benefits Package</h2>
            <p className="text-gray-600">
              Reviewing and optimizing the Social Health Authority (SHA) program to ensure comprehensive coverage.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#63C5DA]">
            <h2 className="text-xl font-semibold mb-3">Fair Pricing & Tariffs</h2>
            <p className="text-gray-600">
              Providing evidence-based recommendations on equitable pricing for healthcare services.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#090a0e]">
            <h2 className="text-xl font-semibold mb-3">Program Monitoring</h2>
            <p className="text-gray-600">
              Continuously improving the SHA program through careful monitoring and evaluation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}