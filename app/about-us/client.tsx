'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import Navbar from '../components/layouts/navbar'

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Our Mission Section */}
      <MissionSection />
      
      {/* Core Values Section */}
      <ValuesSection />
      
      {/* Our Journey Section */}
      {/* <JourneySection /> */}
      
      {/* Collaborative Partners Section */}
      <PartnersSection />
      
      {/* <Footer /> */}
    </main>
  )
}


// Hero Section Component
function HeroSection() {
    const controls = useAnimation()
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.2,
    })
  
    useEffect(() => {
      if (inView) {
        controls.start('visible')
      }
    }, [controls, inView])
  
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    }
  
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    }
  
    return (
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/30 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-[#1338BE]/10 to-transparent rounded-tr-full"></div>
        </div>
        
        <div className="hidden lg:block absolute left-8 md:left-32 top-1/4 h-auto">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '4rem' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-4 w-0.5 bg-gradient-to-b from-[#1338BE] to-[#63C5DA]"
          ></motion.div>
          
          {/* Second animated vertical line */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '6rem' }}
            transition={{ duration: 1, delay: 0.8 }}
            className="h-6 w-0.5 bg-gradient-to-b from-[#63C5DA] to-[#1338BE] mt-4"
          ></motion.div>
          
          {/* Third animated vertical line */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '4rem' }}
            transition={{ duration: 1, delay: 1.1 }}
            className="h-4 w-0.5 bg-gradient-to-b from-[#1338BE] to-[#63C5DA] mt-4"
          ></motion.div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              About <span className="text-[#1338BE]">Health Technology</span> Assessment
            </motion.h1>
            
            <motion.div 
              variants={itemVariants}
              className="w-24 h-1 bg-gradient-to-r from-[#63C5DA] to-[#1338BE] mx-auto mb-8"
            ></motion.div>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto"
            >
              We are dedicated to advancing Universal Health Coverage through transparent, 
              evidence-informed assessment of healthcare technologies and interventions.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-6"
            >
              <Link href="/team">
                <Button className="bg-[#1338BE] hover:bg-[#63C5DA] text-white px-8 py-6 rounded-md text-lg">
                  Meet Our Team
                </Button>
              </Link>
              <Link href="/what-we-do">
                <Button variant="outline" className="border-2 border-[#1338BE] text-[#1338BE] hover:bg-[#1338BE] hover:text-white px-8 py-6 rounded-md text-lg">
                  Our Initiatives
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    )
  }


// Mission Section Component
function MissionSection() {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image Column */}
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="w-full lg:w-1/2 order-2 lg:order-1"
          >
            <motion.div 
              variants={itemVariants}
              className="relative rounded-lg overflow-hidden shadow-xl"
            >
              <div className="aspect-w-16 aspect-h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-[#63C5DA]/10 to-[#1338BE]/10 z-10"></div>
                <Image
                  src="/images/mission-image.jpg" 
                  alt="Health technology assessment team in discussion"
                  width={600}
                  height={400}
                  layout="responsive"
                  className="z-0 object-cover"
                />
              </div>
              
              <motion.div 
                variants={itemVariants}
                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1338BE]/90 to-transparent p-6"
              >
                <h3 className="text-white text-xl font-semibold">Guided by Evidence</h3>
                <p className="text-white/90 text-sm">Our recommendations are based on rigorous scientific assessment</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Content Column */}
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="w-full lg:w-1/2 order-1 lg:order-2"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold mb-6"
            >
              Our <span className="text-[#1338BE]">Mission</span>
            </motion.h2>
            
            <motion.div 
              variants={itemVariants}
              className="w-20 h-1 bg-gradient-to-r from-[#63C5DA] to-[#1338BE] mb-8"
            ></motion.div>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-700 text-lg mb-6"
            >
              The Health Technology Assessment Panel is dedicated to promoting a transparent, 
              evidence-informed approach to the operationalization of healthcare programs, while 
              institutionalizing health technology assessment methodologies in Kenya.
            </motion.p>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-700 text-lg mb-8"
            >
              Our mission is to ensure all Kenyans have access to high-quality, cost-effective healthcare 
              interventions by providing independent, evidence-based assessments and recommendations on 
              health technologies, benefits packages, and fair pricing strategies.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#1338BE]"
            >
              <h4 className="text-xl font-semibold mb-3">Our Vision</h4>
              <p className="text-gray-700">
                To be the leading authority in evidence-informed healthcare decision-making, 
                contributing significantly to the achievement of Universal Health Coverage in Kenya.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Core Values Section Component
