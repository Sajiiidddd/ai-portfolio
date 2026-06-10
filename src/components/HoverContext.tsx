// context/HoverContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'

// Define the union type for all possible section keys
// This MUST match the 'hoverKey' values in your FooterNav's links array.
export type SectionKey =
  'about' |
  'work' | // Corresponds to 'Experience'
  'projects' |
  'blog' |
  'contact' |
  'skills' |
  'certifications' |
  'recommendations' |
  null; // IMPORTANT: include null as you also set it to null

type HoverState = {
  section: SectionKey
  setSection: (section: SectionKey) => void
}

const HoverContext = createContext<HoverState | undefined>(undefined)

export const HoverProvider = ({ children }: { children: React.ReactNode }) => {
  const [section, setSection] = useState<SectionKey>(null)

  return (
    <HoverContext.Provider value={{ section, setSection }}>
      {children}
    </HoverContext.Provider>
  )
}

// This is the correct export name for the hook
export const useHoverSection = () => {
  const context = useContext(HoverContext)
  if (!context) {
    throw new Error('useHoverSection must be used within HoverProvider')
  }
  return context
}

