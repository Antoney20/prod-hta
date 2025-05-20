// 'use client'

// import { useEffect, useState } from 'react'
// import { motion, useScroll, useTransform } from 'framer-motion'
// import Image from 'next/image'
// import teamData from '../data/team.json'
// import { User } from 'lucide-react'
// import Navbar from '../components/layouts/navbar'
// import Footer from '../components/layouts/footer'

// interface TeamMember {
//   name: string
//   title: string
//   role: string
//   image: string
// }

// export default function TeamClient() {
//   const [members, setMembers] = useState<TeamMember[]>([])
//   const { scrollY } = useScroll()
//   const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
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
//     <>
//       <Navbar />
      
//       <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <div className="absolute inset-0 bg-white"></div>
//         </div>
        
//         <motion.div 
//           style={{ opacity }}
//           className="relative z-10 text-center px-6 max-w-4xl mx-auto"
//         >
//           <motion.h1 
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="text-4xl lg:text-4xl font-bold text-black mb-4 md:mb-6"
//           >
//             Our Team
//           </motion.h1>
//           <motion.p 
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="text-lg md:text-xl lg:text-2xl text-black max-w-3xl mx-auto mb-8"
//           >
//             Meet the dedicated experts of the Benefits Package and Tariffs Advisory Panel working to advance evidence-based healthcare decision-making in Kenya.
//           </motion.p>
//           <motion.div
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//           >
//             <a 
//               href="#team-members" 
//               className="inline-flex items-center bg-white text-[#27aae1] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors"
//             >
//               Meet the Team
//               <motion.svg 
//                 animate={{ y: [0, 5, 0] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//                 className="ml-2 w-5 h-5" 
//                 fill="none" 
//                 viewBox="0 0 24 24" 
//                 stroke="currentColor"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </motion.svg>
//             </a>
//           </motion.div>
//         </motion.div>
//       </section>

//       <section id="team-members" className="py-16 md:py-24 bg-white">
//         <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.1 }}
//             variants={containerVariants}
//             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8"
//           >
//             {members.map((member, index) => (
//               <motion.div
//                 key={index}
//                 variants={itemVariants}
//                 className="group flex flex-col items-center"
//               >
//                 <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
//                   {member.image ? (
//                     <Image
//                       src={member.image}
//                       alt={member.name}
//                       fill
//                       sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
//                       className="object-cover object-center"
//                       priority={index < 8}
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-blue-100">
//                       <User className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="text-center">
//                   {member.title && (
//                     <p className="text-sm text-[#27aae1] font-semibold mb-1">
//                       {member.title}
//                     </p>
//                   )}
//                   <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
//                     {member.name}
//                   </h3>
//                   <p className="text-sm md:text-base text-gray-700 max-w-xs">
//                     {member.role}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       <Footer/>
//     </>
//   )
// }



'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { User } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

interface TeamMember {
  name: string
  title: string
  role: string
  image: string
}

interface PanelMember {
  name: string
  title: string
  role: string
}

const panelMembers: PanelMember[] = [
  { name: "Walter G. Jaoko", title: "Prof.", role: "Chairperson" },
  { name: "Patrick Amoth", title: "Dr.", role: "Member" },
  { name: "Nehemiah Odera", title: "", role: "Member" },
  { name: "Margaret Macharia", title: "", role: "Member" },
  { name: "Hajara El Busaidy", title: "Dr.", role: "Member" },
  { name: "Robert Rapando", title: "", role: "Member" },
  { name: "Gabriel Muswali", title: "Dr.", role: "Member" },
  { name: "Mary Kigasia Amuyunzu-Nyamongo", title: "Dr.", role: "Member" },
  { name: "Walter Oyamo Obita", title: "Dr.", role: "Member" },
  { name: "Valeria Makory", title: "Dr.", role: "Member" },
  { name: "Stephen Kaboro", title: "", role: "Member" }
]

