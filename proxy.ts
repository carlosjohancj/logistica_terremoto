import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["es", "en", "fr", "it", "de", "pt", "ar"];
const defaultLocale = "es";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const acceptLang = request.headers.get("accept-language") || "";
  const preferred = acceptLang
    .split(",")
    .map((l) => l.split("-")[0].trim().toLowerCase())
    .find((l) => locales.includes(l));

  const locale = preferred || defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
