import Button from './button'

export default function Reset() {
  function handleReset() {
    try {
      localStorage.removeItem('olive-pos')
      localStorage.removeItem('bottle-pos')
      localStorage.removeItem('bottle-unlocked')
      localStorage.removeItem('newsletter-subscribed')
      localStorage.removeItem('glass-filled')
    } catch {}
    // Rechargement complet pour repartir de zéro
    window.location.reload()
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleReset} title="Réinitialiser l'expérience">
      Reset
    </Button>
  )
}


