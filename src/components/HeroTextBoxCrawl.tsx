'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import '@/styles/crawl.css' // 👈 You'll create this file

export default function HeroTextBoxCrawl() {
  const [showRest, setShowRest] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowRest(true), 25000) // 25s crawl duration
    return () => clearTimeout(timer)
  }, [])

  const role = 'AI Jedi | Guardian of the Neural Force'
  const description = `I’m Sajid — a developer strong with the Source (both the Force and open source). I don’t just build models; I train Padawans of the machine world.

Whether it’s decoding emotions like a mind-reading droid or generating art from thought, I’m all about using AI to bring balance to the data galaxy.

I’ve seen too many models fall to the dark side of overfitting. My mission? Build with intention, automate with wisdom, and always trust the model... but verify it with a lightsaber (or maybe a confusion matrix). 

This is the way.`

  return (
    <>
      {/* Star Wars Crawl */}
      {!showRest && (
        <div className="crawl-container">
          <div className="crawl">
            <h2 className="text-yellow-400 text-sm mb-4 uppercase">{role}</h2>
            <p className="text-white whitespace-pre-line">{description}</p>
          </div>
        </div>
      )}

      {/* After crawl completes, show rest of the UI */}
      {showRest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-10 right-10 z-30 w-full max-w-xl pointer-events-auto text-white text-left space-y-4"
        >
          <p className="text-sm uppercase tracking-wider font-semibold">{role}</p>
          <p className="text-base font-light leading-relaxed whitespace-pre-line">{description}</p>
        </motion.div>
      )}
    </>
  )
}















