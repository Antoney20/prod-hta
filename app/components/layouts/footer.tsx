// 'use client'

// import { ArrowUpRight, Linkedin, Mail, MapPin, Phone, Twitter, Send, Youtube } from 'lucide-react'
// import Link from 'next/link'
// import { useState } from 'react'
// import Image from 'next/image'

// export default function Footer() {
//   const [email, setEmail] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [subscriptionMessage, setSubscriptionMessage] = useState('')

//   const handleSubscribe = (e: { preventDefault: () => void }) => {
//     e.preventDefault()
//     setIsSubmitting(true)
    
//     setTimeout(() => {
//       setIsSubmitting(false)
//       setSubscriptionMessage('Thank you for subscribing to our newsletter!')
//       setEmail('')
      
//       setTimeout(() => {
//         setSubscriptionMessage('')
//       }, 5000)
//     }, 1000)
//   }

//   return (
//     <footer className="bg-black text-white pt-16 pb-8" aria-labelledby="footer-heading">
//       <h2 id="footer-heading" className="sr-only">Footer</h2>
//       <div className="container mx-auto px-4 base:px-6 lg:px-8 ">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 pb-8 border-b border-gray-800">

//           <div className="lg:col-span-3 mb-10 lg:mb-0">
//             {/* <div className="flex items-center mb-6">
//               <div className="mr-3">
//                 <span className="text-2xl font-bold">
//                   <span className="text-white">Health  Technology assessment</span>
                 
//                 </span>
//               </div>
//             </div> */}
//             <p className="text-gray-300 text-base leading-relaxed mb-6">
//               <b>The The Benefits Package and Tariffs Advisory Panel</b><br />
//               <i>Towards advancing Universal Health Coverage</i><br />
            
//             </p>
//             <div className="flex space-x-4">
//               <a
//                 href="#"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300"
//                 aria-label="Follow HealthTA on Twitter"
//               >
//                 <span className="sr-only">Twitter</span>
//                 <Twitter size={20} aria-hidden="true" />
//               </a> 
//               <a
//                 href="#"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300"
//                 aria-label="Connect with HealthTA on LinkedIn"
//               >
//                 <span className="sr-only">LinkedIn</span>
//                 <Linkedin size={20} aria-hidden="true" />
//               </a>
//               <a
//                 href="#"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300"
//                 aria-label="Follow HealthTA on YouTube"
//               >
//                 <span className="sr-only">YouTube</span>
//                 <Youtube size={20} aria-hidden="true" />
//               </a>
//             </div>
//           </div>

//           <div className="lg:col-span-3 mb-2 lg:mb-0">
//             <h3 className="text-lg font-semibold mb-6 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 ">
//               Quick Links
//             </h3>
//             <ul className="space-y-2" aria-label="Quick navigation links">
//               <li>
//                 <Link href="/about-us" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
//                   <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
//                   About Us
//                 </Link>
//               </li>
             
//               <li>
//                 <Link href="/governance" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
//                   <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
//                   Governance
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/resources" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
//                   <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
//                   Resources
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/news" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
//                   <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
//                   News & Updates
//                 </Link>
//               </li>
//             </ul>
//           </div>

        