function ValuesSection() {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

//   const values = [
//     {
//       title: 'Evidence-Based',
//       description: 'We ground all our recommendations in robust scientific evidence, ensuring decisions are based on proven effectiveness and value.',
//       icon: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#1338BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//         </svg>
//       ),
//       color: 'from-[#1338BE]/20 to-[#1338BE]/5',
//       border: 'border-[#1338BE]',
//     },
//     {
//       title: 'Transparency',
//       description: 'We maintain openness in our methodologies and decision-making processes, fostering trust and accountability.',
//       icon: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#63C5DA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//         </svg>
//       ),
//       color: 'from-[#63C5DA]/20 to-[#63C5DA]/5',
//       border: 'border-[#63C5DA]',
//     },
//     {
//       title: 'Equity',
//       description: 'We prioritize fairness in access to healthcare, ensuring our recommendations benefit all Kenyans regardless of socioeconomic status.',
//       icon: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#1338BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
//         </svg>
//       ),
//       color: 'from-[#1338BE]/20 to-[#1338BE]/5',
//       border: 'border-[#1338BE]',
//     },
//     {
//       title: 'Collaboration',
//       description: 'We work closely with stakeholders across the healthcare ecosystem, ensuring diverse perspectives inform our assessments.',
//       icon: (
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#63C5DA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//         </svg>
//       ),
//       color: 'from-[#63C5DA]/20 to-[#63C5DA]/5',
//       border: 'border-[#63C5DA]',
//     },
//   ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold mb-6"
          >
            Our Core <span className="text-[#1338BE]">Values</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-20 h-1 bg-gradient-to-r from-[#63C5DA] to-[#1338BE] mx-auto mb-8"
          ></motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-700 text-lg"
          >
            Our values guide every assessment, recommendation, and interaction, 
            ensuring we remain focused on our mission to improve healthcare for all Kenyans.
          </motion.p>
        </motion.div>

        
        
        {/* <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className={`p-6 rounded-lg shadow-md bg-gradient-to-br ${value.color} border-b-4 ${value.border}`}
            >
              <div className="mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-700">{value.description}</p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </section>
  )
}

// Collaborative Partners Section Component
function PartnersSection() {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const partners = [
    {
      name: 'Ministry of Health',
      logo: '/images/partners/moh-logo.png',
    },

  ]

  return (
    <section className="py-12 ">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold mb-6"
          >
            Our <span className="text-[#1338BE]">Partners</span>
          </motion.h2>
          
          <motion.div 
            variants={itemVariants}
            className="w-20 h-1 bg-gradient-to-r from-[#63C5DA] to-[#1338BE] mx-auto mb-8"
          ></motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-700 text-lg"
          >
            We collaborate with leading institutions and organizations to strengthen 
            health technology assessment practices in Kenya and beyond.
          </motion.p>
        </motion.div>
        
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              variants={logoVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              className="flex items-center justify-center bg-white p-6 rounded-lg shadow-md"
            >
              <div className="relative h-20 w-full">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="text-center mt-12"
        >
          <Link href="/contact">
            <Button variant="outline" className="border-2 border-[#1338BE] text-[#1338BE] hover:bg-[#1338BE] hover:text-white px-8 py-2 rounded-md">
              Partner With Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}