'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const heroImages = [
  // {
  //   src: "/images/health-awareness.jpeg",
  //   alt: "Health awareness and universal health coverage initiatives in Kenya",
  //   title: "Health Awareness"
  // },
  {
    src: "/images/nice-training.jpg",
    alt: "Advanced Health Technology Assessment training by NICE",
    title: "Advanced HTA Training by NICE"
  },
  {
    src: "/images/hta-training.jpeg",
    alt: "Health Technology Assessment training workshop for healthcare professionals",
    title: "HTA Training"
  }
]

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentImageIndex((prevIndex) => 
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentImageIndex(index)
  }

  return (
    <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 bg-[#86cefa] overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/90 to-transparent rounded-bl-full"></div>
        

        <div className="absolute bottom-0 left-0 w-1/2 h-1/2">
          <svg className="w-full h-full opacity-90" viewBox="0 0 400 400" fill="none">
            <circle cx="50" cy="350" r="100" fill="url(#gradient1)" />
            <circle cx="150" cy="300" r="60" fill="url(#gradient2)" />
            <circle cx="80" cy="250" r="40" fill="url(#gradient3)" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#27aae1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#63C5DA" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#63C5DA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#27aae1" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#27aae1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#63C5DA" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-10">
          <svg width="120" height="300" viewBox="0 0 120 300" fill="none">
            {Array.from({ length: 15 }, (_, i) => (
              <circle 
                key={i}
                cx={30 + (i % 3) * 30} 
                cy={30 + Math.floor(i / 3) * 40} 
                r="3" 
                fill="#27aae1"
                opacity={0.6 - (i * 0.03)}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div 
            className="w-full lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-black block">Towards advancing</span> 
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-white block mt-2 sm:ml-6">
                Universal Health Coverage
              </span> 
              <span className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-black block mt-2 sm:ml-32">
                in Kenya
              </span>
            </h1>
           
            <motion.p 
              className="text-gray-800 text-base sm:text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              The Benefits Package and Tariffs Advisory Panel is committed to promoting transparent, evidence-informed approaches to healthcare decision-making in Kenya.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/about-us">
                <Button className="bg-[#27aae1] hover:bg-black text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Learn More About BPTAP
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/interventions-form">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-[#63C5DA] hover:text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300 bg-transparent">
                  Submit Proposal
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <div className="relative h-64 md:h-96 lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl group">
        
              <div className="absolute inset-0 bg-gradient-to-br from-[#27aae1]/10 via-transparent to-[#63C5DA]/20 z-10"></div>
            
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#63C5DA] rounded-tl-2xl z-20"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#27aae1] rounded-br-2xl z-20"></div>
              
              {/* Image Slider */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-0"
                >
                  <Image
                    src={heroImages[currentImageIndex].src}
                    alt={heroImages[currentImageIndex].alt}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={currentImageIndex === 0}
                    className="transition-transform duration-700 hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-[#27aae1] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-[#27aae1] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Image Title Overlay */}
              <div className="absolute bottom-16 left-4 right-4 z-30 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">{heroImages[currentImageIndex].title}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}