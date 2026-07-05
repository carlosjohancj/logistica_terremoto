"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { NavDropdown } from "./dropdown";
import { DropdownLink } from "./dropdown-link";
import { NavMobileMenu } from "./mobile-menu";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Navbar() {
  const t = useTranslations("nav");
  const th = useTranslations("home");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      const loggedIn = !!data.session;
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session!.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setUserRole((profile as any).role);
          });
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(!!session);
        setUserName((session?.user.user_metadata?.name as string) || "");
        if (session) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) setUserRole((profile as any).role);
              else setUserRole(null);
            });
        } else {
          setUserRole(null);
        }
      },
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
    `/${locale}/ofrecer-insumos`,
  ];
  const masPaths = [
    `/${locale}/explorar`,
    `/${locale}/empleos`,
    `/${locale}/recursos`,
    `/${locale}/sobre-nosotros`,
    ...(isLoggedIn ? [`/${locale}/perfil`] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/only-logo.png"
            alt="Desde Cero"
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
          <Link
            href={`/${locale}/empiezo-desde-cero`}
            className={cn(
              "whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}/empiezo-desde-cero`)
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {th("ctaEmpiezo")}
          </Link>
          <Link
            href={`/${locale}/solicitar-viaje`}
            className={cn(
              "whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}/solicitar-viaje`)
                ? "text-primary"
                : "text-muted-foreground",
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
            <DropdownLink
              href={`/${locale}/ofrecer-insumos`}
              active={isActive(`/${locale}/ofrecer-insumos`)}
            >
              {t("ofrecerInsumos")}
            </DropdownLink>
          </NavDropdown>
          <Link
            href={`/${locale}/donar`}
            className={cn(
              "whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
              isActive(`/${locale}/donar`)
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {t("donar")}
          </Link>
          <NavDropdown label="Más" active={masPaths.some(isActive)}>
            {isLoggedIn && (
              <DropdownLink
                href={`/${locale}/perfil?tab=conexiones`}
                active={isActive(`/${locale}/perfil`)}
              >
                {t("matches")}
              </DropdownLink>
            )}
            <DropdownLink
              href={`/${locale}/explorar`}
              active={isActive(`/${locale}/explorar`)}
            >
              {t("explorar")}
            </DropdownLink>
            <DropdownLink
              href={`/${locale}/empleos`}
              active={isActive(`/${locale}/empleos`)}
            >
              {t("empleos")}
            </DropdownLink>
            <DropdownLink
              href={`/${locale}/empresas/registro`}
              active={isActive(`/${locale}/empresas/registro`)}
            >
              {t("registroEmpresa")}
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

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LanguageSwitcher />
          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {userRole === "transportista" && (
                  <Link href={`/${locale}/transportista`}>
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full text-xs font-semibold tracking-wide uppercase"
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link
                  href={`/${locale}/perfil`}
                  aria-label={t("perfil")}
                  title={t("perfil")}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase text-primary-foreground">
                    {getInitials(userName)}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs font-semibold tracking-wide uppercase"
                  >
                    {t("iniciarSesion")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-semibold tracking-wide uppercase px-5"
                  >
                    {t("registrarse")}
                  </Button>
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <NavMobileMenu
        locale={locale}
        isLoggedIn={isLoggedIn}
        isActive={isActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  );
}
