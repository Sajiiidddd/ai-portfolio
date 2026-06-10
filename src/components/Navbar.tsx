'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useHover } from '../context/HoverContext'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Skills', path: '/skills' },
  { name: 'Certifications', path: '/certifications' },
  { name: 'Experience', path: '/experience' },
  { name: 'Recs', path: '/recommendations' },
  { name: 'Contact', path: '/contact' },
  { name: 'Test', path: '/test' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { setHovered } = useHover()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <header className={`fixed top-0 w-full z-50 transition-shadow ${scrolled ? 'shadow-md bg-white/80 backdrop-blur dark:bg-black/70' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Sajid
        </Link>
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          {navLinks.map(({ name, path }) => {
            // Map nav name to NavItem type for hover context
            let hoverKey: 'about' | 'work' | 'projects' | 'blog' | 'contact' | 'skills' | 'certifications' | 'recommendations' | null = null;
            switch (name.toLowerCase()) {
              case 'home': hoverKey = 'about'; break;
              case 'projects': hoverKey = 'projects'; break;
              case 'contact': hoverKey = 'contact'; break;
              case 'experience': hoverKey = 'work'; break; // changed from 'journey' to 'experience'
              case 'skills': hoverKey = 'skills'; break;
              case 'certifications': hoverKey = 'certifications'; break;
              case 'recs': hoverKey = 'recommendations'; break;
              default: hoverKey = null;
            }
            return (
              <li key={path}
                onMouseEnter={() => { setHovered(hoverKey); console.log('Hovered:', hoverKey); }}
                onMouseLeave={() => { setHovered(null); console.log('Hovered: null'); }}
              >
                <Link
                  href={path}
                  className={`transition font-medium hover:text-blue-500 ${
                    pathname === path ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {name}
                </Link>
              </li>
            );
          })}
          {/* 🌙☀️ Toggle */}
          <li>
            <button
              aria-label="Toggle Dark Mode"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-4 text-xl"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </li>
        </ul>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-gray-900 dark:text-white">
            {/* Hamburger Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/80 dark:bg-black/70 backdrop-blur"
          >
            <ul className="flex flex-col items-center space-y-4 py-4">
              {navLinks.map(({ name, path }) => (
                <li key={path}>
                  <Link
                    href={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`transition font-medium hover:text-blue-500 ${
                      pathname === path ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}