"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { NavDropdown } from "./dropdown";
import { DropdownLink } from "./dropdown-link";
import { NavMobileMenu } from "./mobile-menu";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(!!session);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    startTransition(() => setMenuOpen(false));
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const ofrecerPaths = [
    `/${locale}/ofrecer-transporte`,
    `/${locale}/ofrecer-hospedaje`,
    `/${locale}/donaciones-fisicas`,
  ];
  const masPaths = [
    `/${locale}/empleos`,
    `/${locale}/recursos`,
    `/${locale}/sobre-nosotros`,
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/only-logo.png" alt="Desde Cero" className="h-12 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className={cn(
              "text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}`) ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t("inicio")}
          </Link>
          <Link
            href={`/${locale}/solicitar-viaje`}
            className={cn(
              "text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}/solicitar-viaje`)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("solicitarViaje")}
          </Link>
          <NavDropdown
            label={t("ofrecerTransporte").split(" ")[0]}
            active={ofrecerPaths.some(isActive)}
          >
            <DropdownLink
              href={`/${locale}/ofrecer-transporte`}
              active={isActive(`/${locale}/ofrecer-transporte`)}
            >
              {t("ofrecerTransporte")}
            </DropdownLink>
            <DropdownLink
              href={`/${locale}/ofrecer-hospedaje`}
              active={isActive(`/${locale}/ofrecer-hospedaje`)}
            >
              {t("ofrecerHospedaje")}
            </DropdownLink>
            <DropdownLink
              href={`/${locale}/donaciones-fisicas`}
              active={isActive(`/${locale}/donaciones-fisicas`)}
            >
              {t("donacionesFisicas")}
            </DropdownLink>
          </NavDropdown>
          <Link
            href={`/${locale}/explorar`}
            className={cn(
              "text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}/explorar`)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("explorar")}
          </Link>
          <Link
            href={`/${locale}/donar`}
            className={cn(
              "text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}/donar`)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("donar")}
          </Link>
          <NavDropdown label="Más" active={masPaths.some(isActive)}>
            <DropdownLink
              href={`/${locale}/empleos`}
              active={isActive(`/${locale}/empleos`)}
            >
              {t("empleos")}
            </DropdownLink>
            <DropdownLink
              href={`/${locale}/recursos`}
              active={isActive(`/${locale}/recursos`)}
            >
              {t("recursos")}
            </DropdownLink>
            <DropdownLink
              href={`/${locale}/sobre-nosotros`}
              active={isActive(`/${locale}/sobre-nosotros`)}
            >
              {t("sobreNosotros")}
            </DropdownLink>
          </NavDropdown>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={`/${locale}/matches`}>
                  <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold tracking-wide uppercase">
                    {t("matches")}
                  </Button>
                </Link>
                <Link href={`/${locale}/perfil`}>
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold tracking-wide uppercase px-5">
                    {t("perfil")}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold tracking-wide uppercase">
                    {t("iniciarSesion")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button size="sm" className="rounded-full text-xs font-semibold tracking-wide uppercase px-5">
                    {t("registrarse")}
                  </Button>
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <NavMobileMenu
          locale={locale}
          isLoggedIn={isLoggedIn}
          isActive={isActive}
        />
      )}
    </header>
  );
}