const secretariatMembers: PanelMember[] = [
  { name: "Francis Motiri", title: "", role: "Member" },
  { name: "Christine Wambugu", title: "Dr.", role: "Member" },
  { name: "Tabitha Okech", title: "Dr.", role: "Member" },
  { name: "Patricia Nyokabi", title: "Dr.", role: "Member" },
  { name: "Abdiaziz Abdikadir Ahmed", title: "Dr.", role: "Member" }
]

const memberImages: Record<string, string> = {
  "Walter G. Jaoko": "/images/team/Prof_Walter_Jaoko.jpg",
  "Patrick Amoth": "/images/team/dr_amoth.jpeg",
  // "Nehemiah Odera": "/images/team/nehemiah-odera.jpg",
  // "Christine Wambugu": "/images/team/christine-wambugu.jpg",
  "Tabitha Okech": "/images/team/Dr. Tabitha Okech.JPG",
  "Patricia Nyokabi": "/images/team/Dr. Patricia Nyokabi.JPG",
  "Abdiaziz Abdikadir Ahmed": "/images/team/Abdiaziz-Ahmed.jpg",
  "Mary Kigasia Amuyunzu-Nyamongo": "/images/team/Mary-Amuyunzu-Nyamongo.png",
  "Robert Rapando" :"/images/team/Robert Rapando.jpg"
}

export default function TeamClient() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
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
  
  const MemberCard = ({ member }: { member: PanelMember }) => {
    const image = memberImages[member.name]
    
    return (
      <motion.div
        variants={itemVariants}
        className="group flex flex-col items-center"
      >
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
          {image ? (
            <Image
              src={image}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100">
              <User className="w-16 h-16 sm:w-20 sm:h-20 text-[#27aae1]" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          {member.title && (
            <p className="text-sm text-[#27aae1] font-semibold mb-1">
              {member.title}
            </p>
          )}
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            {member.name}
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            {member.role}
          </p>
        </div>
      </motion.div>
    )
  }
  
  return (
    <>
      <Navbar />
      
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
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
            Governance
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-black max-w-3xl mx-auto mb-8"
          >
            Meet the dedicated experts of the Health Benefits and Tariffs Advisory Panel working to advance evidence-based healthcare decision-making in Kenya.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a 
              href="#panel-members" 
              className="inline-flex items-center bg-white text-[#27aae1] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors"
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

      {/* Panel Members Section Health Benefits and Tariffs Advisory Panel */}
      <section id="panel-members" className="py-16 md:py-24 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              THE HEALTH BENEFITS AND TARIFFS ADVISORY PANEL
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-16"
          >
            {panelMembers.map((member, index) => (
              <MemberCard key={index} member={member} />
            ))}
          </motion.div>

          {/* Panel Mandate */}
          <div className="max-w-4xl mx-auto mb-20">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              Mandate of the Panel
            </h3>
            <div className="bg-blue-50 rounded-lg p-8 shadow-md">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Functions of the Health Benefits  and Tariffs Advisory Panel:
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#27aae1] mr-2">•</span>
                  <span>To review and update the existing benefits package in accordance with the applicable health technology assessment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#27aae1] mr-2">•</span>
                  <span>To review and update the existing tariffs in accordance with the applicable health technology assessment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#27aae1] mr-2">•</span>
                  <span>To identify and define the health interventions that are not available in Kenya</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Secretariat Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Joint Secretariat
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-16"
          >
            {secretariatMembers.map((member, index) => (
              <MemberCard key={index} member={member} />
            ))}
          </motion.div>

          {/* Secretariat Mandate */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              Mandates of the Secretariat
            </h3>
            <div className="bg-green-50 rounded-lg p-8 shadow-md">
              <p className="text-gray-700 text-lg">
                The secretariat, with expertise in medicine, health economics and epidemiology, shall provide technical assistance and secretarial support to the panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </>
  )
}