// components/SkillClusterCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface NodeType {
  id: string;
  label: string;
  icon: string;
  level: 'rookie' | 'intermediate' | 'advanced';
}

interface SkillClusterCanvasProps {
  hoveredSkill: string | null;
  setHoveredSkill: (id: string | null) => void;
  setLevelOverlay: (overlay: { cluster: string; level: string } | null) => void;
}

const nodes: NodeType[] = [
  { id: 'python', label: 'Python', icon: '/skills/python.svg', level: 'advanced' },
  { id: 'r', label: 'R', icon: '/skills/r.svg', level: 'rookie' },
  { id: 'cpp', label: 'C++', icon: '/skills/cpp.svg', level: 'intermediate' },
  { id: 'react', label: 'React', icon: '/skills/react.svg', level: 'intermediate' },
  { id: 'tensorflow', label: 'TensorFlow', icon: '/skills/tensorflow.svg', level: 'advanced' },
  { id: 'huggingface', label: 'HuggingFace', icon: '/skills/huggingface.svg', level: 'advanced' },
  { id: 'docker', label: 'Docker', icon: '/skills/docker.svg', level: 'intermediate' },
  { id: 'git', label: 'Git', icon: '/skills/git.svg', level: 'advanced' },
  { id: 'htmlcss', label: 'HTML/CSS', icon: '/skills/html.svg', level: 'rookie' },
  { id: 'fastapi', label: 'FastAPI', icon: '/skills/fastapi.svg', level: 'advanced' },
  { id: 'sql', label: 'SQL', icon: '/skills/sql.svg', level: 'advanced' },
  { id: 'nodejs', label: 'Node.js', icon: '/skills/nodejs.svg', level: 'intermediate' },
];

const baseRadii = {
  rookie: 90,
  intermediate: 130,
  advanced: 170,
};

const SkillClusterCanvas = ({ hoveredSkill, setHoveredSkill, setLevelOverlay }: SkillClusterCanvasProps) => {
  const [theta, setTheta] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [breathe, setBreathe] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  const rings = {
    rookie: nodes.filter(n => n.level === 'rookie'),
    intermediate: nodes.filter(n => n.level === 'intermediate'),
    advanced: nodes.filter(n => n.level === 'advanced'),
  };

  useEffect(() => {
    const animate = () => {
      setTheta(prev => prev + 0.001);
      setBreathe(prev => prev + 0.02);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCenter({ x: rect.width / 2, y: rect.height / 2 });
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setZoom(prev => Math.min(2, Math.max(0.5, prev - e.deltaY * 0.001)));
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const renderRing = (level: 'rookie' | 'intermediate' | 'advanced', nodesInRing: NodeType[]) => {
    const baseRadius = baseRadii[level];
    const breathOffset = Math.sin(breathe + (level === 'rookie' ? 0 : level === 'intermediate' ? 0.5 : 1)) * 6;
    const radius = (baseRadius + breathOffset) * zoom;
    const angleStep = (2 * Math.PI) / nodesInRing.length;

    return nodesInRing.map((n, i) => {
      const angle = theta + i * angleStep;
      let x = center.x + radius * Math.cos(angle);
      let y = center.y + radius * Math.sin(angle);

      const isActive = hoveredSkill === n.id;

      const dx = mousePos.x - x;
      const dy = mousePos.y - y;
      const distSq = dx * dx + dy * dy;
      const gravityThreshold = 200 * 200;

      if (distSq < gravityThreshold) {
        const dist = Math.sqrt(distSq);
        const gravityPull = ((gravityThreshold - distSq) / gravityThreshold) * 0.15;
        const damping = 0.9;
        x += (dx / dist) * gravityPull * damping;
        y += (dy / dist) * gravityPull * damping;
      }

      return (
        <g
          key={n.id}
          transform={`translate(${x},${y})`}
          onMouseEnter={() => {
            setHoveredSkill(n.id);
            setLevelOverlay({ cluster: n.label, level: n.level });
            setActiveLevel(n.level);
          }}
          onMouseLeave={() => {
            setHoveredSkill(null);
            setLevelOverlay(null);
            setActiveLevel(null);
          }}
          style={{ cursor: 'pointer' }}
        >
          <image
            href={n.icon}
            x={-20}
            y={-20}
            width={40}
            height={40}
            style={{
              filter: isActive ? 'grayscale(0)' : 'grayscale(1)',
              transform: `scale(${isActive ? 1.15 : 1})`,
              transition: 'all 0.3s ease',
            }}
          />
          <text
            x={0}
            y={35}
            fill="white"
            textAnchor="middle"
            fontSize="10"
            style={{
              opacity: isActive ? 1 : 0.2,
              transition: 'opacity 0.3s ease',
            }}
          >
            {n.label}
          </text>
        </g>
      );
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      <svg className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {renderRing('rookie', rings.rookie)}
        {renderRing('intermediate', rings.intermediate)}
        {renderRing('advanced', rings.advanced)}
      </svg>
    </div>
  );
};

export default SkillClusterCanvas;









