export default function FaqSection() {
  return (
    <section id="faq" className="py-16">
      <h3 className="text-xl font-semibold">FAQ</h3>
      <div className="mt-6 space-y-4 text-white/80">
        <details className="rounded-lg border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer">Cette page est-elle officielle ?</summary>
          <p className="mt-2 text-sm text-white/70">Non, il s'agit d'un projet pédagogique.</p>
        </details>
        <details className="rounded-lg border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer">Le QG secret existe-t-il vraiment ?</summary>
          <p className="mt-2 text-sm text-white/70">Peut‑être. Trouvez l'olive, puis versez le martini…</p>
        </details>
      </div>
    </section>
  )
}


