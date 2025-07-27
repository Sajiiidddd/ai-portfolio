'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useHover } from '../context/HoverContext'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Skills', path: '/skills' },
  { name: 'Certifications', path: '/certifications' },
  { name: 'Experience', path: '/experience' }, // changed from 'Journey' and linked to /experience
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { setHovered } = useHover()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 w-full z-50 transition-shadow ${scrolled ? 'shadow-md bg-white/80 backdrop-blur dark:bg-black/70' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Sajid
        </Link>
        <ul className="hidden md:flex space-x-6 items-center">
          {navLinks.map(({ name, path }) => {
            // Map nav name to NavItem type for hover context
            let hoverKey: 'about' | 'work' | 'projects' | 'blog' | 'contact' | 'skills' | 'certifications' | null = null;
            switch (name.toLowerCase()) {
              case 'home': hoverKey = 'about'; break;
              case 'projects': hoverKey = 'projects'; break;
              case 'contact': hoverKey = 'contact'; break;
              case 'experience': hoverKey = 'work'; break; // changed from 'journey' to 'experience'
              case 'skills': hoverKey = 'skills'; break;
              case 'certifications': hoverKey = 'certifications'; break;
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
      </nav>
    </header>
  )
}

