"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";

export function NavMobileMenu({
  locale,
  isLoggedIn,
  isActive,
}: {
  locale: string;
  isLoggedIn: boolean;
  isActive: (href: string) => boolean;
}) {
  const t = useTranslations("nav");

  const links = [
    { href: `/${locale}/solicitar-viaje`, label: t("solicitarViaje") },
    { href: `/${locale}/ofrecer-transporte`, label: t("ofrecerTransporte") },
    { href: `/${locale}/ofrecer-hospedaje`, label: t("ofrecerHospedaje") },
    { href: `/${locale}/explorar`, label: t("explorar") },
    { href: `/${locale}/donar`, label: t("donar") },
    { href: `/${locale}/donaciones-fisicas`, label: t("donacionesFisicas") },
    { href: `/${locale}/ofrecer-insumos`, label: t("ofrecerInsumos") },
    { href: `/${locale}/empleos`, label: t("empleos") },
    { href: `/${locale}/empresas/registro`, label: t("registroEmpresa") },
    { href: `/${locale}/recursos`, label: t("recursos") },
    { href: `/${locale}/sobre-nosotros`, label: t("sobreNosotros") },
  ];

  return (
    <div className="md:hidden border-t border-border bg-background">
      <div className="container mx-auto px-4 py-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block py-2 text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(link.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
        <hr className="my-2 border-border" />
        {isLoggedIn ? (
          <>
            <Link href={`/${locale}/perfil?tab=conexiones`} className="block py-2 text-sm font-medium text-muted-foreground">
              {t("matches")}
            </Link>
            <Link href={`/${locale}/perfil`} className="block py-2 text-sm font-medium text-muted-foreground">
              {t("perfil")}
            </Link>
            <button
              className="block py-2 text-sm font-medium text-destructive"
              onClick={async () => {
                await getSupabase().auth.signOut();
                window.location.href = `/${locale}`;
              }}
            >
              {t("cerrarSesion")}
            </button>
          </>
        ) : (
          <>
            <Link href={`/${locale}/auth/login`} className="block py-2 text-sm font-medium text-muted-foreground">
              {t("iniciarSesion")}
            </Link>
            <Link href={`/${locale}/auth/register`} className="block py-2 text-sm font-medium text-muted-foreground">
              {t("registrarse")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
