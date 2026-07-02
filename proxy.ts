import createMiddleware from "next-intl/middleware"

export default createMiddleware({
  locales: ["es", "en", "fr", "it", "de", "pt", "ar"],
  defaultLocale: "es",
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
