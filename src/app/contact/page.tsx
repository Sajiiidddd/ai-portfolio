'use client'

import { useState, useEffect } from 'react'
import InteractiveBackground from '@/components/InteractiveBackground'
import FooterNav from '@/components/FooterNav'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Accent Color: Muted Rosewood
const ACCENT = '#A35D6A'

const altPairs = [
  ['JUST SAY', 'HELLO'],
  ['NEED HELP?', 'I BUILD'],
  ['YOU THINK', 'I CODE'],
  ['HUMAN?', 'MAYBE.'],
  ['TOGETHER?', 'BETTER.'],
  ['PROBLEMS?', 'SOLUTIONS.'],
  ['COFFEE?', 'CALL?'],
  ['IDEA?', 'EXECUTE.'],
  ['YOUR AI', 'WINGMAN'],
  ['LET’S', 'BUILD'],
  ['TALK', 'TECH'],
]

const socials = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sajid-tamboli-b505022a8/',
    logo: '/logos/linkedin.svg',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Sajiiidddd',
    logo: '/logos/github.png',
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/TgjQmTVfQf',
    logo: '/logos/discord1.svg',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/susjidt/',
    logo: '/logos/instagram.svg',
  },
  {
    name: 'X',
    href: 'https://x.com/TamboliSaj12545',
    logo: '/logos/x2.svg',
  },
  {
    name: 'Email',
    href: 'mailto:tambolisajid65@gmail.com',
    logo: '/logos/gmail.svg',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/919922123867',
    logo: '/logos/whatsapp.svg',
  },
]

function ContactOverlay({ hovered }: { hovered: boolean }) {
  const [pair, setPair] = useState(altPairs[0])

  useEffect(() => {
    const i = setInterval(() => {
      setPair(altPairs[Math.floor(Math.random() * altPairs.length)])
    }, 3000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-none w-screen max-w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative flex flex-col items-center justify-center w-full"
      >
        {/* Main Title */}
        <motion.div
          className="transition-opacity duration-300"
          animate={{ opacity: hovered ? 0 : 1 }}
        >
          <h1 className="text-[9vw] font-extrabold tracking-tighter leading-none text-center" style={{ color: ACCENT }}>
            CONTACT
          </h1>
        </motion.div>

        {/* Alt Pair Swapper */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          <motion.div
            className="flex flex-row items-center justify-center"
            animate={{ gap: hovered ? '6vw' : '0vw' }}
            transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          >
            <motion.span
              className="text-[6vw] font-extrabold tracking-tighter leading-none text-center whitespace-nowrap"
              style={{ color: ACCENT }}
              animate={{ x: hovered ? '-3vw' : 0 }}
            >
              {pair[0]}
            </motion.span>
            <motion.span
              className="text-[6vw] font-extrabold tracking-tighter leading-none text-center whitespace-nowrap"
              style={{ color: ACCENT }}
              animate={{ x: hovered ? '3vw' : 0 }}
            >
              {pair[1]}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function ContactPage() {
  const [hovered, setHovered] = useState(false)

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      <InteractiveBackground />

      {/* Overlay Section */}
      <ContactOverlay hovered={hovered} />

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-20 pt-40 pb-32 max-w-4xl mx-auto">
        {/* Top Text */}
        <div className="text-center space-y-4 max-w-xl">
          <h2 className="text-2xl tracking-widest uppercase" style={{ color: ACCENT }}>
            Let’s talk
          </h2>
          <p className="text-lg text-white/80">
            If you have a project, a collab idea, or just want to chat tech — drop me a line.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex gap-10 flex-wrap justify-center">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="group flex flex-col items-center hover:scale-110 transition-transform duration-200"
            >
              <Image
                src={social.logo}
                alt={social.name}
                width={48}
                height={48}
                className="mb-2 grayscale group-hover:grayscale-0 transition"
              />
              <span className="text-sm opacity-70 group-hover:opacity-100 transition">{social.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <FooterNav />
      </div>
    </main>
  )
}








