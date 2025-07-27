import '../styles/globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import { HoverProvider } from '@/components/HoverContext'
import BackgroundPreview from '../components/BackgroundPreview'
import { ClientProvider } from '@/components/ClientProvider' // <--- added

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata = {
  title: 'Sajid Tamboli | AI x Web3 Developer',
  description: 'Portfolio inspired by Studio Yoke — Minimal, Elegant, Functional.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <HoverProvider>
          <ClientProvider> {/* 🧠 Wrap everything in anonId context */}
            <BackgroundPreview />
            {children}
          </ClientProvider>
        </HoverProvider>
      </body>
    </html>
  )
}











