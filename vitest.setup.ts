import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// @testing-library/react's automatic cleanup only self-registers when it
// detects a global `afterEach`, which we don't inject (no `globals: true`
// in vitest.config.mts). Register it explicitly so each test starts with a
// fresh DOM instead of accumulating previous renders.
afterEach(() => {
  cleanup()
})
