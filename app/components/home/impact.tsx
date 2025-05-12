'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HTAImpactSection() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <motion.div 
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div
              variants={fadeIn}
              className="relative mb-5"
            >
              <div className="absolute left-0 top-0 h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full w-0.5 bg-gradient-to-b from-[#1338BE] to-[#63C5DA] hidden lg:block"
                ></motion.div>
              </div>
              <h3 className="text-2xl font-semibold pl-5 text-[#1338BE]">Our Impact on Healthcare</h3>
            </motion.div>

            <motion.p 
              className="text-gray-700 mb-5 lg:pl-5"
              variants={fadeIn}
            >
              Health Technology Assessment provides critical insights that shape healthcare policy, 
              ensuring resources are allocated to interventions that deliver the greatest value and benefit to patients.
            </motion.p>
            
            <motion.div
              variants={fadeIn}
              className="bg-gray-50 p-5 rounded-md border-b-2 border-[#63C5DA] mb-6 lg:ml-5"
            >
              <h4 className="font-medium text-gray-900 mb-2">Key Achievements</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#1338BE]"></div>
                <p>SuccessfulL impact on overall ....</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#63C5DA]"></div>
                <p>Contributed to reduction of .....</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-[#1338BE]"></div>
                <p>Contributed to......</p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="lg:pl-5"
            >
              <Link href="/resources">
                <Button className="bg-white hover:bg-gray-50 text-[#1338BE] border border-[#1338BE] group px-6">
                  Explore More About 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="relative">
              <div className="relative h-80 md:h-90 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/health-financing.jpeg" 
                  alt="Sustainable Finance Strategies for Healthcare "
                  fill
                  // style={{ objectFit: "cover" }}
                  className="z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1338BE]/20 to-transparent"></div>
              </div>
              
              {/* float */}
              <motion.div 
                className="absolute -bottom-10 -left-5 md:left-5 bg-white p-4 rounded-md shadow-lg border-l-4 border-[#1338BE] max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold text-[#1338BE] text-lg">Data-Driven Decisions</h4>
                <p className="text-sm text-gray-600">
                  Through systematic evaluation, we've helped implement cost-effective healthcare interventions reaching over 5 million Kenyans.
                </p>
              </motion.div>
              
              {/* Top-right decorative element */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#63C5DA]/10 rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}