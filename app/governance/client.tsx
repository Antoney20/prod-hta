

// 'use client'

// import { useEffect, useState } from 'react'
// import { motion, useScroll, useTransform } from 'framer-motion'
// import Image from 'next/image'
// import { User } from 'lucide-react'
// import Navbar from '../components/layouts/navbar'
// import Footer from '../components/layouts/footer'

// interface TeamMember {
//   name: string
//   title: string
//   role: string
//   image: string
//   from ?: string
// }

// interface PanelMember {
//   name: string
//   title: string
//   role: string
//   from ?: string
// }

// const panelMembers: PanelMember[] = [
//   { name: "Walter G. Jaoko", title: "Prof.", role: "Chairperson" ,  from: "KAVI - UoN"},
//   { name: "Patrick Amoth", title: "Dr.", role: "Member", from : "Director General for Health" },
//   { name: "Nehemiah Odera", title: "", role: "Member" ,  from :  "National Treasury"},
//   { name: "Margaret Macharia", title: "", role: "Member",  from : "SHA" },
//   { name: "Hajara El Busaidy", title: "Dr.", role: "Member", from : "Kwale County" },
//   { name: "Robert Rapando", title: "", role: "Member" , from: "CoG "},
//   {name : "Georgina Bonnet Arroyo", title:"", role: "member", from :"DPHK EX-Officio" },
//   { name: "Gabriel Muswali", title: "Dr.", role: "Member" , from : "HENNET" },
//   { name: "Mary Kigasia Amuyunzu-Nyamongo", title: "Dr.", role: "Member" , from : "NCD Alliance"},
//   { name: "Walter Oyamo Obita", title: "Dr.", role: "Member", from : "KHF" },
//   { name: "Valeria Makory", title: "Dr.", role: "Member" , from :"MoH"},
//   { name: "Stephen Kaboro", title: "", role: "Member" , from :"MoH"}
// ]





// const secretariatMembers: PanelMember[] = [
//   { name: "Francis Motiri, HSC", title: "", role: "Member" , from : "MoH" },
//   { name: "Christine Wambugu", title: "Dr.", role: "Member", from :"MoH" },
//   { name: "Tabitha Okech", title: "Dr.", role: "Member"  , from :"CEMA"},
//   { name: "Patricia Nyokabi", title: "Dr.", role: "Member" , from :"CEMA"},
//   { name: "Abdiaziz Abdikadir Ahmed", title: "Dr.", role: "Member" , from :"UoN"}
// ]

// const memberImages: Record<string, string> = {
//   "Walter G. Jaoko": "/images/team/Prof_Walter_Jaoko.jpg",
//   "Patrick Amoth": "/images/team/dr_amoth.jpeg",
//   "Nehemiah Odera": "/images/team/Mr. Nehemiah Odera Odero.JPG",
//   "Margaret Macharia": "/images/team/Margaret Macharia.jpeg",
//   "Hajara El Busaidy": "/images/team/Dr.Hajara png.png",
//   "Robert Rapando": "/images/team/Robert Rapando.jpg",
//   "Gabriel Muswali": "/images/team/Gabriel.jpeg",
//   "Mary Kigasia Amuyunzu-Nyamongo": "/images/team/Mary-Amuyunzu-Nyamongo.png",
//   "Walter Oyamo Obita": "/images/team/Walter Oyamo.jpg",
//   "Valeria Makory": "/images/team/Christine.jpg",
//    "Stephen Kaboro": "/images/team/Kaboro1.jpeg",
//   "Georgina Bonnet Arroyo": "",
//   // Secretariat Members
//   "Francis Motiri, HSC": "/images/team/Mosiria.jpeg", 
//   "Christine Wambugu": "",
//   "Tabitha Okech": "/images/team/Dr. Tabitha Okech.JPG",
//   "Patricia Nyokabi": "/images/team/Dr. Patricia Nyokabi.JPG",
//   "Abdiaziz Abdikadir Ahmed": "/images/team/Abdiaziz-Ahmed.jpg"
// };


// export default function TeamClient() {
//   const { scrollY } = useScroll()
//   const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
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
  
