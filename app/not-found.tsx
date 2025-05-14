'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, HelpCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from './components/layouts/navbar'


export default function NotFound() {
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="relative mb-8">
            <div className="text-[180px] font-bold text-gray-100 leading-none select-none">404</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-8">Loading...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="text-3xl font-bold">
              <span className="text-[#1338BE]">Health</span>
              <span className="text-[#63C5DA]">TA</span>
            </div>
          </motion.div>
          
          {/* 404 Display */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <div className="text-[180px] font-bold text-gray-100 leading-none select-none">
              404
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#63C5DA] to-[#1338BE] opacity-20"></div>
            </motion.div>
          </motion.div>
          
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-8">
              The page you are looking for does not exist or has been moved.
              Let's help you find what you're looking for.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                asChild
                className="bg-[#1338BE] hover:bg-[#63C5DA] text-white flex items-center justify-center px-6 py-2"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home 
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                className="border-[#1338BE] text-[#1338BE] hover:bg-[#1338BE] hover:text-white flex items-center justify-center px-6 py-2"
              >
                <Link href="/contact">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </div>
            
            {/* Quick Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12"
            >
              <p className="text-sm text-gray-600 mb-4">
                Here are some helpful links:
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <Link 
                  href="/about" 
                  className="text-[#1338BE] hover:text-[#63C5DA] text-sm hover:underline transition-colors"
                >
                  About Us
                </Link>
                <Link 
                  href="/services" 
                  className="text-[#1338BE] hover:text-[#63C5DA] text-sm hover:underline transition-colors"
                >
                  Our Services
                </Link>
                <Link 
                  href="/team" 
                  className="text-[#1338BE] hover:text-[#63C5DA] text-sm hover:underline transition-colors"
                >
                  Our Team
                </Link>
                <Link 
                  href="/faqs" 
                  className="text-[#1338BE] hover:text-[#63C5DA] text-sm hover:underline transition-colors"
                >
                  FAQs
                </Link>
              </div>
            </motion.div>
            
            {/* Support Message */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-10"
            >
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please email 
                <a href="mailto:support@healthta.ke" className="text-[#1338BE] hover:underline ml-1">
                  support@healthta.ke
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-4 text-center"
        >
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Health Technology Assessment Kenya | University of Nairobi
          </p>
        </motion.div>
      </div>
    </>
  )
}