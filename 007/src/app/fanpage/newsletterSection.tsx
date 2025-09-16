import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail] = useState<string>("")
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    try { return localStorage.getItem('newsletter-subscribed') === 'true' } catch { return false }
  })

  function isValidEmail(value: string) {
    return /.+@.+\..+/.test(value)
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) return
    try {
      localStorage.setItem('newsletter-subscribed', 'true')
      localStorage.setItem('bottle-unlocked', 'true')
    } catch {}
    window.dispatchEvent(new Event('bottle:unlock'))
    setSubscribed(true)
  }

  return (
    <section id="newsletter" className="py-16">
      <h3 className="text-xl font-semibold">Newsletter MI6</h3>
      <form className="mt-4 flex gap-3 max-w-md" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 rounded-md bg-white/10 border border-white/20 px-3 h-11 outline-none focus:ring-2 focus:ring-yellow-600"
        />
        <button
          className="h-11 px-4 rounded-md bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-50"
          disabled={!isValidEmail(email)}
        >
          {subscribed ? 'Abonné' : "S'abonner"}
        </button>
      </form>
      <p className="mt-2 text-sm text-white/60">Nous n'enverrons jamais de spam. Promis.</p>
      {subscribed && (
        <p className="mt-2 text-sm text-green-400">Bouteille débloquée. Bon cocktail.</p>
      )}
    </section>
  )
}