//   const MemberCard = ({ member }: { member: PanelMember }) => {
//     const image = memberImages[member.name]
    
//     return (
//       <motion.div
//         variants={itemVariants}
//         className="group flex flex-col items-center"
//       >
//         <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
//           {image ? (
//             <Image
//               src={image}
//               alt={member.name}
//               fill
//               sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
//               className="object-cover object-center"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center bg-blue-100">
//               <User className="w-16 h-16 sm:w-20 sm:h-20 text-[#27aae1]" />
//             </div>
//           )}
//         </div>
        
//         <div className="text-center">
//           {member.title && (
//             <p className="text-sm text-[#27aae1] font-semibold mb-1">
//               {member.title}
//             </p>
//           )}
//           <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
//             {member.name}
//           </h3>
//           <p className="text-sm md:text-base text-gray-700">
//             {member.role}
//           </p>
//            <p className="text-sm md:text-base  font-bold ">
//             {member.from}
//           </p>

//         </div>
//       </motion.div>
//     )
//   }
  
//   return (
//     <>
//       <Navbar />
      
//       <section className="relative mt-16 h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
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
//             Governance
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
//               href="#panel-members" 
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

//       {/* Panel Members Section The Benefits Package and Tariffs Advisory Panel */}
//       <section id="panel-members" className="py-16 md:py-24 bg-white">
//         <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               The Benefits Package and Tariffs Advisory Panel
//             </h2>
//           </div>

//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.1 }}
//             variants={containerVariants}
//             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-16"
//           >
//             {panelMembers.map((member, index) => (
//               <MemberCard key={index} member={member} />
//             ))}
//           </motion.div>

//           {/* Panel Mandate */}
//           <div className="max-w-4xl mx-auto mb-20">
//             <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
//               Mandate of the Panel
//             </h3>
//             <div className="bg-blue-50 rounded-lg p-8 shadow-md">
//               <h4 className="text-xl font-semibold text-gray-900 mb-4">
//                 Functions of the Benefits Package and Tariffs Advisory Panel:
//               </h4>
//               <ul className="space-y-3 text-gray-700">
//                 <li className="flex items-start">
//                   <span className="text-[#27aae1] mr-2">•</span>
//                   <span>To review and update the existing benefits package in accordance with the applicable health technology assessment</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-[#27aae1] mr-2">•</span>
//                   <span>To review and update the existing tariffs in accordance with the applicable health technology assessment</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-[#27aae1] mr-2">•</span>
//                   <span>To identify and define the health interventions that are not available in Kenya</span>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           {/* Secretariat Section */}
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Joint Secretariat
//             </h2>
//           </div>

//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.1 }}
//             variants={containerVariants}
//             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mb-16"
//           >
//             {secretariatMembers.map((member, index) => (
//               <MemberCard key={index} member={member} />
//             ))}
//           </motion.div>

//           {/* Secretariat Mandate */}
//           <div className="max-w-4xl mx-auto">
//             <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
//               Mandates of the Secretariat
//             </h3>
//             <div className="bg-green-50 rounded-lg p-8 shadow-md">
//               <p className="text-gray-700 text-lg">
//                 The secretariat, with expertise in medicine, health economics and epidemiology, shall provide technical assistance and secretarial support to the panel.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer/>
//     </>
//   )
// }



'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { User, Building2,  Users, Briefcase, Shield, ChevronDown, Loader2, Mail, Phone } from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'
import { Governance } from '@/types/dashboard/content'
import { getGovernanceMembers } from '../api/dashboard/content'

