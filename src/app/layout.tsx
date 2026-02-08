import '../styles/globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import { HoverProvider } from '@/components/HoverContext'
import BackgroundPreview from '@/components/BackgroundPreview' // Check path if needed
import { ClientProvider } from '@/components/ClientProvider'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata = {
  title: 'Sajid Tamboli | AI Jedi',
  description: 'A sleek portfolio crafted for intelligent design.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-black text-white`}>
        <HoverProvider>
          <ClientProvider>
            {/* BackgroundPreview handles the footer hover color changes */}
            <BackgroundPreview />
            
            {/* 🚨 CRITICAL FIX: Removed "max-w-3xl mx-auto px-4" 
                Changed to "w-full min-h-screen relative" 
            */}
            <main className="w-full min-h-screen relative overflow-x-hidden">
              {children}
            </main>
          </ClientProvider>
        </HoverProvider>
        <Analytics />
      </body>
    </html>
  )
}