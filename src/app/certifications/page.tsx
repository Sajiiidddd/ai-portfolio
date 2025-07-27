"use client";
import { useState, useRef, useEffect } from "react";
import InteractiveBackground from "@/components/InteractiveBackground";
import FooterNav from "@/components/FooterNav";
import Image from "next/image";
import { motion } from "framer-motion";

import CertificationsOverlay from "@/components/CertificationsOverlay";

// Data for certifications
const certifications = [
  {
    year: "2023",
    title: "C for Everyone: Structured Programming",
    description: "Gained hands-on experience with C programming fundamentals including memory management, pointers, modular design, and structured programming techniques used in system-level development.",
    image: "/images/Coursera C.jpg", // Placeholder image
    pdfUrl: "https://www.coursera.org/account/accomplishments/verify/FH42HNHEG9XG", // Placeholder PDF
  },
  {
    year: "2023",
    title: "C++ For C Programmers, Part A",
    description: "Gained hands-on experience in core computer science concepts including C and C++ programming, object-oriented design, data structures, algorithms, and graph theory. Built efficient and modular code using OOP principles, applied key graph algorithms, and developed strong debugging skills while adhering to clean coding and foundational programming principles.",
    image: "/images/Coursera C++.jpg", // Placeholder image
    pdfUrl: "https://www.coursera.org/account/accomplishments/verify/5TZTB3DGD9RC", // Placeholder PDF
  },
  {
    year: "2024",
    title: "J.P. Morgan's Software Engineering on Forage",
    description: "Set up a local dev environment by downloading the necessary files, tools and dependencies.Fixed broken files in the repository to make web application output correctly.Used JPMorgan Chase’s open source library called Perspective to generate a live graph that displays a data feed in a clear and visually appealing way for traders to monitor.",
    image: "/images/Forage Certificate.jpg", // Placeholder image
    pdfUrl: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/J.P.%20Morgan/R5iK7HMxJGBgaSbvk_J.P.%20Morgan_ohdxxYhFy7YFhFY9n_1716726541894_completion_certificate.pdf", // Placeholder PDF
  },
  {
    year: "2025",
    title: "Google Cloud Computing Foundations Certificate",
    description: "Gained foundational knowledge in cloud computing, covering key services like Compute Engine, Cloud Storage, BigQuery, and IAM. Developed hands-on skills in cloud infrastructure, application development, and data/ML services — laying the groundwork for roles in cloud engineering, IT infrastructure, and cloud-native development.",
    image: "/images/gcsb1.png", // Placeholder image
    pdfUrl: "https://www.credly.com/badges/a332adad-f3eb-4b8a-90ce-c137c6484548/public_url", // Placeholder PDF
  },
];

export default function CertificationsPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const certRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Function to open PDF in a new tab
  const handleViewPdf = (url: string) => {
    window.open(url, '_blank');
  };

  // Timeline scrubber logic (hover to update)
  const handleTimelineMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const step = rect.height / certifications.length;
    const idx = Math.min(certifications.length - 1, Math.max(0, Math.floor(y / step)));
    setActiveIdx(idx);
  };

  // Scroll effect: update activeIdx as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (!certRefs.current.length) return;
      const offsets = certRefs.current.map(ref => {
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

  return (
    <main className="relative w-full min-h-[100vh] bg-black text-white overflow-x-hidden">
      <InteractiveBackground />

      {/* Fixed Certifications Overlay */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-auto bg-transparent">
        <CertificationsOverlay activeIdx={activeIdx} />
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
            {/* Ultra minimal gradient vertical line with glow - Emerald Green */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[2px] rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, #00E676 0%, #fff0 100%)', // Emerald Green gradient
                boxShadow: '0 0 24px 4px #00E67644', // Emerald Green glow
                opacity: 0.22
              }}
            />
            {/* Checkpoints */}
            {certifications.map((cert, idx) => (
              <div className="relative group" key={cert.title} style={{ top: `calc(${idx} * 120px)` }}>
                <motion.button
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={activeIdx === idx ? { scale: 1.18, opacity: 1, boxShadow: '0 0 0 10px #00E67633, 0 0 32px 8px #00E67655' } : { scale: 0.95, opacity: 0.7, boxShadow: 'none' }} // Emerald Green
                  whileHover={{ scale: 1.28, boxShadow: '0 0 0 16px #00E67622, 0 0 40px 12px #00E67666' }} // Emerald Green
                  whileTap={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  className={`w-4 h-4 rounded-full bg-white/10 flex items-center justify-center outline-none border-none focus-visible:ring-2 focus-visible:ring-[#00E676] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-200 ${activeIdx === idx ? 'bg-[#00E676]' : 'bg-white/10'}`} // Emerald Green
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveIdx(idx);
                    certRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  aria-label={`Go to certification ${idx + 1}`}
                  tabIndex={0}
                  style={{ position: 'relative', zIndex: 2, outline: 'none', border: 'none' }}
                  onFocus={e => setActiveIdx(idx)}
                >
                  {/* Fun icon for active project - Emerald Green */}
                  {activeIdx === idx && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4v12" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                  )}
                  {/* Ripple effect - Emerald Green */}
                  <span className="absolute inset-0 rounded-full pointer-events-none" style={{
                    boxShadow: activeIdx === idx ? '0 0 24px 8px #00E67688' : 'none',
                    opacity: activeIdx === idx ? 0.7 : 0
                  }} />
                </motion.button>
                {/* Elegant tooltip on hover - Emerald Green */}
                <span className="absolute left-7 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-xs text-[#00C853] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-[#00E676]/10" style={{ fontWeight: 500, letterSpacing: 0.2 }}>{cert.year}</span>
              </div>
            ))}
            {/* Custom cursor for timeline area - Emerald Green */}
            <style>{`
              .group\/timeline:hover { cursor: url('data:image/svg+xml;utf8,<svg width=24 height=24 xmlns='http://www.w3.org/2000/svg'><circle cx=12 cy=12 r=8 fill='none' stroke='%2300E676' stroke-width=2/></svg>') 12 12, pointer; }
            `}</style>
          </div>
          {/* Certifications */}
          <div className="flex-1 flex flex-col gap-32 md:ml-14">
            {certifications.map((cert, idx) => (
              <motion.div
                key={cert.title}
                ref={el => {
                  certRefs.current[idx] = el;
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
                {/* Minimal Checkpoint for mobile - Emerald Green */}
                <div className="md:hidden flex w-4 h-4 rounded-full bg-[#00E676] border-2 border-white/60 shadow-md mb-4" />
                {/* Image with animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    width={400}
                    height={300}
                    className="object-cover shadow-lg rounded-lg border border-[#00E676]/20" // Emerald Green border
                  />
                </motion.div>
                {/* Text and PDF button */}
                <div className="flex-1 text-left md:pl-4">
                  <div className="text-[#00E676] font-semibold text-lg mb-1"> {/* Emerald Green */}
                    {cert.year}
                  </div>
                  <div className="text-2xl font-bold mb-2">{cert.title}</div>
                  <div className="text-base text-white/80 mb-4">
                    {cert.description}
                  </div>
                  {cert.pdfUrl && (
                    <motion.button
                      onClick={() => handleViewPdf(cert.pdfUrl)}
                      className="px-6 py-2 rounded-full
                                 bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 font-semibold text-sm
                                 hover:bg-white/10 hover:border-white/20 transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Check Legitimacy
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}