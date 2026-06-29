import type { Metadata } from 'next'
import './globals.css'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Selleria Galazzo — Articoli Equestri Online',
  description: 'Selleria online specializzata in articoli per equitazione, monta inglese, western e prodotti per la scuderia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementBar />
          <Navbar />
        </div>
        <main className="pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
