'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SkillOverlayProps {
  hoveredSkill: string | null;
  level: string | null;
}

export default function SkillOverlay({ hoveredSkill, level }: SkillOverlayProps) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.h1
          key={hoveredSkill || 'SKILLS'}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, type: 'spring', damping: 20 }}
          className="text-[9vw] md:text-[7vw] font-extrabold tracking-tighter leading-none text-center drop-shadow-lg"
          style={{ color: '#520c37' }}
        >
          {hoveredSkill || 'SKILLS'}
        </motion.h1>
      </AnimatePresence>

      {level && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white mt-2 text-lg font-bold tracking-widest uppercase"
        >
          {level}
        </motion.div>
      )}
    </div>
  );
}






