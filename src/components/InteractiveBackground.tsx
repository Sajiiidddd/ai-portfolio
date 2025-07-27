// components/InteractiveBackground.tsx
// (Rename to .tsx if you are using TypeScript for better type checking)
'use client'

import React, { useState, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react' // Use React's MouseEvent/TouchEvent types
import { motion, Transition } from 'framer-motion'

export default function InteractiveBackground() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false) // State to ensure client-side rendering

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== 'undefined') {
      // Set initial position to a random spot on the screen
      const initialX = Math.random() * window.innerWidth
      const initialY = Math.random() * window.innerHeight
      setPosition({ x: initialX, y: initialY })

      // Attach event listeners directly to the window for reliable capture
      const handleWindowMouseMove = (e: globalThis.MouseEvent) => { // Use globalThis.MouseEvent for window events
        setPosition({ x: e.clientX, y: e.clientY })
      }

      const handleWindowTouchMove = (e: globalThis.TouchEvent) => { // Use globalThis.TouchEvent for window events
        if (e.touches[0]) {
          setPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
        }
      }

      window.addEventListener('mousemove', handleWindowMouseMove)
      window.addEventListener('touchmove', handleWindowTouchMove)

      // Clean up event listeners when the component unmounts
      return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove)
        window.removeEventListener('touchmove', handleWindowTouchMove)
      }
    }
  }, []) // Empty dependency array means this runs only once on mount

  // Define multiple "light blobs" with varied properties
  // Using explicit types for TypeScript, you can remove these if not using TS
  const blobs: {
    id: string;
    size: number;
    color: string; // CSS gradient string
    blur: string; // Tailwind blur class
    xOffset: number; // Offset for centering the blob
    yOffset: number;
    transition: Transition; // Framer Motion's Transition type
  }[] = [
    {
      id: 'blob-1',
      size: 450, // Main glow
      color: 'radial-gradient(circle at center, rgba(0, 255, 247, 0.18), transparent 70%)', // Muted Cyan
      blur: 'blur-3xl',
      xOffset: -225, // Centered (size / 2)
      yOffset: -225,
      transition: { type: 'spring', stiffness: 55, damping: 25, mass: 1 },
    },
    {
      id: 'blob-2',
      size: 600, // Larger, ambient glow
      color: 'radial-gradient(circle at center, rgba(128, 0, 128, 0.12), transparent 80%)', // Muted Purple
      blur: 'blur-3xl',
      xOffset: -300,
      yOffset: -300,
      transition: { type: 'spring', stiffness: 30, damping: 15, mass: 1.2, delay: 0.05 }, // Slower, more "laggy"
    },
    {
      id: 'blob-3',
      size: 300, // Smaller, more direct response
      color: 'radial-gradient(circle at center, rgba(0, 100, 255, 0.22), transparent 75%)', // Muted Blue
      blur: 'blur-2xl',
      xOffset: -150,
      yOffset: -150,
      transition: { type: 'spring', stiffness: 70, damping: 30, mass: 0.9 }, // Faster
    },
    {
      id: 'blob-4',
      size: 250, // Accent glow, slightly offset
      color: 'radial-gradient(circle at center, rgba(255, 200, 0, 0.08), transparent 85%)', // Muted Gold/Orange
      blur: 'blur-3xl',
      xOffset: -125,
      yOffset: -125,
      transition: { type: 'spring', stiffness: 45, damping: 20, mass: 1.1, delay: 0.1 }, // Moderate speed, with delay
    },
  ];

  // Don't render the component on the server side
  if (!isClient) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      // Removed onMouseMove/onTouchMove from this div as they are now on window
    >
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className={`absolute rounded-full ${blob.blur}`}
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
          }}
          animate={{
            x: position.x + blob.xOffset,
            y: position.y + blob.yOffset,
          }}
          transition={blob.transition}
        />
      ))}
    </div>
  );
}

