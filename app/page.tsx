import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import GuideLinksSection from '@/components/home/GuideLinksSection'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import BestsellersSection from '@/components/home/BestsellersSection'
import TrustSection from '@/components/home/TrustSection'
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel'
import BrandCarousel from '@/components/home/BrandCarousel'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <GuideLinksSection />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <TestimonialsCarousel />
      <BrandCarousel />
    </>
  )
}
