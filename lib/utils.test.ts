import { describe, expect, it } from "vitest"
import { cn, getInitials } from "./utils"

describe("cn", () => {
  it("merges class names and drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c")
  })

  it("resolves conflicting Tailwind utilities to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})

describe("getInitials", () => {
  it("returns first and last name initials, uppercased", () => {
    expect(getInitials("Daniel Urbina DEV")).toBe("DD")
    expect(getInitials("Carlos Pérez")).toBe("CP")
  })

  it("returns a single initial for a one-word name", () => {
    expect(getInitials("Ana")).toBe("A")
  })

  it("falls back to '?' for empty or whitespace-only input", () => {
    expect(getInitials("")).toBe("?")
    expect(getInitials("   ")).toBe("?")
  })
})
