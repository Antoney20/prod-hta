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
    <footer className="bg-black text-white pt-16 pb-8" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 pb-8 border-b border-gray-800">

          <div className="lg:col-span-3 mb-10 lg:mb-0">
            {/* <div className="flex items-center mb-6">
              <div className="mr-3">
                <span className="text-2xl font-bold">
                  <span className="text-white">Health  Technology assessment</span>
                 
                </span>
              </div>
            </div> */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              <b>The Health Benefits and Tariffs Advisory Panel</b><br />
              <i>Towards advancing Universal Health Coverage</i><br />
              Promoting transparent, evidence-informed approaches to healthcare decision-making through the Social Health Authority program, while institutionalizing health technology assessment in Kenya.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300"
                aria-label="Follow HealthTA on Twitter"
              >
                <span className="sr-only">Twitter</span>
                <Twitter size={20} aria-hidden="true" />
              </a> 
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300"
                aria-label="Connect with HealthTA on LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300"
                aria-label="Follow HealthTA on YouTube"
              >
                <span className="sr-only">YouTube</span>
                <Youtube size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 mb-2 lg:mb-0">
            <h3 className="text-lg font-semibold mb-6 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 ">
              Quick Links
            </h3>
            <ul className="space-y-2" aria-label="Quick navigation links">
              <li>
                <Link href="/about-us" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  About Us
                </Link>
              </li>
             
              <li>
                <Link href="/governance" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  Governance
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  News & Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* <div className="lg:col-span-2 mb-10 lg:mb-0">
            <h3 className="text-lg font-semibold mb-6 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#1338BE]">
              Services
            </h3>
            <ul className="space-y-3" aria-label="Services links">
              <li>
                <Link
                  href="/services/health-benefits-package"
                  className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group"
                >
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  Health Benefits Package
                </Link>
              </li>
              <li>
                <Link
                  href="/services/pricing-tariffs"
                  className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group"
                >
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  Pricing & Tariffs
                </Link>
              </li>
              <li>
                <Link href="/services/program-monitoring" className="text-gray-300 hover:text-[#63C5DA] transition-colors duration-300 flex items-center group">
                  <ArrowUpRight size={16} className="mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  Program Monitoring
                </Link>
              </li>
            </ul>
          </div> */}

          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-6 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1">
              Contact Us
            </h3>
            <ul className="space-y-4" aria-label="Contact information">
              <li className="flex items-start">
                <MapPin size={20} className="text-[#63C5DA] mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-300 text-sm">
                  Health Benefits and Tariffs Advisory Panel<br />
                  The University of Nairobi<br />
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-[#63C5DA] mr-3 flex-shrink-0" aria-hidden="true" />
                <a href="#" className="text-gray-300 text-sm hover:text-[#63C5DA] transition-colors duration-300" aria-label="Email HealthTA at hbtap@uonbi.ac.ke">
                  hbtap@uonbi.ac.ke
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-[#63C5DA] mr-3 flex-shrink-0" aria-hidden="true" />
                <a href="#" className="text-gray-300 text-sm hover:text-[#63C5DA] transition-colors duration-300" aria-label="Call HealthTA">
                  Coming soon
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/contact" className="text-[#63C5DA] hover:text-white transition-colors duration-300 text-sm flex items-center">
                <ArrowUpRight size={16} className="mr-2" aria-hidden="true" />
                Have questions? Reach out to us
              </Link>
            </div>
          </div>
          <div className="lg:col-span-3 w-full ml-auto">
            <h3 className="text-lg font-semibold mb-4 text-white relative pl-4 ">
              Newsletter
            </h3>
            <p className="text-white text-sm mb-4">
              Sign up to our newsletter for the latest news, updates and events.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex">
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 bg-gray-600 border-0 py-2 px-4 text-white placeholder-gray-100 focus:ring-2 focus:ring-[#63C5DA] rounded-l-md"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Enter your email address"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 bg-white hover:bg-[#63C5DA] border-0 py-2 px-4 rounded-r-md text-black focus:ring-2 focus:ring-offset-2 transition-colors duration-300 flex items-center"
                  disabled={isSubmitting}
                  aria-label="Subscribe to newsletter"
                >
                  {isSubmitting ? 'Sending...' : <Send size={18} />}
                </button>
              </div>
              
              {subscriptionMessage && (
                <p className="text-green-400 text-sm">{subscriptionMessage}</p>
              )}
              
              <p className="text-gray-50 text-xs">
                You will receive regular updates about our work and can unsubscribe at any time by clicking the unsubscribe link in each email, or by contacting hbtap@uonbi.ac.ke For more information see our <Link href="/privacy-policy" className="text-gray-300 hover:text-[#63C5DA] underline">privacy policy</Link>.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm mb-4 md:mb-0">
            © 2025 Health Benefits and Tariffs Advisory Panel. All rights reserved.
          </div>
          {/* <a 
            href="https://cema-africa.uonbi.ac.ke/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#63C5DA] flex items-center transition-colors duration-300"
            aria-label="Visit CEMA website"
          > */}
            <span className="text-white mr-2"> The University of Nairobi</span> 
          {/* </a> */}
        </div>
      </div>
    </footer>
  )
}