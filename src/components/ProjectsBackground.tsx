import React from "react";

// SVGs for code, for-loops, ML, etc. as subtle background
export default function ProjectsBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* For-loop SVG */}
      <svg width="220" height="80" className="absolute left-10 top-24 opacity-10" style={{filter:'blur(1px)'}}>
        <text x="0" y="40" fontFamily="Fira Mono, monospace" fontSize="22" fill="#38bdf8">for i in range(10):</text>
      </svg>
      {/* If-else SVG */}
      <svg width="180" height="60" className="absolute right-16 top-56 opacity-10" style={{filter:'blur(1px)'}}>
        <text x="0" y="30" fontFamily="Fira Mono, monospace" fontSize="18" fill="#f472b6">if x &gt; 0: else:</text>
      </svg>
      {/* ML/CNN arch SVG */}
      <svg width="180" height="80" className="absolute left-1/2 -translate-x-1/2 bottom-24 opacity-10" style={{filter:'blur(1.5px)'}}>
        <rect x="10" y="30" width="20" height="20" rx="4" fill="#a78bfa" />
        <rect x="50" y="20" width="20" height="40" rx="4" fill="#38bdf8" />
        <rect x="90" y="10" width="20" height="60" rx="4" fill="#f472b6" />
        <rect x="130" y="20" width="20" height="40" rx="4" fill="#a78bfa" />
        <rect x="170" y="30" width="20" height="20" rx="4" fill="#38bdf8" />
      </svg>
      {/* Random code snippet */}
      <svg width="260" height="60" className="absolute right-10 bottom-32 opacity-10" style={{filter:'blur(1.2px)'}}>
        <text x="0" y="30" fontFamily="Fira Mono, monospace" fontSize="16" fill="#a78bfa">def build_project(): ...</text>
      </svg>
    </div>
  );
}
