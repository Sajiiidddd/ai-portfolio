import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Certification-related alternating text pairs
const altPairs = [
  ["LEARN", "VALIDATE"],
  ["GROW", "ACHIEVE"],
  ["SKILL", "CERTIFY"],
  ["EXPERT", "PROVE"],
  ["MASTER", "ACCREDIT"],
  ["STUDY", "EXCEL"],
];

// This component displays the large "CERTIFICATIONS" title with an interactive hover effect
export default function CertificationsOverlay({ activeIdx }: { activeIdx: number }) {
  const [pair, setPair] = useState(altPairs[0]);
  const [hovered, setHovered] = useState(false);

  // Effect to update the alt text pair when the active index changes (e.g., scrolling through certifications)
  useEffect(() => {
    setPair(altPairs[Math.floor(Math.random() * altPairs.length)]);
  }, [activeIdx]);

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-auto bg-transparent w-screen max-w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="relative flex flex-col items-center justify-center w-full max-w-full"
      >
        {/* Main Title: "CERTIFICATIONS" - Emerald Green (glow removed) */}
        <motion.div
          className="transition-opacity duration-500"
          animate={{ opacity: hovered ? 0 : 1 }}
        >
          <h1 className="text-[#00E676] text-[10vw] font-extrabold tracking-tighter leading-none text-center"> {/* Removed drop-shadow */}
            CERTIFICATIONS
          </h1>
        </motion.div>

        {/* Alt text split from true center - appears on hover - Emerald Green (glow removed) */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center w-full max-w-full justify-center transition-opacity duration-500 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          <motion.div
            className="flex flex-row items-center justify-center"
            animate={{ gap: hovered ? '6vw' : '0vw' }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            style={{ width: 'auto', maxWidth: '100%' }}
          >
            <motion.span
              className="text-[#00C853] text-[7vw] font-extrabold tracking-tighter leading-none text-center whitespace-nowrap" // Removed drop-shadow
              animate={{ x: hovered ? '-3vw' : 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              {pair[0]}
            </motion.span>
            <motion.span
              className="text-[#00C853] text-[7vw] font-extrabold tracking-tighter leading-none text-center whitespace-nowrap" // Removed drop-shadow
              animate={{ x: hovered ? '3vw' : 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              {pair[1]}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}