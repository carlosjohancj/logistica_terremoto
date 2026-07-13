import { vi } from "vitest"

type QueryResult<T = unknown> = { data: T | null; error: { message: string } | null }

/**
 * A minimal stand-in for a Supabase PostgREST query builder: every filter
 * method returns itself, and awaiting the chain resolves to `result` (it
 * implements `.then`, so `await supabase.from(...).select().eq()...` works
 * without needing to know how many links are in a given call's chain).
 */
export function createQueryMock<T>(result: QueryResult<T>) {
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    range: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    then: (
      onFulfilled: (value: QueryResult<T>) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  }
  return chain
}

type AdminCreateUserResult = {
  data: { user: { id: string } | null }
  error: { message: string } | null
}

/**
 * Builds a fake Supabase client for `vi.mock("@/types/supabase", ...)`.
 * Pass `tables` keyed by table name to control what `.from(table)` resolves
 * to; any table not listed resolves to an empty, error-free result. Pass
 * `admin` to control `auth.admin.createUser`/`deleteUser` (used by service-role
 * routes like registration), which otherwise create a random-id user with no error.
 */
export function createSupabaseMock({
  user = null,
  tables = {},
  admin = {},
}: {
  user?: { id: string } | null
  tables?: Record<string, QueryResult<unknown>>
  admin?: {
    createUser?: AdminCreateUserResult
  }
} = {}) {
  const from = vi.fn((table: string) => createQueryMock(tables[table] ?? { data: [], error: null }))
  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
      getSession: vi.fn(async () => ({ data: { session: user ? { user } : null } })),
      signOut: vi.fn(async () => ({ error: null })),
      signInWithPassword: vi.fn(async () => ({ error: null })),
      admin: {
        createUser: vi.fn(
          async (): Promise<AdminCreateUserResult> =>
            admin.createUser ?? { data: { user: { id: "new-user-id" } }, error: null }
        ),
        deleteUser: vi.fn(async () => ({ error: null })),
      },
    },
    from,
  }
}
