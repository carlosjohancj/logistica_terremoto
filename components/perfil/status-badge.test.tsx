import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatusBadge, getStatusMeta } from "./status-badge"

describe("getStatusMeta", () => {
  it("returns known labels for recognized statuses", () => {
    expect(getStatusMeta("open").label).toBe("Abierto")
    expect(getStatusMeta("pending").label).toBe("Pendiente")
    expect(getStatusMeta("in_progress").label).toBe("En progreso")
  })

  it("capitalizes unknown statuses instead of failing", () => {
    expect(getStatusMeta("weird_status").label).toBe("Weird_status")
  })

  it("returns an empty label fallback when no status is given", () => {
    expect(getStatusMeta(undefined).label).toBe("")
  })
})

describe("StatusBadge", () => {
  it("renders the translated label and a colored dot", () => {
    render(<StatusBadge status="open" />)
    expect(screen.getByText("Abierto")).toBeInTheDocument()
  })

  it("renders nothing when status is not provided", () => {
    const { container } = render(<StatusBadge status={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })
})
