import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PathAI Studio — AI Digital Pathology Platform',
  description: 'Upload whole-slide images and get AI-powered cancer subtype predictions, mutation scores, and attention heatmaps. Powered by GigaPath and UNI 2 foundation models.',
  keywords: ['digital pathology', 'AI pathology', 'GigaPath', 'UNI 2', 'whole-slide imaging', 'cancer detection'],
  authors: [{ name: 'PathAI Studio' }],
  openGraph: {
    title: 'PathAI Studio — AI Digital Pathology Platform',
    description: 'Professional AI pathology analysis powered by Microsoft GigaPath and Harvard UNI 2.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PathAI Studio — AI Digital Pathology Platform',
    description: 'Upload whole-slide images and get AI-powered cancer subtype predictions.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-charcoal text-cream font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}