'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const altPairs = [
  ['AM I', 'AI ?'],
  ['NEURAL', 'NETWORK'],
  ['BOT', 'OR NOT'],
  ['0101', 'BOY'],
  ['DEEP', 'LEARNER'],
  ['SUDO', 'HUMAN'],
  ['CODE', 'GENIUS'],
  ['MEGA', 'MIND'],
  ['JUST', 'LOGIC'],
  ['BITS', 'BRAIN'],
  ['BINARY', 'BEING'],
  ['LOOPS', 'ONLY'],
  ['AI', 'IS ME'],
  ['ONCE', 'AGAIN'],
]

export default function BigNameOverlay() {
  const [hovered, setHovered] = useState(false)
  const [altText, setAltText] = useState(['', ''])

  useEffect(() => {
    const random = altPairs[Math.floor(Math.random() * altPairs.length)]
    setAltText(random)
  }, [])

  return (
    <div
      className="absolute bottom-10 left-8 right-8 z-30 pointer-events-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="flex flex-wrap justify-between items-end relative"
      >
        {/* Actual Name */}
        <motion.div
          className="transition-opacity duration-500"
          animate={{ opacity: hovered ? 0 : 1 }}
        >
          <h1 className="text-white text-[12vw] font-extrabold tracking-tighter leading-none">
            MOVIE
          </h1>
        </motion.div>
        <motion.div
          className="transition-opacity duration-500"
          animate={{ opacity: hovered ? 0 : 1 }}
        >
          <h1 className="text-white text-[12vw] font-extrabold tracking-tighter leading-none">
            SONGS
          </h1>
        </motion.div>

        {/* Hover Alt Text */}
        <motion.div
          className="absolute left-0 transition-opacity duration-500"
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          <h1 className="text-neon text-[12vw] font-extrabold tracking-tighter leading-none">
            {altText[0]}
          </h1>
        </motion.div>
        <motion.div
          className="absolute right-0 transition-opacity duration-500"
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          <h1 className="text-neon text-[12vw] font-extrabold tracking-tighter leading-none text-right">
            {altText[1]}
          </h1>
        </motion.div>
      </motion.div>
    </div>
  )
}