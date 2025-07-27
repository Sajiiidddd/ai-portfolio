'use client'
import { createContext, useContext, useState } from 'react'

type NavItem = 'about' | 'work' | 'projects' | 'blog' | 'contact' | 'skills' | 'certifications' | null

interface HoverContextProps {
  hovered: NavItem
  setHovered: (value: NavItem) => void
}

const HoverContext = createContext<HoverContextProps>({
  hovered: null,
  setHovered: () => {},
})

export const HoverProvider = ({ children }: { children: React.ReactNode }) => {
  const [hovered, setHovered] = useState<NavItem>(null)

  return (
    <HoverContext.Provider value={{ hovered, setHovered }}>
      {children}
    </HoverContext.Provider>
  )
}

export const useHover = () => useContext(HoverContext)
