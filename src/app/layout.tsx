import '../styles/globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import { HoverProvider } from '@/components/HoverContext'
import BackgroundPreview from '@/components/BackgroundPreview' // Check path if needed
import { ClientProvider } from '@/components/ClientProvider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_HANDLE, GITHUB_URL } from '@/lib/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  keywords: ['Sajid Tamboli', 'AI Engineer', 'ML Engineer', 'MCP', 'Model Context Protocol', 'GraphRAG', 'PyTorch', 'NLP', 'Pune', 'Machine Learning'],
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: `${SITE_NAME} — Writing` }] },
  },
  openGraph: {
    type: 'website', url: SITE_URL, siteName: SITE_NAME, locale: 'en_US',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`, description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image', creator: SITE_HANDLE,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`, description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: SITE_NAME, url: SITE_URL, jobTitle: SITE_TAGLINE, sameAs: [GITHUB_URL] },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, description: SITE_DESCRIPTION, publisher: { '@id': `${SITE_URL}/#person` } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-black text-white`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <HoverProvider>
          <ClientProvider>
            {/* BackgroundPreview handles the footer hover color changes */}
            <BackgroundPreview />
            
            {/* 🚨 CRITICAL FIX: Removed "max-w-3xl mx-auto px-4" 
                Changed to "w-full min-h-screen relative" 
            */}
            <div id="main" className="w-full min-h-screen relative overflow-x-hidden">
              {children}
            </div>
          </ClientProvider>
        </HoverProvider>
        <Analytics />
      </body>
    </html>
  )
}