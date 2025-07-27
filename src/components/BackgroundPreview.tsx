// src/components/BackgroundPreview.tsx
'use client'

import { useHover } from '../context/HoverContext'
import { useEffect } from 'react'

const themeMap: Record<string, { bg: string; text: string }> = {
  about: { bg: '#1f2937', text: '#fff' },       // dark gray
  work: { bg: '#0f766e', text: '#fff' },        // teal
  projects: { bg: '#1e40af', text: '#fff' },    // blue
  blog: { bg: '#7c3aed', text: '#fff' },        // violet
  contact: { bg: '#be185d', text: '#fff' },     // rose
  skills: { bg: '#f59e42', text: '#222' },      // orange (example)
  certifications: { bg: '#10b981', text: '#fff' }, // green (example)
}

type SectionKey = keyof typeof themeMap;

export default function BackgroundPreview() {
  const { hovered } = useHover() as { hovered: SectionKey | null }

  useEffect(() => {
    if (hovered && themeMap[hovered]) {
      document.body.style.backgroundColor = themeMap[hovered].bg;
      document.body.style.color = themeMap[hovered].text;
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    // Clean up on unmount
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [hovered]);

  return null;
}
