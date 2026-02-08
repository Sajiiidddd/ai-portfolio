'use client';

import { useRef, useEffect } from 'react';

interface DecipherTextGlitchProps {
  text?: string;
  glitchColors?: string[];
  className?: string;
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  revealSpeed?: number; 
  onComplete?: () => void;
}

const DecipherTextGlitch = ({
  text = "SYSTEM BREACH DETECTED",
  glitchColors = ['#22d3ee', '#94a3b8', '#475569', '#0e7490'], 
  className = '',
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
  revealSpeed = 10,
  onComplete,
}: DecipherTextGlitchProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<any[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());
  const decipherProgress = useRef(0);
  const completedRef = useRef(false); 
  
  const lettersAndSymbols = Array.from(characters);
  const fontSize = 24; 
  const charWidth = 16;
  const charHeight = 30;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  };

  const getTextCoordinates = (cols: number, rows: number) => {
    const textLen = text.length;
    const startCol = Math.floor((cols - textLen) / 2);
    const startRow = Math.floor(rows / 2);
    return { startCol, startRow };
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    const { startCol, startRow } = getTextCoordinates(columns, rows);

    letters.current = Array.from({ length: totalLetters }, (_, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const isMessageChar = row === startRow && col >= startCol && col < startCol + text.length;

      return {
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1,
        isMessage: isMessageChar,
        messageChar: isMessageChar ? text[col - startCol] : null,
        revealed: false
      };
    });
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    // ✅ FIX: Added check for !canvasRef.current to prevent null crash
    const canvas = canvasRef.current;
    if (!context.current || letters.current.length === 0 || !canvas) return;

    const ctx = context.current;
    const { width, height } = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, width, height);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;

      if (letter.isMessage && letter.revealed) {
        ctx.fillStyle = '#67e8f9'; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#67e8f9';
        ctx.fillText(letter.messageChar, x, y);
        ctx.shadowBlur = 0; 
      } else {
        ctx.fillStyle = letter.color; 
        ctx.globalAlpha = 0.6;
        ctx.fillText(letter.char, x, y);
        ctx.globalAlpha = 1.0;
      }
    });
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;
      if (letters.current[index].revealed) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();
      letters.current[index].color = letters.current[index].targetColor;
    }

    decipherProgress.current += (revealSpeed / 500); 
    
    const unrevealed = letters.current.filter(l => l.isMessage && !l.revealed);
    
    if (unrevealed.length === 0 && !completedRef.current) {
        completedRef.current = true;
        if (onComplete) {
            setTimeout(onComplete, 800); 
        }
    }

    unrevealed.forEach(letter => {
        if (Math.random() < decipherProgress.current * 0.1) {
            letter.revealed = true;
            letter.char = letter.messageChar; 
        }
    });
  };

  const animate = () => {
    // Safety check: stop if component unmounted
    if (!canvasRef.current) return;

    const now = Date.now();
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = now;
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext('2d');
    resizeCanvas();
    animate();

    let resizeTimeout: any;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if(animationRef.current) cancelAnimationFrame(animationRef.current);
        resizeCanvas();
        animate();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if(animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [glitchSpeed, smooth, text]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden'
  };

  const canvasStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%'
  };

  const outerVignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)'
  };

  const centerVignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 50%)' 
  };

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle}></div>}
      {centerVignette && <div style={centerVignetteStyle}></div>}
    </div>
  );
};

export default DecipherTextGlitch;