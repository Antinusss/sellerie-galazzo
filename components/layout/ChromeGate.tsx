'use client'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import Footer from './Footer'

const MINIMAL_CHROME_PATHS = ['/checkout', '/checkout/success']

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const minimal = MINIMAL_CHROME_PATHS.includes(pathname)

  if (minimal) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="relative h-10 w-[93px]">
              <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain object-left" priority />
            </Link>
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Lock size={14} />
              Pagamento sicuro
            </span>
          </div>
        </div>
        <main className="pt-16">{children}</main>
      </>
    )
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
        <Navbar />
      </div>
      <main className="pt-24 md:pt-36">{children}</main>
      <Footer />
    </>
  )
}
