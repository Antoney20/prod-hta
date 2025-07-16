

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  { href: '/governance', label: 'Governance' },
  {
    href: '/resources',
    label: 'Resources',
    subLinks: [
      { href: '/resources/stakeholders', label: 'Stakeholders' },
      { href: '/resources/media', label: 'Resources Media' },
    ],
  },
  { href: '/interventions-form', label: 'Interventions Proposal' },
  { href: '/news', label: 'News' },
  { href: '/faqs', label: 'FAQs' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    setIsDropdownOpen(false)
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
              src="/images/logo.png"
              alt="hbtap"
              height={24}
              width={100}
              className="w-auto mr-2 rounded-sm transition-opacity duration-300 hover:opacity-80"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-4">
            {links.map((link) => (
              <div key={link.href} className="relative group">
                {link.subLinks ? (
                  <>
                    <button
                      className={cn(
                        'text-lg font-semibold px-2 py-2 rounded transition-colors flex items-center',
                        pathname === link.href || link.subLinks.some((subLink) => pathname === subLink.href)
                          ? 'bg-[#27aae1] text-white'
                          : 'text-black hover:bg-[#27aae1] hover:text-white'
                      )}
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      {link.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50"
                          onMouseEnter={() => setIsDropdownOpen(true)}
                          onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                          {link.subLinks.map((subLink) => (
                            <Link
                              key={subLink.href}
                              href={subLink.href}
                              className={cn(
                                'block p-6 text-lg font-medium transition-colors',
                                pathname === subLink.href
                                  ? 'bg-[#27aae1] text-white'
                                  : 'text-black hover:bg-[#27aae1] hover:text-white'
                              )}
                            >
                              {subLink.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      'text-lg font-semibold px-2 py-2 rounded transition-colors',
                      pathname === link.href
                        ? 'bg-[#27aae1] text-white'
                        : 'text-black hover:bg-[#27aae1] hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}

            <Link href="/contact">
              <Button variant="default" className="bg-[#27aae1] text-white text-lg py-3 transition-colors duration-300">
                Contact Us
              </Button>
            </Link>
          </div>

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
              {links.map((link) => (
                <div key={link.href}>
                  {link.subLinks ? (
                    <>
                      <button
                        className={cn(
                          'text-lg font-semibold px-3 py-2 rounded transition-colors w-full text-left flex items-center',
                          pathname === link.href || link.subLinks.some((subLink) => pathname === subLink.href)
                            ? 'bg-[#27aae1] text-white'
                            : 'text-black hover:bg-[#27aae1] hover:text-white'
                        )}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {link.label}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 flex flex-col space-y-2"
                          >
                            {link.subLinks.map((subLink) => (
                              <Link
                                key={subLink.href}
                                href={subLink.href}
                                className={cn(
                                  'text-md font-semibold px-3 py-2 rounded transition-colors',
                                  pathname === subLink.href
                                    ? 'bg-[#27aae1] text-white'
                                    : 'text-black hover:bg-[#27aae1] hover:text-white'
                                )}
                              >
                                {subLink.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'text-md font-semibold px-3 py-2 rounded transition-colors',
                        pathname === link.href
                          ? 'bg-[#27aae1] text-white'
                          : 'text-black hover:bg-[#27aae1] hover:text-white'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}

              <Link href="/contact">
                <Button className="bg-[#27aae1] text-white w-full">
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