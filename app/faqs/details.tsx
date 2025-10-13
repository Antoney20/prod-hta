// 'use client'

// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'
// import faqsData from '../data/faqs.json'

// export default function FAQsSection() {
//   const [openIndex, setOpenIndex] = useState<number | null>(null)
  
//   const toggleFAQ = (index: number) => {
//     setOpenIndex(openIndex === index ? null : index)
//   }
  
//   return (
//     <section className="py-20 md:py-24 bg-white">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4">
//             Frequently Asked Questions
//           </h2>
//           <p className="text-gray-700 text-lg max-w-3xl mx-auto">
//             Find answers to common questions about the Benefits Package and Tariffs Advisory Panel.
//           </p>
//         </div>
        
//         <div className="grid grid-cols-1 gap-4 md:gap-6">
//           {faqsData.faqs.map((faq, index) => (
//             <FAQItem 
//               key={faq.id}
//               question={faq.question}
//               answer={faq.answer}
//               isOpen={openIndex === index}
//               toggleOpen={() => toggleFAQ(index)}
//             />
//           ))}
//         </div>
        
//       </div>
//     </section>
//   )
// }

// interface FAQItemProps {
//   question: string
//   answer: string
//   isOpen: boolean
//   toggleOpen: () => void
// }

// function FAQItem({ question, answer, isOpen, toggleOpen }: FAQItemProps) {
//   return (
//     <motion.div 
//       className={`border rounded-lg overflow-hidden transition-all duration-300 ${
//         isOpen ? 'shadow-md border-[#1d8fc3]' : 'border-gray-200 hover:border-gray-300'
//       }`}
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <button
//         className="flex justify-between items-center w-full p-6 text-left"
//         onClick={toggleOpen}
//         aria-expanded={isOpen}
//       >
//         <h3 className="text-lg font-semibold pr-8">{question}</h3>
//         <div className={`flex-shrink-0 p-2 rounded-full transition-colors ${
//           isOpen ? 'bg-[#1d8fc3]/10 text-[#1d8fc3]' : 'bg-gray-100 text-gray-500'
//         }`}>
//           {isOpen ? <Minus size={16} /> : <Plus size={16} />}
//         </div>
//       </button>
      
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden"
//           >
//             <div className="p-6 pt-0 text-gray-600 border-t border-gray-100">

//               <div dangerouslySetInnerHTML={{ __html: answer }} />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { FAQ } from '@/types/dashboard/content'
import { getFAQs } from '../api/dashboard/content'

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchFAQs()
  }, [])
  
  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await getFAQs()
      setFaqs(response.results || [])
    } catch (err) {
      setError('Failed to load FAQs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  
  if (loading) {
    return (
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1d8fc3]" />
          </div>
        </div>
      </section>
    )
  }
  
  if (error) {
    return (
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Find answers to common questions about the Benefits Package and Tariffs Advisory Panel.
          </p>
        </div>
        
        {faqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No FAQs available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                toggleOpen={() => toggleFAQ(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  toggleOpen: () => void
}

function FAQItem({ question, answer, isOpen, toggleOpen }: FAQItemProps) {
  return (
    <motion.div 
      className={`border rounded-lg overflow-hidden transition-all duration-300 ${
        isOpen ? 'shadow-md border-[#1d8fc3]' : 'border-gray-200 hover:border-gray-300'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        className="flex justify-between items-center w-full p-6 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold pr-8">{question}</h3>
        <div className={`flex-shrink-0 p-2 rounded-full transition-colors ${
          isOpen ? 'bg-[#1d8fc3]/10 text-[#1d8fc3]' : 'bg-gray-100 text-gray-500'
        }`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-gray-600 border-t border-gray-100">
              <div dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}