//           <div className="lg:col-span-3">
//             <h3 className="text-lg font-semibold mb-6 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1">
//               Contact Us
//             </h3>
//             <ul className="space-y-4" aria-label="Contact information">
//               <li className="flex items-start">
//                 <MapPin size={20} className="text-[#63C5DA] mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
//                 <span className="text-gray-300 text-base">
//                   The Benefits Package and Tariffs Advisory Panel<br />
//                   The University of Nairobi<br />
//                   Nairobi, Kenya
//                 </span>
//               </li>
//               <li className="flex items-center">
//                 <Mail size={20} className="text-[#63C5DA] mr-3 flex-shrink-0" aria-hidden="true" />
//                 <a href="#" className="text-gray-300 text-base hover:text-[#63C5DA] transition-colors duration-300" aria-label="Email HealthTA at hbtap@uonbi.ac.ke">
//                   hbtap@uonbi.ac.ke
//                 </a>
//               </li>
//               <li className="flex items-center">
//                 <Phone size={20} className="text-[#63C5DA] mr-3 flex-shrink-0" aria-hidden="true" />
//                 <a href="#" className="text-gray-300 text-base hover:text-[#63C5DA] transition-colors duration-300" aria-label="Call HealthTA">
//                   Coming soon
//                 </a>
//               </li>
//             </ul>
//             <div className="mt-6">
//               <Link href="/contact" className="text-[#63C5DA] hover:font-bold transition-colors duration-300 text-base flex items-center">
//                 <ArrowUpRight size={16} className="mr-2" aria-hidden="true" />
//                 Have questions? Reach out to us
//               </Link>
//             </div>
//           </div>
//           <div className="lg:col-span-3 w-full ml-auto">
//             <h3 className="text-lg font-semibold mb-4 text-white relative pl-4 ">
//               Newsletter
//             </h3>
//             <p className="text-white text-base mb-4">
//               Sign up to our newsletter for the latest news, updates and events.
//             </p>
            
//             <form onSubmit={handleSubscribe} className="space-y-3">
//               <div className="flex">
//                 <label htmlFor="email-address" className="sr-only">Email address</label>
//                 <input
//                   id="email-address"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   className="w-full min-w-0 bg-gray-600 border-0 py-2 px-4 text-white placeholder-gray-100 focus:ring-2 focus:ring-[#63C5DA] rounded-l-md"
//                   placeholder="Email address"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   aria-label="Enter your email address"
//                 />
//                 <button
//                   type="submit"
//                   className="flex-shrink-0 bg-white hover:bg-[#63C5DA] border-0 py-2 px-4 rounded-r-md text-black focus:ring-2 focus:ring-offset-2 transition-colors duration-300 flex items-center"
//                   disabled={isSubmitting}
//                   aria-label="Subscribe to newsletter"
//                 >
//                   {isSubmitting ? 'Sending...' : <Send size={18} />}
//                 </button>
//               </div>
              
//               {subscriptionMessage && (
//                 <p className="text-green-400 text-base">{subscriptionMessage}</p>
//               )}
              
//               <p className="text-gray-50 text-xs">
//                 You will receive regular updates about our work and can unsubscribe at any time by clicking the unsubscribe link in each email, or by contacting hbtap@uonbi.ac.ke For more information see our <Link href="/privacy-policy" className="text-gray-300 hover:text-[#63C5DA] underline">privacy policy</Link>.
//               </p>
//             </form>
//           </div>
//         </div>

//         <div className="pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
//           <div className="text-gray-300 text-base mb-4 md:mb-0">
//             © 2025 The Benefits Package and Tariffs Advisory Panel. All rights reserved.
//           </div>
       
//             <span className="text-white mr-2"> The University of Nairobi</span> 
//           {/* </a> */}
//         </div>
//       </div>
//     </footer>
//   )
// }

'use client'

