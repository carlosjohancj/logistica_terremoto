import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { createSupabaseMock } from "@/test/supabase-mock"

const mockClient = createSupabaseMock({ user: { id: "user-1" } })

vi.mock("@/types/supabase", () => ({
  getSupabase: () => mockClient,
}))

import MensajesPanel from "./mensajes-panel"

describe("MensajesPanel", () => {
  it("shows an empty state when the user has no conversations", async () => {
    render(<MensajesPanel />)

    expect(await screen.findByText("No tienes conversaciones aún")).toBeInTheDocument()
    expect(mockClient.auth.getUser).toHaveBeenCalled()
  })
})
