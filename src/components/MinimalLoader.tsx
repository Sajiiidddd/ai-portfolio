'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function MinimalLoader({ onFinish }: { onFinish: () => void }) {
  const fullText = "Learnings and Failure Insights.."
  const [typedLength, setTypedLength] = useState(0)
  const [doneTyping, setDoneTyping] = useState(false)
  const [startFadeOut, setStartFadeOut] = useState(false)

  // Typing animation
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (typedLength < fullText.length) {
        setTypedLength(prev => prev + 1)
      } else {
        clearInterval(typingInterval)
        setDoneTyping(true)
      }
    }, 130)

    return () => clearInterval(typingInterval)
  }, [typedLength, fullText.length])

  // Start fade-out after 1.5s pause
  useEffect(() => {
    if (doneTyping) {
      const timeout = setTimeout(() => {
        setStartFadeOut(true)
      }, 1500)

      return () => clearTimeout(timeout)
    }
  }, [doneTyping])

  // Trigger onFinish after fade
  useEffect(() => {
    if (startFadeOut) {
      const timeout = setTimeout(() => {
        onFinish()
      }, 1200)
      return () => clearTimeout(timeout)
    }
  }, [startFadeOut, onFinish])

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={startFadeOut ? { opacity: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="text-white text-4xl font-bold tracking-[0.4em] font-mono">
        <span>
          {/* Show partial string with full reserved space to avoid shift */}
          {fullText.slice(0, typedLength)}
          <motion.span
            className="inline-block w-[0.5ch]"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          >
            |
          </motion.span>
          <span className="invisible">{fullText.slice(typedLength)}</span>
        </span>
      </div>
    </motion.div>
  )
}



