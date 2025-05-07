'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

import teamData from '../data/team.json'
import { User } from 'lucide-react'
import Navbar from '../components/layouts/navbar'

interface TeamMember {
  name: string
  title: string
  role: string
  image: string
//   bio: string
}

export default function TeamClient() {
  const [members, setMembers] = useState<TeamMember[]>([])
  
  useEffect(() => {
    setMembers(teamData.members)
  }, [])
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  }
  
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-[#1338BE]">Team</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#63C5DA] to-[#1338BE] mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg">
              Meet the dedicated experts of the Benefits Package and Tariffs Advisory Panel working to advance evidence-based healthcare decision-making in Kenya.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
         
        
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {members.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                variants={itemVariants}
              >
                <div className="relative h-64 md:h-80">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={`Photo of ${member.title} ${member.name}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#63C5DA]/30 to-[#1338BE]/30 flex items-center justify-center">
                      <User size={64} className="text-[#1338BE]/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {member.title && <span>{member.title} </span>}
                      {member.name}
                    </h3>
                    <p className="text-white text-sm">{member.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}