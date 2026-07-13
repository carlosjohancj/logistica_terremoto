import type { ReactElement } from "react"
import { render } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import esMessages from "@/i18n/locales/es"

/**
 * Renders a component under a real NextIntlClientProvider (defaulting to the
 * actual es.json copy) so tests assert against genuine translated strings
 * instead of raw i18n keys.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "es", messages = esMessages }: { locale?: string; messages?: Record<string, unknown> } = {}
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  )
}
