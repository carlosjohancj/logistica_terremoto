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

vi.mock("@/types/supabase", () => ({
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
  await user.type(screen.getByLabelText(/WhatsApp/), "4121234567")
  await user.type(screen.getByLabelText(/Edad/), "30")
  await user.type(screen.getByLabelText(/^Contraseña/), "supersecret")
  await user.type(screen.getByLabelText(/Confirmar contraseña/), "supersecret")
}

async function selectRole(user: ReturnType<typeof userEvent.setup>, optionName: string) {
  await user.click(screen.getByRole("combobox", { name: /Tipo de usuario/ }))
  await user.click(await screen.findByRole("option", { name: optionName }))
}

async function fillCommonFieldsExceptRoleSpecific(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nombre completo/), "Daniel Urbina")
  await user.type(screen.getByLabelText(/Correo electrónico/), "daniel@example.com")
  await user.type(screen.getByLabelText(/WhatsApp/), "4121234567")
  await user.type(screen.getByLabelText(/^Contraseña/), "supersecret")
  await user.type(screen.getByLabelText(/Confirmar contraseña/), "supersecret")
}

const NON_VOLUNTEER_ROLES = [
  { optionName: "Transportista", role: "transportista" },
  { optionName: "Anfitrión", role: "anfitrion" },
  { optionName: "Donante", role: "donante" },
  { optionName: "Organización", role: "organizacion" },
]

