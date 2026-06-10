'use client';

import { useRef, useEffect, useMemo } from 'react';
import RotatingText, { RotatingTextRef } from './RotatingText';
import { motion } from 'framer-motion';

interface RotatingSkillLabelProps {
  hoveredSkill: string | null;
  level: string | null;
  allSkills: string[];
}

export default function RotatingSkillLabel({ hoveredSkill, level, allSkills }: RotatingSkillLabelProps) {
  const rotateRef = useRef<RotatingTextRef>(null);

  // 1. Add 'SKILLS' to the start
  const displayTexts = useMemo(() => ['SKILLS', ...allSkills], [allSkills]);

  // 2. Handle Rotation
  useEffect(() => {
    if (rotateRef.current) {
      if (hoveredSkill) {
        const index = allSkills.findIndex(s => s === hoveredSkill);
        if (index !== -1) rotateRef.current.jumpTo(index + 1);
      } else {
        rotateRef.current.jumpTo(0);
      }
    }
  }, [hoveredSkill, allSkills]);

  const getLevelColor = (lvl: string | null) => {
    switch (lvl) {
      case 'rookie': return 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]';
      case 'intermediate': return 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]';
      case 'advanced': return 'text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]';
      default: return 'text-white';
    }
  };

  return (
    <div className="fixed bottom-10 left-0 right-0 z-40 pointer-events-none flex flex-col items-center justify-center pb-12">
      
      {/* Level Label - Added more bottom margin (mb-6) for spacing */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: hoveredSkill ? 0 : 20, 
          opacity: hoveredSkill ? 1 : 0 
        }}
        className={`text-xl md:text-2xl font-bold tracking-[0.3em] uppercase mb-6 ${getLevelColor(level)}`} 
      >
        {level || '-'}
      </motion.div>

      {/* Rotating Text 
          - Increased padding to px-20 (huge side padding) to prevent clipping
          - Added leading-none to tighten vertical gaps
      */}
      <RotatingText
        ref={rotateRef}
        texts={displayTexts}
        auto={false} 
        staggerFrom="center"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-120%" }}
        staggerDuration={0.02}
        splitLevelClassName="overflow-visible" /* ALLOWS ITALICS TO SPILL OUT */
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        rotationInterval={0} 
        mainClassName={`text-6xl md:text-8xl font-black tracking-tighter px-8 md:px-24 py-4 leading-none text-center ${hoveredSkill ? 'text-white' : 'text-[#520c37]'}`}
      />
    </div>
  );
}