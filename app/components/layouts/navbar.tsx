'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  // { href: '/our-team', label: 'Our Team' },
  {href: '/governance', label: 'Governance'},
  { href: '/resources', label: 'Resources' },
  { href: '/interventions-form', label: 'Interventions Proposal' },
  { href: '/news', label: 'News' },
  {href: '/faqs', label: "FAQs"}
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white',
        scrolled ? 'py-2 shadow-md' : 'py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
    
          <Link href="/" className="flex items-center space-x-2">
<Image
              src="/images/logo.jpg" 
              alt="hbtap" 
              height={24}
              width={100}
              className="w-auto mr-2 rounded-sm transition-opacity duration-300 hover:opacity-80"
          />
          </Link>

          <div className="hidden lg:flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium px-2 py-2 rounded transition-colors',
                  pathname === link.href
                    ? 'bg-[#27aae1] text-white'
                    : 'text-black hover:bg-[#27aae1] hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/contact">
              <Button variant="default" className="bg-[#1d8fc3] hover:bg-[#63C5DA] text-white transition-colors duration-300">
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:bg-gray-100"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>


      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {/* {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors py-2',
                    pathname === link.href ? 'text-[#1d8fc3]' : 'text-black hover:text-[#1d8fc3]'
                  )}
                >
                  {link.label}
                </Link>
              ))} */}

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium px-3 py-2 rounded transition-colors',
                    pathname === link.href
                      ? 'bg-[#27aae1] text-white'
                      : 'text-black hover:bg-[#27aae1] hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}


              <Link href="/contact">
                <Button className="bg-[#1d8fc3] hover:bg-[#63C5DA] text-white w-full">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
