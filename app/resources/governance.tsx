'use client'

import { motion } from 'framer-motion'
import { 
  Building2, 
  Users, 
  Shield, 
  Target, 
  Heart, 
  ClipboardCheck, 
  MapPin,
  TrendingUp,
  FileText,
  UserCheck,
  Globe,
  Building,
  ShieldCheck,
  Gavel,
  Package
} from 'lucide-react'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'


export default function GovernanceClient() {
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

  const stakeholders = [
    {
      title: "Ministry of Health (MoH)",
      icon: <Building2 className="h-8 w-8 text-[#27aae1]" />,
      responsibilities: [
        "Lead the HTA process: Coordinate national efforts and ensure HTA is part of health policy and planning",
        "Set priorities for which technologies or interventions should be assessed",
        "Use HTA findings to inform decisions on what services to include in Kenya's Universal Health Coverage (UHC) package",
        "Support implementation through national guidelines, training, and monitoring",
        "Ensure transparency and fairness in the decision-making process"
      ]
    },

    {
      title: "County Governments",
      icon: <MapPin className="h-8 w-8 text-[#63C5DA]" />,
      responsibilities: [
        " Provide local data: Counties can provide important information about what works or doesn’t in their health facilities.",
        "Implement HTA recommendations: Make sure effective and affordable technologies are adopted at local health facilities.",
        "Help in engaging communities in discussions about health priorities."
      ]
    },


    {
      title: "Parliament and Policymakers",
      icon: <Heart className="h-8 w-8 text-[#27aae1]" />,
      responsibilities: [
        "Support HTA through legislation: Make laws or policies that ensure HTA is used in health planning.",
        "Allocate funding to support HTA processes and recommended interventions.",
        "Hold institutions accountable for using evidence in health decision-making"
      ]
    },

    {
      title: "Health Professionals and Health Facilities",
      icon: <TrendingUp className="h-8 w-8 text-[#63C5DA]" />,
      responsibilities: [
        "Share frontline experience: Doctors, nurses, and other health workers provide real-world evidence on how technologies perform.",
        "Participate in research and data collection to feed into HTA analysis.",
        "Apply HTA recommendations in service delivery (e.g., prescribing cost-effective medicines).",
        "Educate patients about recommended technologies or treatments.",
      ]
    },
    {
      title: "Patients and the General Public",
      icon: <Users className="h-8 w-8 text-[#27aae1]" />,
      responsibilities: [
        "Voice their needs and preferences: This helps ensure HTA considers what matters most to communities (e.g., access, cultural fit).",
        "Participate in public consultations about health priorities and HTA decisions.",
        "Advocate for fairness: Push for equal access to effective treatments, especially for vulnerable groups."
      ]
    },

    {
      title: "Researchers, Academia, and Technical Experts",
      icon: <UserCheck className="h-8 w-8 text-[#63C5DA]" />,
      responsibilities: [
        "Generate and analyze data: Carry out clinical studies, economic evaluations, and social impact assessments.",
        "Build evidence on which HTA decisions are based.",
        "Train others: Help build national and county-level capacity in HTA methods (e.g., cost-effectiveness analysis, data modeling).",
        "Advise decision-makers with independent, evidence-based input."
      ]
    },


  {
    title: "Medical Supplies and Procurement Agencies",
    icon: <Package className="h-8 w-8 text-[#27aae1]" />,
    responsibilities: [
      "Use HTA results to inform which products to buy and stock.",
      "Negotiate better prices for technologies shown to be effective and affordable.",
      "Ensure availability of recommended products in public health facilities."
    ]
  },

  {
    title: "Regulatory Bodies",
    icon: <Gavel className="h-8 w-8 text-[#63C5DA]" />,
    responsibilities: [
      "Ensure safety and quality: Before technologies are assessed for cost-effectiveness, regulators ensure they meet safety and performance standards.",
      "Work with HTA bodies to align approval and adoption timelines."
    ]
  },

  {
    title: "Health Insurers and SHA",
    icon: <ShieldCheck className="h-8 w-8 text-[#27aae1]" />,
    responsibilities: [
      " Use HTA evidence to determine what services to cover.",
      "Negotiate coverage plans based on what delivers the best value.",
      "Promote responsible use of resources by avoiding overuse of low-value treatments"
    ]
  },


  {
    title: "Private Sector and Industry (Pharmaceutical Companies, Device Manufacturers)",
    icon: <Building className="h-8 w-8 text-[#63C5DA]" />,
    responsibilities: [
      "Submit evidence on their products’ effectiveness, safety, and cost.",
      "Engage transparently with the HTA process without trying to influence decisions unfairly.",
      "Adapt business models: Set fair prices for technologies based on HTA recommendations and local needs."
    ]
  },

  {
    title: "Civil Society and Patient Advocacy Groups",
    icon: <Heart className="h-8 w-8 text-[#27aae1]" />,
    responsibilities: [
      "Watchdog role: Ensure the HTA process remains fair, participatory, and accountable.",
      "Educate communities about HTA and how decisions are made.",
      "Ensure equity by advocating for inclusion of marginalized groups."
    ]
  },

  {
    title: "Development Partners and International Organizations",
    icon: <Globe className="h-8 w-8 text-[#63C5DA]" />,
    responsibilities: [
      "Provide funding and technical support to build Kenya’s HTA systems and institutions.",
      "Support capacity-building for researchers and policymakers.",
      "Promote alignment with Kenya’s national priorities and avoid duplication of efforts."
    ]
  }


  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-[#27aae1]">Governance</span> of Health Technology Assessment
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#63C5DA] to-[#27aae1] mx-auto mb-6"></div>
            <p className="text-lg text-gray-700">
              Understanding the governance structure and stakeholder roles in Kenya's Health Technology Assessment process
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* What is HTA Section */}


      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stakeholder Roles and overall governance of the HTA.
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Successful HTA implementation requires collaboration among various stakeholders, each playing a crucial role in the process.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            {stakeholders.map((stakeholder, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    {stakeholder.icon}
                  </div>
                  <h3 className="text-2xl font-semibold">{stakeholder.title}</h3>
                </div>
                <ul className="space-y-3">
                  {stakeholder.responsibilities.map((responsibility, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-[#63C5DA] rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#63C5DA] text-black">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Together Towards Better Healthcare
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Effective governance and stakeholder collaboration are essential for successful Health Technology Assessment implementation in Kenya.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/resources" 
              className="px-8 py-3 bg-white text-[#27aae1] rounded-md hover:bg-gray-100 transition-colors"
            >
              Learn More
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-[#27aae1] transition-colors"
            >
              Get Involved
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}