'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import { Shield, TrendingUp, Heart, Users, Target, CheckCircle, Building2 } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
     
      <MissionSection />
       <WhatIsHTASection />
      {/* <ImpactSection /> */}
      <CTASection />
      <Footer/>
    </main>
  )
}


function WhatIsHTASection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What is <span className="text-[#020e3c]">HTA?</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Shield className="h-16 w-16 text-[#020e3c] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Health Technology Assessment</h3>
              <p className="text-gray-700 text-lg">
                Health Technology Assessment (HTA) is a systematic evaluation process that helps governments and health systems decide which healthcare interventions—medicines, medical devices, procedures, and programs—should be adopted based on their clinical effectiveness, cost-effectiveness, and social impact.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h3 className="text-2xl font-semibold mb-6">Why is HTA Important in Kenya?</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center mr-3">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">Ensures optimal use of limited healthcare resources</span>
              </div>
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center mr-3">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">Promotes equitable access to effective healthcare technologies</span>
              </div>
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center mr-3">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">Supports evidence-based decision making in healthcare policy</span>
              </div>
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center mr-3">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">Advances Universal Health Coverage by prioritizing cost-effective interventions</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


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
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-[#1d8fc3]/10 to-transparent rounded-tr-full"></div>
      </div>
      
      {/* Animated vertical lines */}
      <div className="hidden lg:block absolute left-8 md:left-12 top-1/4 h-auto">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '6rem' }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-24 w-0.5 bg-gradient-to-b from-[#1d8fc3] to-[#63C5DA]"
        ></motion.div>
        
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '8rem' }}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-32 w-0.5 bg-gradient-to-b from-[#63C5DA] to-[#1d8fc3] mt-8"
        ></motion.div>
        
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '6rem' }}
          transition={{ duration: 1, delay: 1.1 }}
          className="h-24 w-0.5 bg-gradient-to-b from-[#1d8fc3] to-[#63C5DA] mt-8"
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
            About <span className="text-[#020e3c]">Health Benefits and Tariffs Advisory Panel</span>
          </motion.h1>
          
      
          
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
            <Link href="/governance">
              <Button className="bg-[#1d8fc3] hover:bg-[#63C5DA] text-white px-8 py-6 rounded-md text-lg">
                Governance
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="border-2 border-[#1d8fc3] text-[#020e3c] hover:bg-[#1d8fc3] hover:text-white px-8 py-6 rounded-md text-lg">
                Learn More 
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


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
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#63C5DA]/10 to-[#1d8fc3]/10 z-10"></div>
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
                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-500 to-transparent p-6"
              >
                <h3 className="text-black text-xl font-semibold">Guided by Evidence</h3>
                <p className="text-black/90 text-sm">Our recommendations are based on rigorous scientific assessment</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="w-full lg:w-1/2 order-1 lg:order-2"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold mb-4"
            >
              Our <span className="text-[#020e3c]">Mission</span>
            </motion.h2>
            
          
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-700 text-lg mb-6"
            >
              We are dedicated to promoting a transparent, 
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
              className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1d8fc3]"
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

function ImpactSection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const impactAreas = [
    {
      icon: <TrendingUp className="h-12 w-12 text-[#020e3c]" />,
      title: "Economic Impact",
      description: "Optimizing healthcare spending by identifying cost-effective interventions that provide maximum value for money",
      stats: "35% improvement in resource allocation"
    },
    {
      icon: <Heart className="h-12 w-12 text-[#63C5DA]" />,
      title: "Patient Outcomes",
      description: "Ensuring Kenyans have access to proven, effective treatments that improve health outcomes and quality of life",
      stats: "500K+ lives impacted positively"
    },
    {
      icon: <Users className="h-12 w-12 text-[#020e3c]" />,
      title: "Healthcare Equity",
      description: "Promoting fair access to essential health technologies across all socio-economic groups",
      stats: "90% coverage in underserved areas"
    },
    {
      icon: <Target className="h-12 w-12 text-[#63C5DA]" />,
      title: "Policy Reform",
      description: "Informing evidence-based policy decisions that strengthen Kenya's healthcare system",
      stats: "20+ policies influenced"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-[#020e3c]">Impact</span>
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Through evidence-based assessment and strategic recommendations, we're transforming healthcare delivery in Kenya
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {impactAreas.map((area, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-6">{area.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{area.title}</h3>
              <p className="text-gray-700 mb-4">{area.description}</p>
              <div className="text-[#020e3c] font-bold text-lg">{area.stats}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-[#63C5DA] text-white">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Together Towards Better Healthcare
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Join us in our mission to make healthcare more accessible, equitable, and effective for all Kenyans through evidence-based assessment.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/resources" 
            className="px-8 py-3 bg-white text-[#020e3c] rounded-md hover:bg-gray-100 transition-colors"
          >
            Learn More
          </Link>
          <Link
            href="/contact" 
            className="px-8 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-[#020e3c] transition-colors"
          >
            Get Involved
          </Link>
        </div>
      </div>
    </section>
  )
}