import { ArrowUpRight, Linkedin, Mail, MapPin, Phone, Twitter, Send, Youtube } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')

  const handleSubscribe = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setSubscriptionMessage('Thank you for subscribing to our newsletter!')
      setEmail('')
      
      setTimeout(() => {
        setSubscriptionMessage('')
      }, 5000)
    }, 1000)
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-16 pb-8 relative overflow-hidden" aria-labelledby="footer-heading">
    
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container mx-auto px-4 base:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-700/50">

          <div className="lg:col-span-3 mb-10 lg:mb-0">
           
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                The Benefits Package and Tariffs Advisory Panel
              </h3>
              <p className="text-white text-lg italic leading-relaxed">
                Towards advancing Universal Health Coverage
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700/50 hover:bg-[#27aae1] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Follow on Twitter"
              >
                <Twitter size={18} />
              </a> 
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700/50 hover:bg-[#27aae1] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700/50 hover:bg-[#27aae1] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Follow on YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

        
          <div className="lg:col-span-3 mb-8 lg:mb-0">
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
              
              Quick Links
            </h3>
            <ul className="space-y-3" aria-label="Quick navigation links">
              <li>
                <Link href="/about-us" className="text-white hover:font-bold transition-all duration-300 flex items-center group text-base">
                  <ArrowUpRight size={14} className="mr-3 text-[#27aae1] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/governance" className="text-white hover:font-bold transition-all duration-300 flex items-center group text-base">
                  <ArrowUpRight size={14} className="mr-3 text-[#27aae1] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  Governance
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-white hover:font-bold transition-all duration-300 flex items-center group text-base">
                  <ArrowUpRight size={14} className="mr-3 text-[#27aae1] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-white hover:font-bold transition-all duration-300 flex items-center group text-base">
                  <ArrowUpRight size={14} className="mr-3 text-[#27aae1] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  News & Updates
                </Link>
              </li>
              <li>
                <Link href="/media-center" className="text-white hover:font-bold transition-all duration-300 flex items-center group text-base">
                  <ArrowUpRight size={14} className="mr-3 text-[#27aae1] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  Media Center
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 mb-8 lg:mb-0">
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
              Contact Us
            </h3>
            <ul className="space-y-4" aria-label="Contact information">
              <li className="flex items-start group">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center mr-3 mt-0.5 group-hover:bg-[#27aae1]/20 transition-colors">
                  <MapPin size={16} className="text-[#27aae1]" />
                </div>
                <div>
                  <p className="text-white text-base leading-relaxed">
                    The Benefits Package and Tariffs Advisory Panel<br />
                    <span className="">The University of Nairobi</span><br />
                    <span className="">Nairobi, Kenya</span>
                  </p>
                </div>
              </li>
              <li className="flex items-center group">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#27aae1]/20 transition-colors">
                  <Mail size={16} className="text-[#27aae1]" />
                </div>
                <a href="mailto:hbtap@uonbi.ac.ke" className="text-white text-base hover:font-bold transition-colors duration-300">
                  hbtap@uonbi.ac.ke
                </a>
              </li>
              <li className="flex items-center group">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#27aae1]/20 transition-colors">
                  <Phone size={16} className="text-[#27aae1]" />
                </div>
                <span className="text-base">
                  Coming soon
                </span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/contact" className="inline-flex items-center text-[#27aae1] hover:font-bold transition-colors duration-300 text-base group">
                <ArrowUpRight size={14} className="mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Have questions? Reach out to us
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
             
              Newsletter
            </h3>
            <p className="text-white text-base mb-6 leading-relaxed">
              Stay updated with the latest news, updates, and events from our health initiatives.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <div className="flex rounded-xl overflow-hidden shadow-lg">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="flex-1 bg-slate-700/50 border-0 py-3 px-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#27aae1] focus:outline-none backdrop-blur-base"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#27aae1] to-[#1e8a99] hover:from-[#1e8a99] hover:to-[#27aae1] px-6 py-3 text-white transition-all duration-300 flex items-center justify-center disabled:opacity-50 hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
              
              {subscriptionMessage && (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-base">{subscriptionMessage}</p>
                </div>
              )}
              
              <p className=" text-md leading-relaxed">
                You will receive regular updates about our work and can unsubscribe at any time by clicking the unsubscribe link in each email, or by contacting{' '}
                <a href="mailto:hbtap@uonbi.ac.ke" className="text-[#27aae1] hover:font-bold underline">
                  hbtap@uonbi.ac.ke
                </a>.
                {/* . For more information see our{' '}
                <Link href="/privacy-policy" className="text-[#27aae1] hover:font-bold underline">
                  privacy policy
                </Link>. */}
              </p>
            </form>
          </div>
        </div>

    
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className=" text-base">
            © 2025 The Benefits Package and Tariffs Advisory Panel. All rights reserved.
          </div>
          <div className="flex items-center space-x-3">
          
            <span className="text-white text-base font-medium">The University of Nairobi</span>
          </div>
        </div>
      </div>
    </footer>
  )
}