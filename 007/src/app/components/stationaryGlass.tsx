import { useEffect, useRef, useState } from 'react'
import glassEmptyUrl from '../../assets/martini-glasses.svg'
import glassFullUrl from '../../assets/martini-glasses-full.svg'
import Button from './button'

type MoveDetail = { x: number; y: number; width?: number; height?: number }

type Mode = 'overlay' | 'header'

export default function StationaryGlass({ mode = 'overlay' }: { mode?: Mode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const oliveRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const bottleRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const [oliveOver, setOliveOver] = useState<boolean>(false)
  const [bottleOver, setBottleOver] = useState<boolean>(false)
  const [filled, setFilled] = useState<boolean>(() => {
    try { return localStorage.getItem('glass-filled') === 'true' } catch { return false }
  })

  useEffect(() => {
    if (oliveOver && bottleOver && !filled) {
      setFilled(true)
      try { localStorage.setItem('glass-filled', 'true') } catch {}
      window.dispatchEvent(new Event('glass:filled'))
    }
  }, [oliveOver, bottleOver, filled])

  useEffect(() => {
    const handler = (e: CustomEvent<MoveDetail>, kind: 'olive' | 'bottle') => {
      const el = ref.current
      if (!el) return
      const glass = el.getBoundingClientRect()
      const pad = 12
      // Convertit en viewport
      const x = e.detail.x - window.scrollX
      const y = e.detail.y - window.scrollY
      const w = e.detail.width ?? 0
      const h = e.detail.height ?? 0
      const rect = { x, y, w, h }

      if (kind === 'olive') oliveRectRef.current = rect
      else bottleRectRef.current = rect

      const computeOver = (r: { x: number; y: number; w: number; h: number } | null) => {
        if (!r) return false
        const left = r.x
        const right = r.x + r.w
        const top = r.y
        const bottom = r.y + r.h
        return (
          right > glass.left - pad &&
          left < glass.right + pad &&
          bottom > glass.top - pad &&
          top < glass.bottom + pad
        )
      }

      const oliveOverNow = computeOver(oliveRectRef.current)
      const bottleOverNow = computeOver(bottleRectRef.current)
      setOliveOver(oliveOverNow)
      setBottleOver(bottleOverNow)
    }
    const onOlive = (e: Event) => handler(e as CustomEvent<MoveDetail>, 'olive')
    const onBottle = (e: Event) => handler(e as CustomEvent<MoveDetail>, 'bottle')
    window.addEventListener('olive:move', onOlive as EventListener)
    window.addEventListener('bottle:move', onBottle as EventListener)
    return () => {
      window.removeEventListener('olive:move', onOlive as EventListener)
      window.removeEventListener('bottle:move', onBottle as EventListener)
    }
  }, [])

  if (mode === 'header') {
    return (
      <div className="relative flex items-center select-none">
        <div ref={ref} className="relative w-20 h-20" aria-label="verre">
          <img src={glassEmptyUrl} alt="Verre" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
          <img
            src={glassFullUrl}
            alt="Verre plein"
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: filled ? 1 : 0 }}
            draggable={false}
          />
        </div>
        {filled && (
          <a href="#/control" className="ml-3">
            <Button size="sm">QG secret</Button>
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={ref} className="absolute left-8 bottom-8 w-20 h-24 select-none" aria-label="verre">
        <img src={glassEmptyUrl} alt="Verre" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
        <img
          src={glassFullUrl}
          alt="Verre plein"
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
          style={{ opacity: filled ? 1 : 0 }}
          draggable={false}
        />
      </div>

      {filled && (
        <div className="absolute left-8 bottom-56">
          <a href="#/control">
            <Button size="lg">Accéder au QG secret</Button>
          </a>
        </div>
      )}
    </div>
  )
}


