import gadget1 from '../../assets/gadget-1.jpg'
import gadget2 from '../../assets/gadget-2.jpg'
import gadget3 from '../../assets/gadget-3.png'
import gadget4 from '../../assets/gadget-4.webp'
import gadget5 from '../../assets/gadget-5.jpg'
import gadget6 from '../../assets/gadget-6.webp'


export default function DossiersSection() {
  return (
    <section id="dossiers" className="py-16">
      <h3 className="text-xl font-semibold">Gadgets confidentiels</h3>
      <div className="mt-4 text-white/70 max-w-2xl">
        Certains gadget sont classés secrets. 
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[gadget1, gadget2, gadget3, gadget4, gadget5, gadget6].map((src, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4 h-38">
            <img src={src} alt={`Gadget ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  )
}


