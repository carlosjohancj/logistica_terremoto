import { describe, expect, it, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { submitTravelRequest } from "@/lib/forms/submit"
import { renderWithIntl } from "@/test/test-utils"

const FAKE_ESTADOS = [
  {
    name: "Miranda",
    capital: "Los Teques",
    lat: 10.1,
    lng: -66.9,
    municipios: [
      { municipio: "Sucre", ciudades: ["Petare", "Chacao"] },
      { municipio: "Baruta", ciudades: ["Las Mercedes"] },
    ],
  },
  {
    name: "Distrito Capital",
    capital: "Caracas",
    lat: 10.5,
    lng: -66.9,
    municipios: [{ municipio: "Libertador", ciudades: ["Caracas"] }],
  },
]

vi.mock("@/lib/estados", () => ({
  useEstados: () => ({ estados: FAKE_ESTADOS, loading: false }),
}))

vi.mock("@/lib/forms/submit", () => ({
  submitTravelRequest: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { TravelRequestForm } from "./form"

function renderForm() {
  return renderWithIntl(<TravelRequestForm />)
}

async function selectCombobox(user: ReturnType<typeof userEvent.setup>, accessibleName: string | RegExp, optionName: string) {
  await user.click(screen.getByRole("combobox", { name: accessibleName }))
  await user.click(await screen.findByRole("option", { name: optionName }))
}

async function fillTripDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Personas a movilizar/), "2")
  await user.type(screen.getByLabelText(/Personas a hospedar/), "0")
  await user.type(screen.getByLabelText(/Cantidad de niños/), "0")
  await user.type(screen.getByLabelText(/Cantidad de adultos/), "0")
  await selectCombobox(user, "Estado de la vivienda", "Destrucción total")
}

// Fills every field required for a "damnificado, no destination" submission:
// registrant_type, full origin location, has_destination=No, trip details.
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Soy parte del grupo" }))
  await selectCombobox(user, "Estado de origen", "Miranda")
  await selectCombobox(user, "Municipio de origen", "Sucre")
  await selectCombobox(user, "Ciudad de origen", "Petare")
  await user.click(screen.getByRole("radio", { name: "No" }))
  await fillTripDetails(user)
}

const HOUSING_OPTIONS = [
  { optionName: "Destrucción total", value: "total" },
  { optionName: "Daños graves", value: "grave" },
  { optionName: "Se puede reparar", value: "se_puede_reparar" },
  { optionName: "Prestada para emergencia", value: "prestada_emergencia" },
]

