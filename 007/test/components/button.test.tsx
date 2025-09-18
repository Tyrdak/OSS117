import { render, screen, fireEvent } from "@testing-library/react"
import Button from "../../src/app/components/button" 

describe("Button component", () => {
  it("rend le texte du bouton", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("applique la classe du variant 'primary' par défaut", () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toMatch(/bg-yellow-600/)
  })

  it("applique la classe du variant 'danger'", () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toMatch(/bg-red-600/)
  })

  it("applique la classe de taille 'lg'", () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toMatch(/h-12/)
  })

  it("désactive le bouton quand isLoading = true", () => {
    render(<Button isLoading>Loading</Button>)
    const btn = screen.getByRole("button")
    expect(btn).toBeDisabled()
  })

  it("affiche le spinner quand isLoading = true", () => {
    render(<Button isLoading>Loading</Button>)
    expect(document.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
  })

  it("rend un leftIcon et un rightIcon", () => {
    render(
      <Button leftIcon={<span>👈</span>} rightIcon={<span>👉</span>}>
        Icons
      </Button>
    )
    expect(screen.getByText("👈")).toBeInTheDocument()
    expect(screen.getByText("👉")).toBeInTheDocument()
  })

  it("appelle onClick quand cliqué", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText("Click"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
