import { describe, expect, it, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { loginUser } from "@/lib/auth"
import { renderWithIntl } from "@/test/test-utils"

const pushMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/es/auth/login",
}))

vi.mock("@/lib/auth", () => ({
  loginUser: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import LoginPage from "./page"

function renderPage() {
  return renderWithIntl(<LoginPage />)
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, { email, password }: { email?: string; password?: string }) {
  if (email !== undefined) await user.type(screen.getByLabelText(/Correo electrónico/), email)
  if (password !== undefined) await user.type(screen.getByLabelText(/Contraseña/), password)
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requires both email and password", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(await screen.findAllByText("Este campo es requerido")).toHaveLength(2)
    expect(loginUser).not.toHaveBeenCalled()
  })

  it("rejects an invalid email format", async () => {
    const user = userEvent.setup()
    renderPage()

    await fillForm(user, { email: "not-an-email", password: "supersecret" })
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(await screen.findByText("Correo inválido")).toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it("accepts a valid email and does not show a format error", async () => {
    vi.mocked(loginUser).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderPage()

    await fillForm(user, { email: "daniel@example.com", password: "supersecret" })
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => expect(loginUser).toHaveBeenCalled())
    expect(screen.queryByText("Correo inválido")).not.toBeInTheDocument()
    expect(screen.queryByText("Este campo es requerido")).not.toBeInTheDocument()
  })

  it("submits valid credentials, shows a success toast, and redirects to the current locale", async () => {
    vi.mocked(loginUser).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderPage()

    await fillForm(user, { email: "daniel@example.com", password: "supersecret" })
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() =>
      expect(loginUser).toHaveBeenCalledWith({ email: "daniel@example.com", password: "supersecret" })
    )
    expect(toast.success).toHaveBeenCalledWith("Éxito")
    expect(pushMock).toHaveBeenCalledWith("/es")
  })

  it("shows an error toast and does not redirect when the credentials are rejected", async () => {
    vi.mocked(loginUser).mockRejectedValueOnce(new Error("Invalid login credentials"))
    const user = userEvent.setup()
    renderPage()

    await fillForm(user, { email: "daniel@example.com", password: "wrongpassword" })
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Correo o contraseña incorrectos"))
    expect(pushMock).not.toHaveBeenCalled()
  })
})