describe("TravelRequestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows a required-field asterisk next to registration type and 'do you have somewhere to go'", () => {
    renderForm()

    function groupLabelText(accessibleName: string) {
      const group = screen.getByRole("radiogroup", { name: accessibleName })
      const labelId = group.getAttribute("aria-labelledby")
      return document.getElementById(labelId!)!.textContent
    }

    expect(groupLabelText("Tipo de registro")).toBe("Tipo de registro*")
    expect(groupLabelText("¿Tienes a dónde ir?")).toBe("¿Tienes a dónde ir?*")
  })

  it("requires registration type, full origin location, 'do you have somewhere to go', trip details and housing condition", async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    // registrant_type, origin_state/municipality/city, has_destination,
    // people_to_house, children_count, adults_count, and housing_destruction
    // all share the generic required message (9 fields).
    const requiredErrors = await screen.findAllByText("Este campo es requerido")
    expect(requiredErrors.length).toBeGreaterThanOrEqual(8)

    expect(await screen.findByText("Debe ser al menos 1")).toBeInTheDocument()
    expect(submitTravelRequest).not.toHaveBeenCalled()
  })

  it("shows a dedicated required error under 'do you have somewhere to go' specifically", async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("radio", { name: "Soy parte del grupo" }))
    await selectCombobox(user, "Estado de origen", "Miranda")
    await selectCombobox(user, "Municipio de origen", "Sucre")
    await selectCombobox(user, "Ciudad de origen", "Petare")
    await fillTripDetails(user)
    // has_destination deliberately left untouched (still null)
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    const hasDestinationGroup = screen.getByRole("radiogroup", { name: "¿Tienes a dónde ir?" })
    await waitFor(() => expect(hasDestinationGroup.parentElement).toHaveTextContent("Este campo es requerido"))
    expect(submitTravelRequest).not.toHaveBeenCalled()
  })

  it("requires the relation field when registering on behalf of others", async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("radio", { name: "Estoy registrando a otros" }))
    // registrant_relation deliberately left blank
    await selectCombobox(user, "Estado de origen", "Miranda")
    await selectCombobox(user, "Municipio de origen", "Sucre")
    await selectCombobox(user, "Ciudad de origen", "Petare")
    await user.click(screen.getByRole("radio", { name: "No" }))
    await fillTripDetails(user)
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    const relationInput = await screen.findByLabelText(/Relación con los damnificados/)
    const describedById = relationInput.getAttribute("aria-describedby")
    expect(describedById).toBeTruthy()
    await waitFor(() => expect(document.getElementById(describedById!)).toHaveTextContent("Este campo es requerido"))
    expect(submitTravelRequest).not.toHaveBeenCalled()
  })

  it("requires the destination location when there is somewhere to go", async () => {
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.click(screen.getByRole("radio", { name: "Sí" }))
    // destination_state/municipality/city deliberately left blank
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    const destinationStateCombobox = await screen.findByRole("combobox", { name: "Estado de destino" })
    const describedById = destinationStateCombobox.getAttribute("aria-describedby")
    expect(describedById).toBeTruthy()
    await waitFor(() => expect(document.getElementById(describedById!)).toHaveTextContent("Este campo es requerido"))
    expect(submitTravelRequest).not.toHaveBeenCalled()
  })

  it("rejects zero and negative people_to_move", async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Personas a movilizar/), "0")
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    expect(await screen.findByText("Debe ser al menos 1")).toBeInTheDocument()
    expect(submitTravelRequest).not.toHaveBeenCalled()
  })

  it("rejects a negative value in people_to_house", async () => {
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.clear(screen.getByLabelText(/Personas a hospedar/))
    await user.type(screen.getByLabelText(/Personas a hospedar/), "-1")
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    expect(await screen.findByText("No puede ser negativo")).toBeInTheDocument()
    expect(submitTravelRequest).not.toHaveBeenCalled()
  })

  it("only shows the relation field when registering on behalf of others", async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.queryByLabelText(/Relación con los damnificados/)).not.toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Estoy registrando a otros" }))
    expect(screen.getByLabelText(/Relación con los damnificados/)).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Soy parte del grupo" }))
    expect(screen.queryByLabelText(/Relación con los damnificados/)).not.toBeInTheDocument()
  })

  it("only shows the destination section when the answer to 'do you have somewhere to go' is yes", async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.queryByRole("combobox", { name: "Estado de destino" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Sí" }))
    expect(screen.getByRole("combobox", { name: "Estado de destino" })).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "No" }))
    expect(screen.queryByRole("combobox", { name: "Estado de destino" })).not.toBeInTheDocument()
  })

  describe("origin location cascading selects", () => {
    it("disables municipality until a state is chosen, and city until a municipality is chosen", () => {
      renderForm()

      expect(screen.getByRole("combobox", { name: "Municipio de origen" })).toBeDisabled()
      expect(screen.getByRole("combobox", { name: "Ciudad de origen" })).toBeDisabled()
    })

    it("resets municipality and city when the state changes", async () => {
      const user = userEvent.setup()
      renderForm()

      await selectCombobox(user, "Estado de origen", "Miranda")
      await selectCombobox(user, "Municipio de origen", "Sucre")
      await selectCombobox(user, "Ciudad de origen", "Petare")

      expect(screen.getByRole("combobox", { name: "Municipio de origen" })).toHaveTextContent("Sucre")
      expect(screen.getByRole("combobox", { name: "Ciudad de origen" })).toHaveTextContent("Petare")

      await selectCombobox(user, "Estado de origen", "Distrito Capital")

      expect(screen.getByRole("combobox", { name: "Municipio de origen" })).not.toHaveTextContent("Sucre")
      expect(screen.getByRole("combobox", { name: "Ciudad de origen" })).not.toHaveTextContent("Petare")
      expect(screen.getByRole("combobox", { name: "Ciudad de origen" })).toBeDisabled()
    })

    it("resets city when the municipality changes", async () => {
      const user = userEvent.setup()
      renderForm()

      await selectCombobox(user, "Estado de origen", "Miranda")
      await selectCombobox(user, "Municipio de origen", "Sucre")
      await selectCombobox(user, "Ciudad de origen", "Petare")

      await selectCombobox(user, "Municipio de origen", "Baruta")

      expect(screen.getByRole("combobox", { name: "Ciudad de origen" })).not.toHaveTextContent("Petare")
    })
  })

  it("submits successfully with only the required fields filled, shows a success toast, and resets the form", async () => {
    vi.mocked(submitTravelRequest).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    await waitFor(() =>
      expect(submitTravelRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          registrant_type: "damnificado",
          origin_state: "Miranda",
          origin_municipality: "Sucre",
          origin_city: "Petare",
          has_destination: false,
          people_to_move: 2,
          people_to_house: 0,
          children_count: 0,
          adults_count: 0,
          housing_destruction: "total",
        })
      )
    )
    expect(toast.success).toHaveBeenCalledWith("Solicitud publicada exitosamente")

    await waitFor(() => expect(screen.getByLabelText(/Personas a movilizar/)).toHaveValue(null))
  })

  it("submits registrant_relation when registering on behalf of others", async () => {
    vi.mocked(submitTravelRequest).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("radio", { name: "Estoy registrando a otros" }))
    await user.type(screen.getByLabelText(/Relación con los damnificados/), "Vecino")
    await selectCombobox(user, "Estado de origen", "Miranda")
    await selectCombobox(user, "Municipio de origen", "Sucre")
    await selectCombobox(user, "Ciudad de origen", "Petare")
    await user.click(screen.getByRole("radio", { name: "No" }))
    await user.type(screen.getByLabelText(/Personas a movilizar/), "3")
    await user.type(screen.getByLabelText(/Personas a hospedar/), "0")
    await user.type(screen.getByLabelText(/Cantidad de niños/), "0")
    await user.type(screen.getByLabelText(/Cantidad de adultos/), "0")
    await selectCombobox(user, "Estado de la vivienda", "Daños graves")

    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    await waitFor(() =>
      expect(submitTravelRequest).toHaveBeenCalledWith(
        expect.objectContaining({ registrant_type: "colaborador", registrant_relation: "Vecino" })
      )
    )
  })

  it("submits full origin and destination locations when there is somewhere to go", async () => {
    vi.mocked(submitTravelRequest).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("radio", { name: "Soy parte del grupo" }))
    await selectCombobox(user, "Estado de origen", "Miranda")
    await selectCombobox(user, "Municipio de origen", "Sucre")
    await selectCombobox(user, "Ciudad de origen", "Petare")

    await user.click(screen.getByRole("radio", { name: "Sí" }))
    await selectCombobox(user, "Estado de destino", "Distrito Capital")
    await selectCombobox(user, "Municipio de destino", "Libertador")
    await selectCombobox(user, "Ciudad de destino", "Caracas")

    await fillTripDetails(user)
    await user.clear(screen.getByLabelText(/Personas a movilizar/))
    await user.type(screen.getByLabelText(/Personas a movilizar/), "4")
    await selectCombobox(user, "Estado de la vivienda", "Se puede reparar")

    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    await waitFor(() =>
      expect(submitTravelRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          has_destination: true,
          origin_state: "Miranda",
          origin_municipality: "Sucre",
          origin_city: "Petare",
          destination_state: "Distrito Capital",
          destination_municipality: "Libertador",
          destination_city: "Caracas",
        })
      )
    )
  })

  it.each(HOUSING_OPTIONS)("submits successfully with housing_destruction '$value'", async ({ optionName, value }) => {
    vi.mocked(submitTravelRequest).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("radio", { name: "Soy parte del grupo" }))
    await selectCombobox(user, "Estado de origen", "Miranda")
    await selectCombobox(user, "Municipio de origen", "Sucre")
    await selectCombobox(user, "Ciudad de origen", "Petare")
    await user.click(screen.getByRole("radio", { name: "No" }))
    await user.type(screen.getByLabelText(/Personas a movilizar/), "1")
    await user.type(screen.getByLabelText(/Personas a hospedar/), "0")
    await user.type(screen.getByLabelText(/Cantidad de niños/), "0")
    await user.type(screen.getByLabelText(/Cantidad de adultos/), "0")
    await selectCombobox(user, "Estado de la vivienda", optionName)

    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    await waitFor(() =>
      expect(submitTravelRequest).toHaveBeenCalledWith(expect.objectContaining({ housing_destruction: value }))
    )
  })

  it("submits the given people_to_house, children_count, adults_count and notes values", async () => {
    vi.mocked(submitTravelRequest).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole("radio", { name: "Soy parte del grupo" }))
    await selectCombobox(user, "Estado de origen", "Miranda")
    await selectCombobox(user, "Municipio de origen", "Sucre")
    await selectCombobox(user, "Ciudad de origen", "Petare")
    await user.click(screen.getByRole("radio", { name: "No" }))
    await user.type(screen.getByLabelText(/Personas a movilizar/), "2")
    await user.type(screen.getByLabelText(/Personas a hospedar/), "5")
    await user.type(screen.getByLabelText(/Cantidad de niños/), "2")
    await user.type(screen.getByLabelText(/Cantidad de adultos/), "3")
    await selectCombobox(user, "Estado de la vivienda", "Destrucción total")
    await user.type(screen.getByLabelText(/Notas adicionales/), "Necesitamos salir antes del viernes")

    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    await waitFor(() =>
      expect(submitTravelRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          people_to_house: 5,
          children_count: 2,
          adults_count: 3,
          notes: "Necesitamos salir antes del viernes",
        })
      )
    )
  })

  it("shows an error toast and does not reset the form when submission fails", async () => {
    vi.mocked(submitTravelRequest).mockRejectedValueOnce(new Error("Debes iniciar sesión para publicar"))
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.click(screen.getByRole("button", { name: "Publicar solicitud" }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Debes iniciar sesión para publicar"))
    expect(screen.getByLabelText(/Personas a movilizar/)).toHaveValue(2)
  })
})
