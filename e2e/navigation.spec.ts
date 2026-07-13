import { test, expect } from "@playwright/test"

test("homepage loads and links to the travel request form", async ({ page }) => {
  await page.goto("/es")

  const navLink = page.getByRole("link", { name: "Solicitar Viaje" }).first()
  await expect(navLink).toBeVisible()

  await navLink.click()
  await expect(page).toHaveURL(/\/es\/solicitar-viaje/)
  await expect(page.getByRole("heading", { name: "Solicitar Viaje" }).first()).toBeVisible()
})
