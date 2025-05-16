'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutSection() {
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
    <section className="py-12 ">
      <div className="container mx-auto px-4">
        {/* <motion.div 
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          {/* <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About Us
          </h2> 
        </motion.div> */}

        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="relative h-72 md:h-96 w-full rounded-lg overflow-hidden shadow-xl">
              
              <div className="absolute inset-0 bg-gradient-to-br from-[#63C5DA]/10 to-[#1d8fc3]/10 z-10"></div>
              <Image
                src="/images/health-financing.jpeg" 
                alt="Sustainable Finance Strategies for Healthcare "
                fill
                style={{ objectFit: "cover" }}
                className="z-0"
              />
            </div>
          </motion.div>

          <motion.div 
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.h3 
              className="text-2xl font-semibold mb-4 text-[#020e3c]"
              variants={fadeIn}
            >
              The Health Benefits and Tariffs Advisory Panel
            </motion.h3>

            <motion.p 
              className="text-gray-700 mb-6"
              variants={fadeIn}
            >
              The Health Benefits and Tariffs Advisory Panel (HBTAP) is an initiative dedicated to promoting a transparent, evidence-informed approach to the operationalization of the Social Health Authority (SHA) program, while institutionalizing health technology assessment in Kenya.
            </motion.p>
            
            <motion.h4 
              className="text-xl font-medium mb-3 text-[#020e3c]"
              variants={fadeIn}
            >
              Our Main Objectives
            </motion.h4>
            
            <motion.ul variants={staggerChildren} className="space-y-3 mb-8">
              <motion.li 
                variants={fadeIn} 
                className="flex items-start gap-3"
              >
                <div className="mt-1.5 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>To review the Health Benefits and Tariffs Advisory Panel for the Social Health Authority (SHA) program</p>
              </motion.li>
              
              <motion.li 
                variants={fadeIn} 
                className="flex items-start gap-3"
              >
                <div className="mt-1.5 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>To advise on fair pricing and tariffs for healthcare services</p>
              </motion.li>
              
              <motion.li 
                variants={fadeIn} 
                className="flex items-start gap-3"
              >
                <div className="mt-1.5 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1d8fc3] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>To monitor the program for continuous improvement and sustainability</p>
              </motion.li>
            </motion.ul>
            
            <motion.div 
              variants={fadeIn}
              className="mt-8"
            >
              <Link href="/team">
                <Button className="bg-[#1d8fc3] hover:bg-[#63C5DA] text-white px-6 py-2 rounded-md">
                  Meet Our Team
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <h3 className="text-2xl font-semibold mb-8 text-center">
            Why <span className="text-[#020e3c]">Health Benefits and Tariffs Advisory Panel</span> Matters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md border-b-4 border-[#1d8fc3] hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 rounded-full bg-[#1d8fc3]/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#020e3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-3">Evidence-Based Decision Making</h4>
              <p className="text-gray-600">
                We ensure healthcare decisions are based on solid scientific evidence, maximizing benefits while minimizing risks and costs.
              </p>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md border-b-4 border-[#63C5DA] hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 rounded-full bg-[#63C5DA]/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#63C5DA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-3">Sustainable Healthcare Financing</h4>
              <p className="text-gray-600">
                We develop fair pricing strategies that balance quality healthcare delivery with financial sustainability for the SHA program.
              </p>
            </motion.div>
            
            {/* Card 3 */}
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md border-b-4 border-[#1d8fc3] hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 rounded-full bg-[#1d8fc3]/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#020e3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-3">Universal Health Coverage</h4>
              <p className="text-gray-600">
                Our work directly contributes to advancing Universal Health Coverage by ensuring appropriate healthcare technologies are accessible to all.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}