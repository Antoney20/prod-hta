// 'use client'

// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import Image from 'next/image'

// import teamData from '../data/team.json'
// import { User } from 'lucide-react'
// import Navbar from '../components/layouts/navbar'

// interface TeamMember {
//   name: string
//   title: string
//   role: string
//   image: string

// }

// export default function TeamClient() {
//   const [members, setMembers] = useState<TeamMember[]>([])
  
//   useEffect(() => {
//     setMembers(teamData.members)
//   }, [])
  
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         staggerChildren: 0.1
//       } 
//     }
//   }
  
//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
//   }
  
//   return (
//     <main className="min-h-screen ">
//       <Navbar />
      

//       <section className="pt-32 pb-16 ">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center max-w-3xl mx-auto"
//           >
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">
//               Our Team
//             </h1>
//             <p className="text-gray-700 text-lg">
//               Meet the dedicated experts of the Benefits Package and Tariffs Advisory Panel working to advance evidence-based healthcare decision-making in Kenya.
//             </p>
//           </motion.div>
//         </div>
//       </section>
      

//       <section className="py-16 md:py-24">
//         <div className="container mx-auto px-4">
         
        
//           <motion.div 
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//             variants={containerVariants}
            
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.1 }}
//           >
//             {members.map((member, index) => (
//               <motion.div
//                 key={index}
//                 className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
//                 variants={itemVariants}
//               >
                

//               <div className="relative w-full h-64 md:h-80 rounded-md bg-white">
//                 {member.image ? (
//                   <Image
//                     src={member.image}
//                     alt={`Photo of ${member.title} ${member.name}`}
//                     fill
//                     className="object-contain object-center"
//                     sizes="(max-width: 640px) 100vw, 
//                           (max-width: 768px) 50vw, 
//                           (max-width: 1024px) 33vw, 
//                           (max-width: 1280px) 25vw, 
//                           (max-width: 1536px) 20vw, 
//                           300px"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gradient-to-br from-[#63C5DA]/30 to-[#1338BE]/30 flex items-center justify-center rounded-md">
//                     <User size={64} className="text-[#1338BE]/70" />
//                   </div>
//                 )}



//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
//                     <h3 className="text-xl font-bold text-white mb-1">
//                       {member.title && <span>{member.title} </span>}
//                       {member.name}
//                     </h3>
//                     <p className="text-white text-sm">{member.role}</p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>
//     </main>
//   )
// }




'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import teamData from '../data/team.json'
import { User } from 'lucide-react'
import Navbar from '../components/layouts/navbar'

interface TeamMember {
  name: string
  title: string
  role: string
  image: string
}

export default function TeamClient() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
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
    <>
      <Navbar />
      
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-white"></div>
        </div>
        
        <motion.div 
          style={{ opacity }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-4xl font-bold text-black mb-4 md:mb-6"
          >
            Our Team
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-black max-w-3xl mx-auto mb-8"
          >
            Meet the dedicated experts of the Benefits Package and Tariffs Advisory Panel working to advance evidence-based healthcare decision-making in Kenya.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a 
              href="#team-members" 
              className="inline-flex items-center bg-white text-blue-900 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Meet the Team
              <motion.svg 
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-2 w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </a>
          </motion.div>
        </motion.div>
      </section>

      <section id="team-members" className="py-16 md:py-24 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8"
          >
            {members.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group flex flex-col items-center"
              >
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
                      className="object-cover object-center"
                      priority={index < 8}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <User className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  {member.title && (
                    <p className="text-sm text-blue-900 font-semibold mb-1">
                      {member.title}
                    </p>
                  )}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 max-w-xs">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}