const VOLUNTEER_TYPES = [
  { optionName: "Voluntario de hospedaje", value: "hospedaje" },
  { optionName: "Voluntario de gestión", value: "gestion" },
  { optionName: "Ambos", value: "ambos" },
]

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does not render a separate Teléfono field", () => {
    renderPage()
    expect(screen.queryByLabelText(/^Teléfono/)).not.toBeInTheDocument()
  })

  it("requires name, email, whatsapp and age (role defaults to damnificado)", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole("button", { name: "Enviar" }))

    const requiredErrors = await screen.findAllByText("Este campo es requerido")
    // name, email, whatsapp, age (password/passwordConfirm fail their own
    // min-length check instead, with a different message)
    expect(requiredErrors.length).toBeGreaterThanOrEqual(4)
    expect(registerUser).not.toHaveBeenCalled()
  })

  it("rejects an invalid WhatsApp number for the selected country", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/WhatsApp/), "123")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(await screen.findByText("Número de teléfono inválido")).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it("accepts a valid Venezuelan WhatsApp number", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/WhatsApp/), "4121234567")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    // other required fields (name, email, age) are still empty
    await waitFor(() => expect(screen.queryAllByText("Este campo es requerido").length).toBeGreaterThan(0))
    expect(screen.queryByText("Número de teléfono inválido")).not.toBeInTheDocument()
  })

  it("rejects an empty WhatsApp number as required, not invalid", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole("button", { name: "Enviar" }))

    const whatsappInput = screen.getByLabelText(/WhatsApp/)
    const describedById = whatsappInput.getAttribute("aria-describedby")
    expect(describedById).toBeTruthy()
    await waitFor(() => expect(document.getElementById(describedById!)).toHaveTextContent("Este campo es requerido"))
    expect(screen.queryByText("Número de teléfono inválido")).not.toBeInTheDocument()
  })

  it("re-validates the WhatsApp number against the newly selected country", async () => {
    const user = userEvent.setup()
    renderPage()

    // A 10-digit national number is valid for Venezuela (+58)...
    await user.type(screen.getByLabelText(/WhatsApp/), "4121234567")
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    await waitFor(() => expect(screen.queryAllByText("Este campo es requerido").length).toBeGreaterThan(0))
    expect(screen.queryByText("Número de teléfono inválido")).not.toBeInTheDocument()

    // ...but switching the country picker to the US without adjusting the
    // digits should invalidate it, since it's no longer a valid US number.
    await user.click(screen.getByRole("combobox", { name: "País" }))
    await user.click(await screen.findByRole("option", { name: /Estados Unidos/ }))
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(await screen.findByText("Número de teléfono inválido")).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
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

    await selectRole(user, "Transportista")

    expect(screen.queryByLabelText(/Edad/)).not.toBeInTheDocument()

    await fillCommonFieldsExceptRoleSpecific(user)
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => expect(registerUser).toHaveBeenCalled())
  })

  describe("volunteerType requirement per role", () => {
    it("requires a volunteer type when the role is voluntario", async () => {
      const user = userEvent.setup()
      renderPage()

      await selectRole(user, "Voluntario")
      await user.click(screen.getByRole("button", { name: "Enviar" }))

      await screen.findAllByText("Este campo es requerido")
      expect(registerUser).not.toHaveBeenCalled()

      const volunteerTypeCombobox = screen.getByRole("combobox", { name: /Tipo de voluntario/ })
      const describedById = volunteerTypeCombobox.getAttribute("aria-describedby")
      expect(describedById).toBeTruthy()
      expect(document.getElementById(describedById!)).toHaveTextContent("Este campo es requerido")
    })

    it.each(VOLUNTEER_TYPES)(
      "submits successfully when volunteerType is '$value'",
      async ({ optionName, value }) => {
        vi.mocked(registerUser).mockResolvedValueOnce(undefined)
        const user = userEvent.setup()
        renderPage()

        await selectRole(user, "Voluntario")
        const volunteerTypeCombobox = screen.getByRole("combobox", { name: /Tipo de voluntario/ })
        await user.click(volunteerTypeCombobox)
        await user.click(await screen.findByRole("option", { name: optionName }))

        await fillCommonFieldsExceptRoleSpecific(user)
        await user.click(screen.getByRole("button", { name: "Enviar" }))

        await waitFor(() =>
          expect(registerUser).toHaveBeenCalledWith(
            expect.objectContaining({ role: "voluntario", volunteerType: value })
          )
        )
      }
    )

    it("shows the selected volunteer type's translated label, not its raw value", async () => {
      const user = userEvent.setup()
      renderPage()

      await selectRole(user, "Voluntario")

      const volunteerTypeCombobox = screen.getByRole("combobox", { name: /Tipo de voluntario/ })
      await user.click(volunteerTypeCombobox)
      await user.click(await screen.findByRole("option", { name: "Voluntario de gestión" }))

      expect(volunteerTypeCombobox).toHaveTextContent("Voluntario de gestión")
      expect(volunteerTypeCombobox).not.toHaveTextContent("gestion")
    })

    it.each(NON_VOLUNTEER_ROLES)(
      "does not render or require a volunteer type when the role is $role",
      async ({ optionName, role }) => {
        vi.mocked(registerUser).mockResolvedValueOnce(undefined)
        const user = userEvent.setup()
        renderPage()

        await selectRole(user, optionName)

        expect(screen.queryByRole("combobox", { name: /Tipo de voluntario/ })).not.toBeInTheDocument()
        expect(screen.queryByText("Tipo de voluntario")).not.toBeInTheDocument()

        await fillCommonFieldsExceptRoleSpecific(user)
        await user.click(screen.getByRole("button", { name: "Enviar" }))

        await waitFor(() => expect(registerUser).toHaveBeenCalled())
        const submitted = vi.mocked(registerUser).mock.calls[0][0]
        expect(submitted.role).toBe(role)
        expect(submitted.volunteerType).toBeUndefined()
      }
    )

    it("drops a previously selected volunteer type when switching away from voluntario", async () => {
      vi.mocked(registerUser).mockResolvedValueOnce(undefined)
      const user = userEvent.setup()
      renderPage()

      await selectRole(user, "Voluntario")
      const volunteerTypeCombobox = screen.getByRole("combobox", { name: /Tipo de voluntario/ })
      await user.click(volunteerTypeCombobox)
      await user.click(await screen.findByRole("option", { name: "Voluntario de gestión" }))

      await selectRole(user, "Donante")
      expect(screen.queryByRole("combobox", { name: /Tipo de voluntario/ })).not.toBeInTheDocument()

      await fillCommonFieldsExceptRoleSpecific(user)
      await user.click(screen.getByRole("button", { name: "Enviar" }))

      await waitFor(() => expect(registerUser).toHaveBeenCalled())
      const submitted = vi.mocked(registerUser).mock.calls[0][0]
      expect(submitted.role).toBe("donante")
      expect(submitted.volunteerType).toBeUndefined()
    })
  })

  it("registers successfully, shows a success toast, and redirects straight to login", async () => {
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
          whatsapp: "+584121234567",
          age: 30,
          role: "damnificado",
          password: "supersecret",
        })
      )
    )
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith("Éxito")
    expect(pushMock).toHaveBeenCalledWith("/es/auth/login")
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
