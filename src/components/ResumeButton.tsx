'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'

const ResumeButton: React.FC = () => {
  return (
    <motion.a
      href="/sajid_resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      
      initial={{ opacity: 0, x: 25 }} // Changed initial animation to slide from the right
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 25 }}    // Changed exit animation to slide to the right
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      
      whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(0, 255, 255, 0.2)' }}
      whileTap={{ scale: 0.95 }}
      
      // --- CHANGE HERE: Updated positioning classes ---
      className="fixed top-1/2 right-10 -translate-y-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full cursor-pointer
                 bg-black/30 backdrop-blur-md text-white/80
                 shadow-lg shadow-black/30"
    >
      <span>Resume</span>
      <FiArrowUpRight />
    </motion.a>
  )
}

export default ResumeButton

