import React, { useEffect, useState } from "react";

// A minimal, animated GitHub-style commit grid, stacked like a game
export default function ProjectsCommitStackBg() {
  const rows = 7;
  const cols = 20;
  const shades = [
    '#161e1e', // empty
    '#214d29', // low
    '#267c2b', // med
    '#39d353', // high
    '#9be9a8', // very high
  ];
  // State to hold the grid colors
  const [grid, setGrid] = useState<string[][] | null>(null);

  useEffect(() => {
    // Generate the grid only on the client
    const newGrid: string[][] = Array.from({ length: cols }).map(() =>
      Array.from({ length: rows }).map(() =>
        shades[Math.floor(Math.random() * shades.length)]
      )
    );
    setGrid(newGrid);
  }, []);

  if (!grid) return null; // Don't render on server

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <svg width={cols * 16} height={rows * 16} className="opacity-20" style={{filter:'blur(0.5px)'}}>
        {grid.map((col, c) => (
          col.map((color, r) => (
            <rect
              key={c + '-' + r}
              x={c * 16}
              y={r * 16}
              width={12}
              height={12}
              rx={3}
              fill={color}
              style={{
                opacity: 0.7,
                transform: 'translateY(-40px)',
                animation: `dropin 0.7s cubic-bezier(.6,2,.4,1) forwards`,
                animationDelay: `${0.04 * c + 0.01 * r}s`,
              }}
            />
          ))
        ))}
        <style>{`
          @keyframes dropin {
            to { transform: translateY(0); }
          }
        `}</style>
      </svg>
    </div>
  );
}
