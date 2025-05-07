// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { Menu, X, ChevronDown } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { motion, AnimatePresence } from 'framer-motion'
// import { cn } from '@/lib/utils'
// import Image from 'next/image'

// const links = [
//   { href: '/', label: 'Home' },
//   { href: '/about', label: 'About Us' },
//   { 
//     href: '/services', 
//     label: 'Services',
//     hasDropdown: true,
//     dropdownItems: [
//       { href: '/services/health-benefits-package', label: 'Health Benefits Package' },
//       { href: '/services/pricing-tariffs', label: 'Pricing & Tariffs' },
//       { href: '/services/program-monitoring', label: 'Program Monitoring' },
//     ] 
//   },
//   { href: '/team', label: 'Our Team' },
//   { href: '/resources', label: 'Resources' },
//   { href: '/news', label: 'News' },
// ]

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [scrolled, setScrolled] = useState(false)
//   const pathname = usePathname()
  
//   // Desktop dropdown state
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50)
//     }
//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   // Close menu when route changes
//   useEffect(() => {
//     setIsOpen(false)
//     setActiveDropdown(null)
//   }, [pathname])

//   // Toggle dropdown
//   const toggleDropdown = (label: string) => {
//     setActiveDropdown(activeDropdown === label ? null : label)
//   }

//   // Check if the current path is part of a dropdown
//   const isActiveDropdownPath = (link: typeof links[0]) => {
//     if (!link.hasDropdown) return false
//     return link.dropdownItems?.some(item => 
//       pathname === item.href || pathname.startsWith(`${item.href}/`)
//     )
//   }

//   return (
//     <nav
//       className={cn(
//         'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white',
//         scrolled ? 'py-2 shadow-md' : 'py-4'
//       )}
//     >
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-2">
//             <span className="text-2xl font-bold">
//               <span className="text-[#1338BE]">BP</span>
//               <span className="text-[#63C5DA]">TAP</span>
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden lg:flex items-center space-x-8">
//             {links.map((link) => (
//               <div 
//                 key={link.href} 
//                 className="relative group"
//               >
//                 {link.hasDropdown ? (
//                   <>
//                     <button 
//                       onClick={() => toggleDropdown(link.label)}
//                       className={cn(
//                         'text-sm font-medium transition-colors hover:text-[#1338BE] flex items-center relative group',
//                         (pathname === link.href || isActiveDropdownPath(link) || activeDropdown === link.label) 
//                           ? 'text-[#1338BE]' 
//                           : 'text-black'
//                       )}
//                     >
//                       {link.label}
//                       <ChevronDown size={16} className={cn(
//                         'ml-1 transition-transform duration-200',
//                         activeDropdown === link.label ? 'rotate-180' : ''
//                       )} />
//                       <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#63C5DA] to-[#1338BE] group-hover:w-full transition-all duration-300 ease-in-out"></span>
//                     </button>
                    
//                     <AnimatePresence>
//                       {activeDropdown === link.label && (
//                         <motion.div
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: 10 }}
//                           transition={{ duration: 0.2 }}
//                           className="absolute top-full left-0 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] z-50"
//                         >
//                           {link.dropdownItems?.map((item) => (
//                             <Link
//                               key={item.href}
//                               href={item.href}
//                               className={cn(
//                                 'block px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
//                                 pathname === item.href ? 'text-[#1338BE]' : 'text-black'
//                               )}
//                             >
//                               {item.label}
//                             </Link>
//                           ))}
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </>
//                 ) : (
//                   <Link
//                     href={link.href}
//                     className="text-sm font-medium transition-colors hover:text-[#1338BE] relative group"
//                   >
//                     <span className={cn(
//                       pathname === link.href ? 'text-[#1338BE]' : 'text-black'
//                     )}>
//                       {link.label}
//                     </span>
//                     <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#63C5DA] to-[#1338BE] group-hover:w-full transition-all duration-300 ease-in-out"></span>
//                   </Link>
//                 )}
//               </div>
//             ))}
//             <Link href="/contact">
//               <Button variant="default" className="bg-[#1338BE] hover:bg-[#63C5DA] text-white transition-colors duration-300">
//                 Contact Us
//               </Button>
//             </Link>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="lg:hidden">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-black hover:bg-gray-100"
//               aria-label={isOpen ? 'Close menu' : 'Open menu'}
//             >
//               {isOpen ? <X size={24} /> : <Menu size={24} />}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.3 }}
//             className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
//           >
//             <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
//               {links.map((link) => (
//                 <div key={link.href} className="flex flex-col">
//                   {link.hasDropdown ? (
//                     <>
//                       <button
//                         onClick={() => toggleDropdown(link.label)}
//                         className={cn(
//                           'text-sm font-medium transition-colors py-2 text-left flex items-center justify-between',
//                           (pathname === link.href || isActiveDropdownPath(link)) ? 'text-[#1338BE]' : 'text-black'
//                         )}
//                       >
//                         {link.label}
//                         <ChevronDown 
//                           size={16} 
//                           className={cn(
//                             'transition-transform duration-200',
//                             activeDropdown === link.label ? 'rotate-180' : ''
//                           )} 
//                         />
//                       </button>
                      
