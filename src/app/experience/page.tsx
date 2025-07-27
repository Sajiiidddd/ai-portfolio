"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import InteractiveBackground from "@/components/InteractiveBackground";
import FooterNav from "@/components/FooterNav";

const altPairs = [
  ["THE PATH", "FORWARD"],
  ["WORK", "IN PROGRESS"],
  ["MILESTONE", "UNLOCKED"],
  ["LEVEL UP", "AGAIN"],
  ["JOURNEY", "ONWARD"],
  ["NEXT", "CHAPTER"],
  ["GROWTH", "MODE"],
  ["CHECKPOINT", "REACHED"],
  ["EVOLVE", "EVERYDAY"],
  ["BUILD", "REPEAT"],
];

// Add types for ExperienceOverlay props
interface ExperienceOverlayProps {
  activeIdx: number;
  total: number;
}

function ExperienceOverlay({ activeIdx, total }: ExperienceOverlayProps) {
  const [pair, setPair] = useState(altPairs[0]);
  const [hovered, setHovered] = useState(false);
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
        {/* Main Title */}
        <motion.div
          className="transition-opacity duration-500"
          animate={{ opacity: hovered ? 0 : 1 }}
        >
          <h1 className="text-violet-400 text-[10vw] font-extrabold tracking-tighter leading-none text-center">
            EXPERIENCE
          </h1>
        </motion.div>
        {/* Alt text split from true center */}
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
              className="text-neon text-[7vw] font-extrabold tracking-tighter leading-none text-center whitespace-nowrap"
              animate={{ x: hovered ? '-3vw' : 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              {pair[0]}
            </motion.span>
            <motion.span
              className="text-neon text-[7vw] font-extrabold tracking-tighter leading-none text-center whitespace-nowrap"
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

// BelowDeckPreview component
function BelowDeckPreview({ exp, visible }: { exp: typeof experiences[0]; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 40 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-1/2 -translate-x-1/2 bottom-36 z-50 bg-black/90 border border-violet-400 rounded-xl shadow-xl px-6 py-4 flex flex-col items-center pointer-events-none ${visible ? '' : 'invisible'}`}
      style={{ minWidth: 260, maxWidth: 340 }}
    >
      <div className="text-violet-400 font-semibold text-base mb-1">{exp.year}</div>
      <div className="text-lg font-bold mb-1">{exp.title}</div>
      <div className="text-xs text-white/80 mb-2 text-center">{exp.description}</div>
      <Image src={exp.image} alt={exp.title} width={120} height={80} className="object-cover rounded-md" />
    </motion.div>
  );
}

const experiences = [
  {
    year: "December 2024 - Present",
    title: "AIML Lead at GDGOC-ADYPU",
    description:
      "Founded and currently lead a 150+ member AI/ML club focused on research and practical learning. Conducted technical sessions including a deep dive into AlexNet (2012), guiding 100+ students through CNN fundamentals and PyTorch implementation. Organized a 2-day workshop comparing regression models and neural networks for house price prediction using real-world datasets.",
    image: "/images/GDGOC.jpg",
  },
  {
    year: "2025",
    title: "Wisdom of Yoda, I Seek",
    description:
      "Learning, I am. Growing, I must. A new challenge — worthy and wise — I await. In code and curiosity, my destiny lies.",
    image: "/images/yoda2.jpg",
  },
/* {
    year: "2023",
    title: "Growth & Recognition",
    description:
      "Received recognition for my work and continued to grow my expertise in the field.",
    image: "/images/image3.jpg",
  },
  {
    year: "2024",
    title: "New Horizons",
    description:
      "Ventured into new domains, expanding my skillset and taking on exciting challenges.",
    image: "/images/image4.jpg",
  },*/
];

export default function ExperiencePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const expRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll effect: update activeIdx as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (!expRefs.current.length) return;
      const offsets = expRefs.current.map(ref => {
        if (!ref) return Infinity;
        const rect = ref.getBoundingClientRect();
        return Math.abs(rect.top - window.innerHeight / 3);
      });
      const minIdx = offsets.indexOf(Math.min(...offsets));
      setActiveIdx(minIdx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timeline scrubber logic (hover to update)
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const handleTimelineMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const step = rect.height / experiences.length;
    const idx = Math.min(experiences.length - 1, Math.max(0, Math.floor(y / step)));
    setActiveIdx(idx);
  };

  return (
    <main className="relative w-full min-h-[100vh] bg-black text-violet-400 overflow-x-hidden">
      <InteractiveBackground />
      {/* Fixed Experience Overlay */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-auto bg-transparent">
        <ExperienceOverlay activeIdx={activeIdx} total={experiences.length} />
      </div>
      {/* Fixed FooterNav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <FooterNav />
      </div>
      {/* Scrollable Content */}
      <div
        className="relative w-full max-w-4xl mx-auto pt-32 pb-40"
        ref={containerRef}
      >
        <div className="flex flex-col md:flex-row w-full gap-0">
          {/* Minimal Timeline graphic as fixed and aligned with content, ultra minimal */}
          <div
            ref={timelineRef}
            className="hidden md:flex flex-col items-center w-14 flex-shrink-0 cursor-pointer select-none fixed z-40 group/timeline"
            style={{
              userSelect: 'none',
              left: 'calc(50% - 32rem)',
              top: '8rem',
              height: 'calc(100vh - 10rem)'
            }}
            onMouseMove={handleTimelineMove}
          >
            {/* Ultra minimal gradient vertical line with glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[2px] rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, #a78bfa 0%, #fff0 100%)',
                boxShadow: '0 0 24px 4px #a78bfa44',
                opacity: 0.22
              }}
            />
            {/* Checkpoints */}
            {experiences.map((exp, idx) => (
              <div className="relative group" key={idx} style={{ top: `calc(${idx} * 120px)` }}>
                <motion.button
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={activeIdx === idx ? { scale: 1.18, opacity: 1, boxShadow: '0 0 0 10px #a78bfa33, 0 0 32px 8px #a78bfa55' } : { scale: 0.95, opacity: 0.7, boxShadow: 'none' }}
                  whileHover={{ scale: 1.28, boxShadow: '0 0 0 16px #a78bfa22, 0 0 40px 12px #a78bfa66' }}
                  whileTap={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  className={`w-4 h-4 rounded-full bg-white/10 flex items-center justify-center outline-none border-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-200 ${activeIdx === idx ? 'bg-violet-400' : 'bg-white/10'}`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveIdx(idx);
                    expRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  aria-label={`Go to experience ${idx + 1}`}
                  tabIndex={0}
                  style={{ position: 'relative', zIndex: 2, outline: 'none', border: 'none' }}
                  onFocus={e => setActiveIdx(idx)}
                >
                  {/* Ripple effect */}
                  <span className="absolute inset-0 rounded-full pointer-events-none" style={{
                    boxShadow: activeIdx === idx ? '0 0 24px 8px #a78bfa88' : 'none',
                    opacity: activeIdx === idx ? 0.7 : 0
                  }} />
                </motion.button>
                {/* Elegant tooltip on hover */}
                <span className="absolute left-7 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-xs text-violet-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-violet-300/10" style={{ fontWeight: 500, letterSpacing: 0.2 }}>{exp.year}</span>
              </div>
            ))}
            {/* Custom cursor for timeline area */}
            <style>{`
              .group\\/timeline:hover { cursor: url('data:image/svg+xml;utf8,<svg width=24 height=24 xmlns=\'http://www.w3.org/2000/svg\'><circle cx=12 cy=12 r=8 fill=\'none\' stroke=\'%23a78bfa\' stroke-width=2/></svg>') 12 12, pointer; }
            `}</style>
          </div>
          {/* Experiences */}
          <div className="flex-1 flex flex-col gap-32 md:ml-14">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.year}
                ref={el => {
                  expRefs.current[idx] = el;
                }}
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                animate={idx === activeIdx ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.5, y: 60, scale: 0.98 }}
                transition={{
                  duration: 0.7,
                  type: "spring",
                  stiffness: 60,
                  damping: 18,
                }}
                className={`flex flex-col md:flex-row items-center md:items-start gap-10 ${idx === activeIdx ? '' : 'pointer-events-none select-none opacity-60'}`}
                style={{ zIndex: idx === activeIdx ? 2 : 1 }}
              >
                {/* Minimal Checkpoint for mobile */}
                <div className="md:hidden flex w-4 h-4 rounded-full bg-violet-400 border-2 border-white/60 shadow-md mb-4" />
                {/* Image with animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    width={400}
                    height={300}
                    className="object-cover shadow-lg"
                    style={{ borderRadius: 0 }}
                  />
                </motion.div>
                {/* Text */}
                <div className="flex-1 text-left md:pl-4">
                  <div className="text-violet-400 font-semibold text-lg mb-1">
                    {exp.year}
                  </div>
                  <div className="text-2xl font-bold mb-2">{exp.title}</div>
                  <div className="text-base text-white/80">
                    {exp.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
