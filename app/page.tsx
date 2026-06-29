import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import TrustSection from '@/components/home/TrustSection'
import BrandCarousel from '@/components/home/BrandCarousel'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <TrustSection />
      <BrandCarousel />
    </>
  )
}