//                       <AnimatePresence>
//                         {activeDropdown === link.label && (
//                           <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: 'auto' }}
//                             exit={{ opacity: 0, height: 0 }}
//                             transition={{ duration: 0.2 }}
//                             className="pl-4 ml-2 border-l border-gray-200 mt-2 space-y-2"
//                           >
//                             {link.dropdownItems?.map((item) => (
//                               <Link
//                                 key={item.href}
//                                 href={item.href}
//                                 className={cn(
//                                   'block py-2 text-sm transition-colors',
//                                   pathname === item.href ? 'text-[#1338BE]' : 'text-gray-700 hover:text-[#1338BE]'
//                                 )}
//                               >
//                                 {item.label}
//                               </Link>
//                             ))}
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </>
//                   ) : (
//                     <Link
//                       href={link.href}
//                       className={cn(
//                         'text-sm font-medium transition-colors py-2',
//                         pathname === link.href ? 'text-[#1338BE]' : 'text-black hover:text-[#1338BE]'
//                       )}
//                     >
//                       {link.label}
//                     </Link>
//                   )}
//                 </div>
//               ))}
//               <Link href="/contact">
//                 <Button className="bg-[#1338BE] hover:bg-[#63C5DA] text-white w-full">
//                   Contact Us
//                 </Button>
//               </Link>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  { 
    href: '/services', 
    label: 'Services',
    hasDropdown: true,
    dropdownItems: [
      { href: '/services/health-benefits-package', label: 'Health Benefits Package' },
      { href: '/services/pricing-tariffs', label: 'Pricing & Tariffs Advisory' },
      { href: '/services/program-monitoring', label: 'Program Monitoring' },
    ] 
  },
  { href: '/our-team', label: 'Our Team' },
  { href: '/resources', label: 'Resources' },
  { href: '/capacity-building', label: 'Capacity building'},
  { href: '/news', label: 'News' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  // Toggle dropdown
  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  // Check if the current path is part of a dropdown
  const isActiveDropdownPath = (link: typeof links[0]) => {
    if (!link.hasDropdown) return false
    return link.dropdownItems?.some(item => 
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white',
        scrolled ? 'py-2 shadow-md' : 'py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-[#1338BE]">HTA</span>
              {/* <span className="text-[#63C5DA]">LOGO</span> */}
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {links.map((link) => (
              <div 
                key={link.href} 
                className="relative group"
              >
                {link.hasDropdown ? (
                  <>
                    <button 
                      onClick={() => toggleDropdown(link.label)}
                      className={cn(
                        'text-sm font-medium transition-colors hover:text-[#1338BE] flex items-center relative group',
                        (pathname === link.href || isActiveDropdownPath(link) || activeDropdown === link.label) 
                          ? 'text-[#1338BE]' 
                          : 'text-black'
                      )}
                    >
                      {link.label}
                      <ChevronDown size={16} className={cn(
                        'ml-1 transition-transform duration-200',
                        activeDropdown === link.label ? 'rotate-180' : ''
                      )} />
                      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#63C5DA] to-[#1338BE] group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] z-50"
                        >
                          {link.dropdownItems?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                'block px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                                pathname === item.href ? 'text-[#1338BE]' : 'text-black'
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm font-medium transition-colors hover:text-[#1338BE] relative group"
                  >
                    <span className={cn(
                      pathname === link.href ? 'text-[#1338BE]' : 'text-black'
                    )}>
                      {link.label}
                    </span>
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#63C5DA] to-[#1338BE] group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  </Link>
                )}
              </div>
            ))}
            <Link href="/contact">
              <Button variant="default" className="bg-[#1338BE] hover:bg-[#63C5DA] text-white transition-colors duration-300">
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

      {/* Mobile Navigation */}
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
                <div key={link.href} className="flex flex-col">
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(link.label)}
                        className={cn(
                          'text-sm font-medium transition-colors py-2 text-left flex items-center justify-between',
                          (pathname === link.href || isActiveDropdownPath(link)) ? 'text-[#1338BE]' : 'text-black'
                        )}
                      >
                        {link.label}
                        <ChevronDown 
                          size={16} 
                          className={cn(
                            'transition-transform duration-200',
                            activeDropdown === link.label ? 'rotate-180' : ''
                          )} 
                        />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === link.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 ml-2 border-l border-gray-200 mt-2 space-y-2"
                          >
                            {link.dropdownItems?.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  'block py-2 text-sm transition-colors',
                                  pathname === item.href ? 'text-[#1338BE]' : 'text-gray-700 hover:text-[#1338BE]'
                                )}
                              >
                                {item.label}
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
                        'text-sm font-medium transition-colors py-2',
                        pathname === link.href ? 'text-[#1338BE]' : 'text-black hover:text-[#1338BE]'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              <Link href="/contact">
                <Button className="bg-[#1338BE] hover:bg-[#63C5DA] text-white w-full">
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