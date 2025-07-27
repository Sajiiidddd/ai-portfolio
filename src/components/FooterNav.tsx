'use client'

import { motion } from 'framer-motion'
import { useHoverSection } from '@/components/HoverContext' 

const links = [
  { name: 'About', href: '/', hoverKey: 'about' as const },
  { name: 'Experience', href: '/experience', hoverKey: 'work' as const },
  { name: 'Projects', href: '/projects', hoverKey: 'projects' as const },
  { name: 'Blogs', href: '/blogs', hoverKey: 'blog' as const },
  { name: 'Contact', href: '/contact', hoverKey: 'contact' as const },
  { name: 'Skills', href: '/skills', hoverKey: 'skills' as const },
//  { name: 'Recommendations', href: '/recommendations', hoverKey: 'recommendations' as const },
  { name: 'Certifications', href: '/certifications', hoverKey: 'certifications' as const },
]

export default function FooterNav() {
  const { setSection } = useHoverSection()

  return (
    <motion.footer
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            delay: 1,
            staggerChildren: 0.15,
          },
        },
      }}
      className="absolute bottom-0 left-0 right-0 z-30 px-6 py-4 flex justify-between text-white uppercase text-sm tracking-widest"
    >
      {links.map((link) => (
        <motion.a
          key={link.name}
          href={link.href}
          onMouseEnter={() => setSection(link.hoverKey)}
          onMouseLeave={() => setSection(null)}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hover:opacity-70 transition"
        >
          {link.name}
        </motion.a>
      ))}
    </motion.footer>
  )
}



