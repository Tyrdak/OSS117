export default function DossiersSection() {
  return (
    <section id="dossiers" className="py-16">
      <h3 className="text-xl font-semibold">Dossiers confidentiels</h3>
      <div className="mt-4 text-white/70 max-w-2xl">
        Accès restreint. Contenu classifié. Revenez plus tard pour déverrouiller ces informations.
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4 h-28" />
        ))}
      </div>
    </section>
  )
}


