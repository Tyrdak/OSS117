import jamesBond5 from '../../assets/james-bond-5.jpg'
import Button from '../components/button'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center py-20 overflow-hidden">
      {/* Background */}
      <img src={jamesBond5} alt="Agent 007" className="absolute inset-0 w-full h-full object-cover rounded-4xl" />
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <h2 className="text-5xl md:text-6xl font-semibold leading-tight">
          James Bond
          <span className="block text-yellow-600">Licence to Thrill</span>
        </h2>
        <p className="mt-6 text-gray-200 leading-relaxed max-w-2xl">
          Bienvenue sur la fan page hommage à l'agent secret le plus célèbre. Dossiers,
          gadgets, voitures, et missions iconiques réunis ici.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#dossiers">
            <Button size="lg">Explorer les dossiers</Button>
          </a>
          <a href="#gadgets">
            <Button variant="secondary" size="lg">Voir les gadgets</Button>
          </a>
        </div>
      </div>

      {/* Decorative gradient edges */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
    </section>
  )
}


