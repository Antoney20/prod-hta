'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const heroImages = [
  {
    src: '/images/launch.webp',
    alt: 'Health CS Duale inaugurates BPTAP',
    caption: 'Health CS Duale inaugurates BPTAP',
  },
  {
    src: '/images/nice-training.jpg',
    alt: 'Advanced Health Technology Assessment training by NICE',
    caption: 'Advanced HTA Training by NICE',
  },
  {
    src: '/images/hta-training.jpeg',
    alt: 'Health Technology Assessment training workshop',
    caption: 'HTA Training Workshop',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() =>
    setCurrent((i) => (i + 1) % heroImages.length), [])
  const prev = useCallback(() =>
    setCurrent((i) => (i - 1 + heroImages.length) % heroImages.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [paused, next])

  return (
    <section className="bg-white   mt-8">


      <div className="container border-b-2  border-gray-900  mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[540px]">

          <div className="flex flex-col justify-center py-14 lg:pr-16 lg:border-r border-gray-200">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-6"
            >
              Towards advancing{' '}
              <span className="text-[#27aae1]">Universal Health Coverage</span>{' '}
              in Kenya
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-xl  leading-relaxed max-w-lg mb-10"
            >
              The Benefits Package and Tariffs Advisory Panel is committed to
              promoting transparent, evidence-informed approaches to healthcare
              decision-making in Kenya.
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/about-us"
                className="inline-flex items-center justify-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] active:bg-[#1279a8] text-white text-sm font-bold px-6 py-3 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2"
              >
                Learn More About BPTAP
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/interventions-form"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 text-sm font-bold px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                Submit a Proposal
              </Link>
            </motion.div>

            {/* Trust markers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-8 border-t border-gray-200"
            >
              {[
                'Ministry of Health Kenya',
                'BPTAP',
                'Evidence-based',
              ].map((tag) => (
                <span key={tag} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27aae1] flex-shrink-0" />
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:pl-10 py-10 flex items-center"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Image frame */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden border border-gray-200">

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                 <Image
                      src={heroImages[current].src}
                      alt={heroImages[current].alt}
                      fill
                      className="object-contain"
                      priority={current === 0}
                    />
                </motion.div>
              </AnimatePresence>

              {/* Caption bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm px-4 py-2.5 z-10">
                <p className="text-white text-xs font-medium">
                  {heroImages[current].caption}
                </p>
              </div>

              {/* Prev / Next */}
              <button
                onClick={() => { setPaused(true); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center text-gray-800 shadow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1]"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setPaused(true); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center text-gray-800 shadow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1]"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide indicators + counter */}
            <div className="absolute bottom-10 left-10 right-10 lg:left-auto lg:right-10 flex items-center justify-between lg:justify-end gap-4">
              <div className="flex gap-1.5">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPaused(true); setCurrent(i) }}
                    className={`h-1 rounded-full transition-all duration-300 focus:outline-none ${
                      i === current
                        ? 'w-8 bg-[#27aae1]'
                        : 'w-4 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-400 tabular-nums">
                {String(current + 1).padStart(2, '0')} /{' '}
                {String(heroImages.length).padStart(2, '0')}
              </span>
            </div>

            {/* Progress bar */}
            {!paused && (
              <div className="absolute top-10 left-10 right-10 lg:left-auto h-0.5 bg-gray-200 overflow-hidden">
                <motion.div
                  key={current}
                  className="h-full bg-[#27aae1] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: 'linear' }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}