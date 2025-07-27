'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SkillIconProps {
  id: string;
  label: string;
  icon: string;
  onHover: () => void;
  onLeave: () => void;
}

export default function SkillIcon({ id, label, icon, onHover, onLeave }: SkillIconProps) {
  return (
    <motion.div
      className="relative group w-24 h-24 flex flex-col items-center justify-center cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 110, damping: 12 }}
    >
      <Image
        src={icon}
        alt={label}
        width={52}
        height={52}
        className="grayscale group-hover:grayscale-0 transition duration-300 ease-in-out"
      />
      {/* <motion.span
        className="text-xs mt-2 text-white text-center opacity-50 group-hover:opacity-100 transition duration-300"
      >
        {label}
      </motion.span> */}
    </motion.div>
  );
}


