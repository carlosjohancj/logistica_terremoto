"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, ChevronLeft, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type Group = "ofrecer" | "mas";

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
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (!open) setGroup(null);
  }, [open]);

  const rootLinks = [
    { href: `/${locale}/empiezo-desde-cero`, label: th("ctaEmpiezo") },
    { href: `/${locale}/solicitar-viaje`, label: t("solicitarViaje") },
    { href: `/${locale}/donar`, label: t("donar") },
  ];

  const ofrecerLabel = t("ofrecerTransporte").split(" ")[0];
  const ofrecerLinks = [
    { href: `/${locale}/ofrecer-transporte`, label: t("ofrecerTransporte") },
    { href: `/${locale}/ofrecer-hospedaje`, label: t("ofrecerHospedaje") },
    { href: `/${locale}/donaciones-fisicas`, label: t("donacionesFisicas") },
    { href: `/${locale}/ofrecer-insumos`, label: t("ofrecerInsumos") },
  ];

  const masLabel = "Más";
  const masLinks = [
    { href: `/${locale}/explorar`, label: t("explorar") },
    { href: `/${locale}/empleos`, label: t("empleos") },
    { href: `/${locale}/empresas/registro`, label: t("registroEmpresa") },
    { href: `/${locale}/recursos`, label: t("recursos") },
    { href: `/${locale}/sobre-nosotros`, label: t("sobreNosotros") },
  ];

  const groupLabel = group === "ofrecer" ? ofrecerLabel : masLabel;
  const groupLinks = group === "ofrecer" ? ofrecerLinks : masLinks;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-background shadow-xl transition-transform duration-500 ease-in-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <button aria-label="Cerrar menú" onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
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
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  className="flex items-center justify-between py-2.5 text-xs font-semibold tracking-wide uppercase text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setGroup("ofrecer")}
                >
                  {ofrecerLabel}
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  className="flex items-center justify-between py-2.5 text-xs font-semibold tracking-wide uppercase text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setGroup("mas")}
                >
                  {masLabel}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>

              <hr className="my-4 border-border" />

              {isLoggedIn ? (
                <div className="flex flex-col">
                  <Link href={`/${locale}/perfil?tab=conexiones`} className="py-2 text-sm font-medium text-muted-foreground">
                    {t("matches")}
                  </Link>
                  <Link href={`/${locale}/perfil`} className="py-2 text-sm font-medium text-muted-foreground">
                    {t("perfil")}
                  </Link>
                  <button
                    className="-ml-3 mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    onClick={async () => {
                      await getSupabase().auth.signOut();
                      window.location.href = `/${locale}`;
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("cerrarSesion")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <Link href={`/${locale}/auth/login`} className="py-2 text-sm font-medium text-muted-foreground">
                    {t("iniciarSesion")}
                  </Link>
                  <Link href={`/${locale}/auth/register`} className="py-2 text-sm font-medium text-muted-foreground">
                    {t("registrarse")}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div>
              <button
                className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground"
                onClick={() => setGroup(null)}
              >
                <ChevronLeft className="h-4 w-4" />
                {groupLabel}
              </button>
              <nav className="flex flex-col">
                {groupLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "py-2.5 text-sm font-medium transition-colors hover:text-primary",
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
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
    </>
  );
}
