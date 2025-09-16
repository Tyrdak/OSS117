import { useEffect, useState } from 'react'
import oliveUrl from '../../assets/olive.svg'

type Point = { x: number; y: number }

export default function DraggableOlive() {
  const [pos, setPos] = useState<Point>(() => {
    // Try to restore previous position
    try {
      const raw = localStorage.getItem('olive-pos')
      if (raw) return JSON.parse(raw) as Point
    } catch {}
    return { x: 24, y: 24 }
  })
  const [dragging, setDragging] = useState<boolean>(false)
  const [hidden, setHidden] = useState<boolean>(() => {
    try { return localStorage.getItem('glass-filled') === 'true' } catch { return false }
  })
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })

  useEffect(() => {
    try {
      localStorage.setItem('olive-pos', JSON.stringify(pos))
    } catch {}
    const detail = { x: pos.x, y: pos.y, width: 40, height: 40 }
    window.dispatchEvent(new CustomEvent('olive:move', { detail }))
  }, [pos])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      // Use pageX/pageY so the position is scroll-aware and sticks to the page
      const x = (e.pageX ?? e.clientX + window.scrollX) - offset.x
      const y = (e.pageY ?? e.clientY + window.scrollY) - offset.y
      setPos({ x, y })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    const onFilled = () => {
      setHidden(true)
    }
    window.addEventListener('glass:filled', onFilled)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('glass:filled', onFilled)
    }
  }, [dragging, offset])

  if (hidden) return null

  return (
    <div
      role="img"
      aria-label="Olive"
      title="Olive secrète"
      onPointerDown={(e) => {
        const target = e.currentTarget as HTMLDivElement
        const rect = target.getBoundingClientRect()
        setDragging(true)
        // Prefer offsetX/offsetY when available, else compute from rect
        const native: any = e.nativeEvent as any
        const ox = typeof native?.offsetX === 'number' ? native.offsetX : e.clientX - rect.left
        const oy = typeof native?.offsetY === 'number' ? native.offsetY : e.clientY - rect.top
        setOffset({ x: ox, y: oy })
      }}
      style={{ left: pos.x, top: pos.y }}
      className="absolute z-[9999] w-10 h-10 cursor-grab active:cursor-grabbing select-none"
    >
      <img src={oliveUrl} alt="Olive" className="w-full h-full object-contain" draggable={false} />
    </div>
  )
}


