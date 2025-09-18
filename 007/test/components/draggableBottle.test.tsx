import { render, screen, fireEvent, act } from "@testing-library/react"
import DraggableBottle from "../../src/app/components/draggableBottle"

beforeEach(() => {
  localStorage.clear()
})

describe("DraggableBottle", () => {
  test("ne s'affiche pas si la bouteille est verrouillée", () => {
    localStorage.setItem("bottle-unlocked", "false")
    render(<DraggableBottle />)
    expect(screen.queryByTitle(/bouteille de martini/i)).toBeNull()
  })

  test("s'affiche si la bouteille est déverrouillée", () => {
    localStorage.setItem("bottle-unlocked", "true")
    render(<DraggableBottle />)
    expect(screen.getByTitle(/bouteille de martini/i)).toBeInTheDocument()
  })

  test("ne s'affiche pas si le verre est rempli", () => {
    localStorage.setItem("bottle-unlocked", "true")
    localStorage.setItem("glass-filled", "true")
    render(<DraggableBottle />)
    expect(screen.queryByTitle(/bouteille de martini/i)).toBeNull()
  })

  test("devient visible après l'événement custom 'bottle:unlock'", async () => {
    render(<DraggableBottle />)
    expect(screen.queryByTitle(/bouteille de martini/i)).toBeNull()

    await act(async () => {
      window.dispatchEvent(new Event("bottle:unlock"))
    })

    expect(screen.getByTitle(/bouteille de martini/i)).toBeInTheDocument()
  })

  test("peut être déplacée (pointer events)", async () => {
    localStorage.setItem("bottle-unlocked", "true")
    render(<DraggableBottle />)

    const bottle = screen.getByTitle(/bouteille de martini/i)
    expect(bottle).toBeInTheDocument()

    await act(async () => {
      fireEvent.pointerDown(bottle, { clientX: 100, clientY: 100 })
      fireEvent.pointerMove(window, { pageX: 150, pageY: 200 })
      fireEvent.pointerUp(window)
    })

    expect((bottle as HTMLElement).style.left).not.toBe("")
    expect((bottle as HTMLElement).style.top).not.toBe("")
  })
})
