import { describe, expect, it, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { registerUser } from "@/lib/auth"
import { createSupabaseMock } from "@/test/supabase-mock"
import { renderWithIntl } from "@/test/test-utils"

const pushMock = vi.fn()
const supabaseMock = createSupabaseMock()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/es/auth/register",
}))

vi.mock("@/lib/auth", () => ({
  registerUser: vi.fn(),
}))

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => supabaseMock,
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import RegisterPage from "./page"

function renderPage() {
  return renderWithIntl(<RegisterPage />)
}

async function fillRequiredValidFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nombre completo/), "Daniel Urbina")
  await user.type(screen.getByLabelText(/Correo electrónico/), "daniel@example.com")
  await user.type(screen.getByLabelText(/^Teléfono/), "4121234567")
  await user.type(screen.getByLabelText(/WhatsApp/), "4121234567")
  await user.type(screen.getByLabelText(/Edad/), "30")
  await user.type(screen.getByLabelText(/^Contraseña/), "supersecret")
  await user.type(screen.getByLabelText(/Confirmar contraseña/), "supersecret")
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requires name, email, phone, whatsapp and age (role defaults to damnificado)", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole("button", { name: "Enviar" }))

    const requiredErrors = await screen.findAllByText("Este campo es requerido")
    // name, email, phone, whatsapp, age (password/passwordConfirm fail their
    // own min-length check instead, with a different message)
    expect(requiredErrors.length).toBeGreaterThanOrEqual(5)
    expect(registerUser).not.toHaveBeenCalled()
  })

  it("rejects an invalid phone number for the selected country", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/^Teléfono/), "123")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(await screen.findByText("Número de teléfono inválido")).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it("accepts a valid Venezuelan phone number", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/^Teléfono/), "4121234567")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    // other required fields (name, email, whatsapp, age) are still empty
    await waitFor(() => expect(screen.queryAllByText("Este campo es requerido").length).toBeGreaterThan(0))
    expect(screen.queryByText("Número de teléfono inválido")).not.toBeInTheDocument()
  })

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup()
    renderPage()

    await fillRequiredValidFields(user)
    await user.clear(screen.getByLabelText(/Confirmar contraseña/))
    await user.type(screen.getByLabelText(/Confirmar contraseña/), "different")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it("does not require age when the role isn't damnificado", async () => {
    const user = userEvent.setup()
    vi.mocked(registerUser).mockResolvedValueOnce(undefined)
    renderPage()

    await user.click(screen.getByRole("combobox", { name: /Tipo de usuario/ }))
    await user.click(await screen.findByRole("option", { name: "Transportista" }))

    expect(screen.queryByLabelText(/Edad/)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText(/Nombre completo/), "Daniel Urbina")
    await user.type(screen.getByLabelText(/Correo electrónico/), "daniel@example.com")
    await user.type(screen.getByLabelText(/^Teléfono/), "4121234567")
    await user.type(screen.getByLabelText(/WhatsApp/), "4121234567")
    await user.type(screen.getByLabelText(/^Contraseña/), "supersecret")
    await user.type(screen.getByLabelText(/Confirmar contraseña/), "supersecret")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => expect(registerUser).toHaveBeenCalled())
  })

  it("registers successfully, signs in, shows a success toast, and redirects", async () => {
    vi.mocked(registerUser).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderPage()

    await fillRequiredValidFields(user)
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() =>
      expect(registerUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Daniel Urbina",
          email: "daniel@example.com",
          phone: "+584121234567",
          whatsapp: "+584121234567",
          age: 30,
          role: "damnificado",
          password: "supersecret",
        })
      )
    )
    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "daniel@example.com",
      password: "supersecret",
    })
    expect(toast.success).toHaveBeenCalledWith("Éxito")
    expect(pushMock).toHaveBeenCalledWith("/es")
  })

  it("shows an error toast when registration fails", async () => {
    vi.mocked(registerUser).mockRejectedValueOnce(new Error("El correo ya está registrado"))
    const user = userEvent.setup()
    renderPage()

    await fillRequiredValidFields(user)
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("El correo ya está registrado"))
    expect(pushMock).not.toHaveBeenCalled()
  })
})
