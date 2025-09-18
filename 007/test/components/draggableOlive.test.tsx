import { render, screen, fireEvent, act } from "@testing-library/react"
import DraggableOlive from "../../src/app/components/draggableOlive"

beforeEach(() => {
  localStorage.clear()
})

describe("DraggableOlive", () => {
  test("n'apparaît pas quand le verre est rempli", () => {
    localStorage.setItem("glass-filled", "true")
    render(<DraggableOlive />)
    expect(screen.queryByTitle(/olive secrète/i)).toBeNull()
  })

  test("apparaît quand le verre n'est pas rempli", () => {
    localStorage.removeItem("glass-filled")
    render(<DraggableOlive />)
    expect(screen.getByTitle(/olive secrète/i)).toBeInTheDocument()
  })

  test("devient cachée après l’événement 'glass:filled' puis réapparaît avec 'glass:emptied'", async () => {
    render(<DraggableOlive />)
    expect(screen.getByTitle(/olive secrète/i)).toBeInTheDocument()

    await act(async () => {
      window.dispatchEvent(new Event('glass:filled'))
    })
    expect(screen.queryByTitle(/olive secrète/i)).toBeNull()

    await act(async () => {
      window.dispatchEvent(new Event('glass:emptied'))
    })
    expect(screen.getByTitle(/olive secrète/i)).toBeInTheDocument()
  })

  test("peut être déplacée via pointer events", async () => {
    render(<DraggableOlive />)
    const olive = screen.getByTitle(/olive secrète/i)
    expect(olive).toBeInTheDocument()

    await act(async () => {
      fireEvent.pointerDown(olive, { clientX: 50, clientY: 50 })
      fireEvent.pointerMove(window, { pageX: 120, pageY: 140 })
      fireEvent.pointerUp(window)
    })

    const style = (olive as HTMLElement).style
    expect(style.left).not.toBe("")
    expect(style.top).not.toBe("")
  })
})


