import { describe, expect, it, vi, beforeEach } from "vitest"
import { createSupabaseMock } from "@/test/supabase-mock"

const mockClient = createSupabaseMock()

vi.mock("@/lib/supabase", () => ({
  getServiceSupabase: () => mockClient,
  TABLES: { PROFILES: "profiles" },
}))

import { POST } from "./route"

const VALID_BODY = {
  email: "daniel@example.com",
  password: "supersecret",
  name: "Daniel Urbina",
  role: "damnificado",
  phone: "+584121234567",
  whatsapp: "+584121234567",
  age: 30,
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects a request missing required fields", async () => {
    const res = await POST(makeRequest({ email: "daniel@example.com", password: "supersecret" }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe("Missing required fields")
    expect(mockClient.auth.admin.createUser).not.toHaveBeenCalled()
  })

  it.each(["email", "password", "name", "phone", "whatsapp", "role"])(
    "rejects a request missing '%s'",
    async (field) => {
      const body = { ...VALID_BODY, [field]: "" }
      const res = await POST(makeRequest(body))
      expect(res.status).toBe(400)
    }
  )

  it("creates the auth user and profile row on valid input", async () => {
    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ success: true, id: "new-user-id" })

    expect(mockClient.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: VALID_BODY.email,
        password: VALID_BODY.password,
        user_metadata: expect.objectContaining({
          name: VALID_BODY.name,
          role: VALID_BODY.role,
          phone: VALID_BODY.phone,
          whatsapp: VALID_BODY.whatsapp,
        }),
      })
    )

    expect(mockClient.from).toHaveBeenCalledWith("profiles")
    const insertMock = mockClient.from.mock.results[0].value.insert
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "new-user-id",
        name: VALID_BODY.name,
        phone: VALID_BODY.phone,
        whatsapp: VALID_BODY.whatsapp,
        age: VALID_BODY.age,
      })
    )
  })

  it("returns the Supabase auth error when user creation fails", async () => {
    const failingClient = createSupabaseMock({
      admin: { createUser: { data: { user: null }, error: { message: "Email already registered" } } },
    })
    vi.mocked(mockClient.auth.admin.createUser).mockImplementationOnce(failingClient.auth.admin.createUser)

    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe("Email already registered")
  })

  it("rolls back the created auth user when the profile insert fails", async () => {
    mockClient.from.mockImplementationOnce(() => ({
      insert: vi.fn(async () => ({ error: { message: "duplicate key value" } })),
    }))

    const res = await POST(makeRequest(VALID_BODY))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe("duplicate key value")
    expect(mockClient.auth.admin.deleteUser).toHaveBeenCalledWith("new-user-id")
  })
})
