import type { Metadata } from 'next'
import './globals.css'
import ChromeGate from '@/components/layout/ChromeGate'
import CookieBanner from '@/components/layout/CookieBanner'

export const metadata: Metadata = {
  title: 'Selleria Galazzo — Articoli Equestri Online',
  description: 'Selleria online specializzata in articoli per equitazione, monta inglese, western e prodotti per la scuderia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="antialiased">
        <ChromeGate>{children}</ChromeGate>
        <CookieBanner />
      </body>
    </html>
  )
}
