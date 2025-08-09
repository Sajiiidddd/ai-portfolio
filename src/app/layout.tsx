import '../styles/globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import { HoverProvider } from '@/components/HoverContext'
import BackgroundPreview from '../components/BackgroundPreview'
import { ClientProvider } from '@/components/ClientProvider'
import { Analytics } from '@vercel/analytics/next' // <-- NEW

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata = {
  title: 'Sajid Tamboli | AI Jedi',
  description: 'A sleek portfolio crafted for intelligent design.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <HoverProvider>
          <ClientProvider>
            <BackgroundPreview />
            {/* Responsive main wrapper for all pages */}
            <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </ClientProvider>
        </HoverProvider>
        <Analytics /> {/* Vercel Analytics */}
      </body>
    </html>
  )
}












