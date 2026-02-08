'use client';

import FooterNavBar from '@/components/FooterNav';
import { useState, useMemo, useRef } from 'react';
import LogoLoop from '@/components/LogoLoop';
import Image from 'next/image';
import LiquidEther from '@/components/LiquidEther'; // Uses the fixed file above
import RotatingText, { RotatingTextRef } from '@/components/RotatingText';
import { motion } from 'framer-motion';

interface Skill {
  id: string;
  label: string;
  icon: string;
  level: 'rookie' | 'intermediate' | 'advanced';
}

export default function SkillsPage() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const rotateRef = useRef<RotatingTextRef>(null);

  const skills: Skill[] = [
    // --- ADVANCED ---
    { id: 'python', label: 'Python', icon: '/skills/python.svg', level: 'advanced' },
    { id: 'tensorflow', label: 'TensorFlow', icon: '/skills/tensorflow.svg', level: 'advanced' },
    { id: 'huggingface', label: 'HuggingFace', icon: '/skills/huggingface.svg', level: 'advanced' },
    { id: 'mysql', label: 'MySQL', icon: '/skills/mysql.svg', level: 'advanced' },
    { id: 'numpy', label: 'NumPy', icon: '/skills/numpy.svg', level: 'advanced' },
    { id: 'scikit', label: 'Scikit-learn', icon: '/skills/scikit-learn.svg', level: 'advanced' },
    { id: 'opencv', label: 'OpenCV', icon: '/skills/opencv.svg', level: 'advanced' },
    { id: 'keras', label: 'Keras', icon: '/skills/Keras.svg', level: 'advanced' },
    { id: 'matplotlib', label: 'Matplotlib', icon: '/skills/matplotlib.svg', level: 'advanced' },
    { id: 'pytorch', label: 'PyTorch', icon: '/skills/pytorch.svg', level: 'advanced' },

    // --- INTERMEDIATE ---
    { id: 'cpp', label: 'C++', icon: '/skills/c++.svg', level: 'intermediate' },
    { id: 'hdfs', label: 'HDFS', icon: '/skills/hdfs.svg', level: 'intermediate' },
    { id: 'django', label: 'Django', icon: '/skills/django.svg', level: 'intermediate' },
    { id: 'gcp', label: 'Google Cloud', icon: '/skills/gcp.svg', level: 'intermediate' },
    { id: 'git', label: 'Git', icon: '/skills/git.svg', level: 'intermediate' },
    { id: 'fastapi', label: 'FastAPI', icon: '/skills/fastapi.svg', level: 'intermediate' },
    { id: 'nodejs', label: 'Node.js', icon: '/skills/node.js.svg', level: 'intermediate' },
    { id: 'mongodb', label: 'MongoDB', icon: '/skills/mongodb.svg', level: 'intermediate' },

    // --- ROOKIE ---
    { id: 'r', label: 'R', icon: '/skills/r-project.svg', level: 'rookie' },
    { id: 'next', label: 'Next.js', icon: '/skills/next.js.svg', level: 'rookie' },
    { id: 'postgres', label: 'PostgreSQL', icon: '/skills/postgres.svg', level: 'rookie' },
    { id: 'html', label: 'HTML5', icon: '/skills/html-5.svg', level: 'rookie' },
    { id: 'css', label: 'CSS', icon: '/skills/css.svg', level: 'rookie' },
  ];

  const allSkillLabels = useMemo(() => ['SKILLS', ...skills.map(s => s.label)], [skills]);

  const handleHover = (id: string, label: string, level: string) => {
    setHoveredSkill(label);
    setActiveLevel(level);
    if (rotateRef.current) {
      const index = skills.findIndex(s => s.label === label);
      if (index !== -1) rotateRef.current.jumpTo(index + 1);
    }
  };

  const handleLeave = () => {
    setHoveredSkill(null);
    setActiveLevel(null);
    if (rotateRef.current) {
      rotateRef.current.jumpTo(0);
    }
  };

  const getLevelColor = (lvl: string | null) => {
    switch (lvl) {
      case 'rookie': return 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]';
      case 'intermediate': return 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]';
      case 'advanced': return 'text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]';
      default: return 'text-white';
    }
  };

  const renderSkillItem = (item: any) => {
    return (
      <div
        className="cursor-pointer group relative flex items-center justify-center px-10 py-4"
        onMouseEnter={() => handleHover(item.id, item.label, item.level)}
        onMouseLeave={handleLeave}
      >
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-125">
          <Image
            src={item.icon}
            alt={item.label}
            width={80}
            height={80}
            className="grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out object-contain"
          />
        </div>
      </div>
    );
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* LAYER 0: BACKGROUND (Liquid Ether)
         - Fixed position to cover screen
         - z-0 to stay behind
         - Neon colors for visibility
      */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <LiquidEther 
            colors={['#d946ef', '#8b5cf6', '#6366f1']} 
            autoSpeed={0.6}
            autoIntensity={2.5}
            mouseForce={40}
        />
      </div>

      {/* LAYER 1: CONTENT */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pb-24 pt-20">
        
        <div className="h-10" />

        <div className="flex flex-col gap-8 md:gap-14 w-full">
          {/* Rookie */}
          <div className="w-full opacity-50 hover:opacity-100 transition-opacity duration-500">
            <LogoLoop
              logos={skills.filter(s => s.level === 'rookie')}
              speed={35} 
              direction="left"
              logoHeight={80}
              gap={50}
              hoverSpeed={0} 
              scaleOnHover={false} 
              fadeOut={false} // No white boxes
              renderItem={renderSkillItem}
              width="100%"
            />
          </div>

          {/* Intermediate */}
          <div className="w-full opacity-70 hover:opacity-100 transition-opacity duration-500">
            <LogoLoop
              logos={skills.filter(s => s.level === 'intermediate')}
              speed={50} 
              direction="right" 
              logoHeight={80}
              gap={50}
              hoverSpeed={0}
              scaleOnHover={false}
              fadeOut={false}
              renderItem={renderSkillItem}
              width="100%"
            />
          </div>

          {/* Advanced */}
          <div className="w-full opacity-90 hover:opacity-100 transition-opacity duration-500">
            <LogoLoop
              logos={skills.filter(s => s.level === 'advanced')}
              speed={65}
              direction="left"
              logoHeight={80}
              gap={50}
              hoverSpeed={0}
              scaleOnHover={false}
              fadeOut={false}
              renderItem={renderSkillItem}
              width="100%"
            />
          </div>
        </div>

        {/* ROTATING TEXT */}
        <div className="w-full flex flex-col items-center justify-center pointer-events-none mb-10">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: hoveredSkill ? 1 : 0, 
              y: hoveredSkill ? 0 : 10 
            }}
            // Increased spacing
            className={`text-xl md:text-2xl font-bold tracking-[0.3em] uppercase mb-6 ${getLevelColor(activeLevel)}`}
          >
            {activeLevel || '-'}
          </motion.div>

          <RotatingText
            ref={rotateRef}
            texts={allSkillLabels}
            auto={false} 
            staggerFrom="center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.02}
            splitLevelClassName="overflow-hidden pb-4"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={0} 
            // Increased padding to prevent clipping
            mainClassName={`text-6xl md:text-8xl font-black tracking-tighter px-8 md:px-24 py-2 leading-none text-center ${hoveredSkill ? 'text-white' : 'text-[#520c37]'}`}
          />
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <FooterNavBar />
      </div>
    </main>
  );
}