export default function TeamClient() {
  const [panelMembers, setPanelMembers] = useState<Governance[]>([])
  const [secretariatMembers, setSecretariatMembers] = useState<Governance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await getGovernanceMembers()
      const members = response.results || []
      
      // Adjusted filter to include all non-secretariat as potential panel (based on sample data where is_panel_member is false but roles suggest panel)
      // In production, ensure API sets is_panel_member correctly; this handles sample
      const potentialPanel = members.filter(m => !m.is_secretariat && !m.hide_profile && !m.deactivate_user)
      setPanelMembers(potentialPanel)
      setSecretariatMembers(members.filter(m => m.is_secretariat && !m.hide_profile && !m.deactivate_user))
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to format role naturally
  const formatRole = (role: string, title?: string, from?: string) => {
    const parts = []
    if (title) parts.push(title)
    if (role && role.toLowerCase() !== 'member') parts.push(role)
    if (from) parts.push(`from ${from}`)
    return parts.join(' ')
  }

  const MemberCard = ({ member, index }: { member: Governance; index: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: index * 0.05 }}
        className="group flex flex-col items-center p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200"
      >
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 ring-2 ring-transparent group-hover:ring-blue-200">
          {member.image ? (
            <Image
              src={member.image}
              alt={`${member.name}, ${member.role}`}
              fill
              sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, (max-width: 1024px) 160px, 176px"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-200">
              <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16  group-hover:text-blue-500 transition-colors" />
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2 flex-1">
            {(member.title || member.role) && (
                <p className="text-sm md:text-base font-medium">
                  {formatRole(member.role || '', member.title, undefined)}
                </p>
              )}
          <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
            {member.name}
          </h3>
          {member.title || member.role || member.from_organization ? (
            <div className="space-y-1">
            
              {member.from_organization && (
                <p className="text-xs md:text-sm text-gray-600 italic flex items-center justify-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {member.from_organization}
                </p>
              )}
            </div>
          ) : null}
          {member.description && (
            <p className="text-xs text-gray-500 leading-relaxed mt-2 px-2">
              {member.description}
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  const SectionHeader = ({ icon: Icon, label, title, subtitle, count }: { icon: any; label: string; title: string; subtitle?: string; count?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12 lg:mb-16"
    >
      <div className="inline-flex items-center gap-2.5  mb-4">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {subtitle.replace('{count}', count?.toString() || '')}
        </p>
      )}
    </motion.div>
  )

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="flex flex-col items-center"
          >
            <Loader2 className="w-10 h-10  mb-4" />
            <p className="text-gray-600">Loading our team...</p>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Panel Members Section */}
        <section id="panel-members" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              icon={Users}
              label="Leadership Circle"
              title="Benefits Package and Tariffs Advisory Panel"
              
              count={panelMembers.length}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-16">
              {panelMembers.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} />
              ))}
            </div>

            {/* Panel Mandate */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-3xl p-6 md:p-10 shadow-xl border border-blue-100/50">
                <div className="flex items-start gap-4 mb-8">
                 
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Mandate of the Panel
                    </h3>
                    <p className="text-gray-600">Guiding principles and core responsibilities</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-1 gap-4">
                  {[
                    {
                      num: 1,
                      text: 'Review and update the existing benefits package in accordance with the applicable health technology assessment'
                    },
                    {
                      num: 2,
                      text: 'Review and update the existing tariffs in accordance with the applicable health technology assessment'
                    },
                    {
                      num: 3,
                      text: 'Identify and define the health interventions that are not available in Kenya'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex items-start gap-4 bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-blue-200/50 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex-shrink-0 w-10 h-10  text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {item.num}
                      </div>
                      <p className="text-gray-700 leading-relaxed flex-1">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Secretariat Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              icon={Building2}
              label="Support Network"
              title="Joint Secretariat"
              subtitle={`${secretariatMembers.length} seasoned professionals delivering seamless technical and administrative excellence`}
              count={secretariatMembers.length}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {secretariatMembers.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} />
              ))}
            </div>

            {/* Secretariat Mandate */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl p-6 md:p-10 shadow-xl border border-green-100/50">
                <div className="flex items-start gap-4 mb-6">
                 
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Mandates of the Secretariat
                    </h3>
                    <p className="text-gray-600">Empowering the panel with specialized knowledge</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-base md:text-lg text-gray-700 leading-relaxed bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-200/50"
                  >
                    The secretariat brings deep expertise in medicine, health economics, and epidemiology to provide essential technical assistance and secretarial support to the panel—ensuring every decision is informed, efficient, and impactful.
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}