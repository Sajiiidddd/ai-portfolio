'use client'

import React, { useState, useEffect } from 'react' // Import React for TSX
import { AnimatePresence } from 'framer-motion'
import ScrollImageStack from '@/components/ScrollImageStack'
import InteractiveBackground from '@/components/InteractiveBackground'
import HeroTextBox from '@/components/HeroTextBox'
import BigNameOverlay from '@/components/BigNameOverlay'
import FooterNav from '@/components/FooterNav'
import ResumeButton from '@/components/ResumeButton' // 1. Import the new TSX component

export default function Home() {
  // 2. Add state to track button visibility.
  // TypeScript correctly infers 'isScrolled' as type 'boolean'.
  const [isScrolled, setIsScrolled] = useState(false);

  // 3. Add a scroll listener to update the state
  useEffect(() => {
    const handleScroll = () => {
      // Show the button if user has scrolled more than 100px
      setIsScrolled(window.scrollY > 100);
    };

    // Add event listener when component mounts
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <main className="relative w-full h-[300vh] bg-black text-white overflow-x-hidden">
      {/* Backgrounds */}
      <ScrollImageStack />
      <InteractiveBackground />

      {/* Foreground: fixed top layer */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="pointer-events-auto h-full w-full flex flex-col justify-between">
          <div>
            <HeroTextBox />
            <BigNameOverlay />
          </div>
          <FooterNav />
        </div>
      </div>

      {/* 4. Conditionally render the button with a smooth animation */}
      <AnimatePresence>
        {isScrolled && <ResumeButton />}
      </AnimatePresence>
    </main>
  )
}




















