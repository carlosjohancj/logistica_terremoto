"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, ChevronLeft, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/types/supabase";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import {
  getMasLinks,
  getOfrecerLinks,
  getRootLinks,
} from "./mobile-menu.constants";

export function NavMobileMenu({
  locale,
  isLoggedIn,
  isActive,
  open,
  onClose,
}: {
  locale: string;
  isLoggedIn: boolean;
  isActive: (href: string) => boolean;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const th = useTranslations("home");
  const { group, setGroup, mounted, closeButtonRef } = useMobileMenu({
    open,
    onClose,
  });

  const rootLinks = getRootLinks(locale, t, th);
  const ofrecerLinks = getOfrecerLinks(locale, t);
  const masLinks = getMasLinks(locale, t);

  const ofrecerLabel = t("ofrecerTransporte").split(" ")[0];
  const groupLabel = group === "ofrecer" ? ofrecerLabel : t("mas");
  const groupLinks = group === "ofrecer" ? ofrecerLinks : masLinks;

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="mobile-nav-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("openMenu")}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-background shadow-xl transition-transform duration-500 ease-in-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <button
            ref={closeButtonRef}
            aria-label={t("closeMenu")}
            onClick={onClose}
            className="p-1"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!group ? (
            <>
              <nav className="flex flex-col">
                {rootLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
                      isActive(link.href)
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={false}
                  className="flex items-center justify-between py-2.5 text-xs font-semibold tracking-wide uppercase text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setGroup("ofrecer")}
                >
                  {ofrecerLabel}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={false}
                  className="flex items-center justify-between py-2.5 text-xs font-semibold tracking-wide uppercase text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setGroup("mas")}
                >
                  {t("mas")}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>

              <hr className="my-4 border-border" />

              {isLoggedIn ? (
                <div className="flex flex-col">
                  <Link
                    href={`/${locale}/perfil?tab=conexiones`}
                    className="py-2 text-sm font-medium text-muted-foreground"
                  >
                    {t("matches")}
                  </Link>
                  <Link
                    href={`/${locale}/perfil`}
                    className="py-2 text-sm font-medium text-muted-foreground"
                  >
                    {t("perfil")}
                  </Link>
                  <button
                    type="button"
                    className="-ml-3 mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    onClick={async () => {
                      await getSupabase().auth.signOut();
                      window.location.href = `/${locale}`;
                    }}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t("cerrarSesion")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <Link
                    href={`/${locale}/auth/login`}
                    className="py-2 text-sm font-medium text-muted-foreground"
                  >
                    {t("iniciarSesion")}
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    className="py-2 text-sm font-medium text-muted-foreground"
                  >
                    {t("registrarse")}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div>
              <button
                type="button"
                className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground"
                onClick={() => setGroup(null)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {groupLabel}
              </button>
              <nav className="flex flex-col">
                {groupLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "py-2.5 text-sm font-medium transition-colors hover:text-primary",
                      isActive(link.href)
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
