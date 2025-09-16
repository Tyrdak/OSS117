import jamesBond1 from '../../assets/james-bond-1.jpg'
import jamesBond2 from '../../assets/james-bond-2.avif'
import jamesBond3 from '../../assets/james-bond-3.webp'
import jamesBond4 from '../../assets/james-bond-4.jpeg'


export default function CarrouselSection() {
  return (
    <section id="gadgets" className="py-16">
      <h3 className="text-xl font-semibold">Gadgets iconiques</h3>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/80">
        {[
          'Aston Martin DB5',
          'Montre laser',
          'Stylo explosif',
          'Chaise éjectable',
          'Valise Q Branch',
          'Mini sous-marin',
          'Téléphone crypté',
          'Carte 00'
        ].map((item) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
            {item}
          </div>
        ))}
      </div>
      <h3 className="text-xl font-semibold pt-10 pb-4">Photos emblématiques</h3>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/80">
        <img src={jamesBond1} alt="Agent 007" className="w-full h-full object-cover rounded-lg hover:scale-105 transition-all duration-300" />
        <img src={jamesBond2} alt="Agent 007" className="w-full h-full object-cover rounded-lg hover:scale-105 transition-all duration-300" />
        <img src={jamesBond3} alt="Agent 007" className="w-full h-full object-cover rounded-lg hover:scale-105 transition-all duration-300" />
        <img src={jamesBond4} alt="Agent 007" className="w-full h-full object-cover rounded-lg hover:scale-105 transition-all duration-300" />
      </div>

    </section>
  )
}


