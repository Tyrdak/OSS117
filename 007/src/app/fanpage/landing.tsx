import HeroSection from './heroSection'
import CarrouselSection from './carrouselSection'
import Footer from './footer'
import DossiersSection from './dossiersSection'
import AboutSection from './aboutSection'
import FaqSection from './faqSection'
import NewsletterSection from './newsletterSection'
import StationaryGlass from '../components/stationaryGlass'
import Reset from '../components/reset'

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <StationaryGlass mode="header" />
            <h1 className="text-3xl tracking-widest">AGENT <span className='text-yellow-600'>007</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="opacity-60 text-sm">Fan Page</div>
            <Reset />
          </div>
        </header>

        <div className="relative">
          <HeroSection />
        </div>
        <DossiersSection />
        <CarrouselSection />
        <AboutSection />
        <FaqSection />
        <NewsletterSection />
        <Footer />
      </div>
    </div>
  )
}
