import { useEffect, useState } from 'react'
import bottleUrl from '../../assets/martini-bottle.svg'

type Point = { x: number; y: number }

export default function DraggableBottle() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('bottle-unlocked') === 'true' } catch { return false }
  })
  const [pos, setPos] = useState<Point>(() => {
    try {
      const raw = localStorage.getItem('bottle-pos')
      if (raw) return JSON.parse(raw) as Point
    } catch {}
    return { x: 320, y: 80 }
  })
  const [dragging, setDragging] = useState<boolean>(false)
  const [hidden, setHidden] = useState<boolean>(() => {
    try { return localStorage.getItem('glass-filled') === 'true' } catch { return false }
  })
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bottle-unlocked') {
        setEnabled(e.newValue === 'true')
      }
    }
    const onCustom = () => setEnabled(true)
    window.addEventListener('storage', onStorage)
    window.addEventListener('bottle:unlock', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('bottle:unlock', onCustom as EventListener)
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('bottle-pos', JSON.stringify(pos)) } catch {}
    const detail = { x: pos.x, y: pos.y, width: 56, height: 160 }
    window.dispatchEvent(new CustomEvent('bottle:move', { detail }))
  }, [pos])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const x = (e.pageX ?? e.clientX + window.scrollX) - offset.x
      const y = (e.pageY ?? e.clientY + window.scrollY) - offset.y
      setPos({ x, y })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    const onFilled = () => setHidden(true)
    const onEmptied = () => setHidden(false)
    window.addEventListener('glass:filled', onFilled)
    window.addEventListener('glass:emptied', onEmptied)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('glass:filled', onFilled)
      window.removeEventListener('glass:emptied', onEmptied)
    }
  }, [dragging, offset])

  if (!enabled || hidden) return null

  return (
    <div
      role="img"
      aria-label="Bouteille de martini"
      title="Bouteille de martini"
      onPointerDown={(e) => {
        const target = e.currentTarget as HTMLDivElement
        const rect = target.getBoundingClientRect()
        setDragging(true)
        const native: any = e.nativeEvent as any
        const ox = typeof native?.offsetX === 'number' ? native.offsetX : e.clientX - rect.left
        const oy = typeof native?.offsetY === 'number' ? native.offsetY : e.clientY - rect.top
        setOffset({ x: ox, y: oy })
      }}
      style={{ left: pos.x, top: pos.y }}
      className="absolute z-[9998] w-14 md:w-18 h-40 md:h-54 cursor-grab active:cursor-grabbing select-none"
    >
      <img src={bottleUrl} alt="Bouteille de martini" className="w-full h-full object-contain" draggable={false} />
    </div>
  )
}


