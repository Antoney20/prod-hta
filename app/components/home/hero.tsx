'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20">

      {/* <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/50 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-[#27aae1]/20 to-transparent rounded-tr-full"></div>
        </div> */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#63C5DA]/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-[#27aae1]/20 to-transparent rounded-tr-full pointer-events-none"></div>
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
              <span className="text-[#27aae1]">Towards advancing</span> <br />
            <span className=" lg:text-3xl font-bold text-black ml-6">   Universal Health Coverage</span> <br></br>
             < span className=" lg:text-2xl font-bold text-[#27aae1] ml-32"> in Kenya</span>
            </h1>
           
            <p className="text-gray-900 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 mt-16">
              The Health Benefits and Tariffs Advisory Panel is committed to promoting transparent, evidence-informed approaches to healthcare decision-making in Kenya. 
             
            </p>

            {/* <p className="text-gray-700 text-sm max-w-3xl mb-8">
               Fill the form below for general enquiries. To propose interventions, fill this form <Link className="" href= "/interventions-form"><Button
               
               className="bg-[#27aae1] hover:bg-[#63C5DA] text-white px-8 py-2 rounded-md text-base ml-4 mt-2"> get in touch <ArrowRight/> </Button> </Link>
            </p> */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/about">
                <Button className="bg-[#27aae1] hover:bg-[#63C5DA] text-white px-8 py-2 rounded-md text-base">
                  Learn More
                </Button>
              </Link>
              
            </div> */}
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-xl">
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#63C5DA]/20 to-[#27aae1]/20 z-10"></div>
              <Image
                src="/images/health-awareness.jpeg" 
                alt="HTA hero section image"
                fill
                style={{ objectFit: "cover" }}
                priority
                className="z-0"
              />
            </div>
          </motion.div>
        </div>
        

      </div>
    </section>
  )
}