"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

function NavDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <button
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>
      {/* pt-2 bridges the gap so the dropdown doesn't close on mouse move */}
      <div className="absolute hidden group-hover:block top-full left-0 pt-2 z-50">
        <div className="bg-background border border-border rounded-md shadow-md py-1 min-w-44">
          {children}
        </div>
      </div>
    </div>
  );
}

function DropdownLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary",
        active ? "text-primary font-medium" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center shrink-0">
          <span className="text-xl font-bold text-primary">Desde Cero</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive(`/${locale}`) ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t("inicio")}
          </Link>

          <Link
            href={`/${locale}/solicitar-viaje`}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
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
              "text-sm font-medium transition-colors hover:text-primary",
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
              "text-sm font-medium transition-colors hover:text-primary",
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={`/${locale}/matches`}>
                  <Button variant="ghost" size="sm">
                    {t("matches")}
                  </Button>
                </Link>
                <Link href={`/${locale}/perfil`}>
                  <Button variant="outline" size="sm">
                    {t("perfil")}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="outline" size="sm">
                    {t("iniciarSesion")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button size="sm">{t("registrarse")}</Button>
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {[
              { href: `/${locale}`, label: t("inicio") },
              {
                href: `/${locale}/solicitar-viaje`,
                label: t("solicitarViaje"),
              },
              {
                href: `/${locale}/ofrecer-transporte`,
                label: t("ofrecerTransporte"),
              },
              {
                href: `/${locale}/ofrecer-hospedaje`,
                label: t("ofrecerHospedaje"),
              },
              { href: `/${locale}/explorar`, label: t("explorar") },
              { href: `/${locale}/donar`, label: t("donar") },
              {
                href: `/${locale}/donaciones-fisicas`,
                label: t("donacionesFisicas"),
              },
              { href: `/${locale}/empleos`, label: t("empleos") },
              { href: `/${locale}/recursos`, label: t("recursos") },
              { href: `/${locale}/sobre-nosotros`, label: t("sobreNosotros") },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {isLoggedIn ? (
              <>
                <Link
                  href={`/${locale}/matches`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("matches")}
                </Link>
                <Link
                  href={`/${locale}/perfil`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("perfil")}
                </Link>
                <button
                  className="block py-2 text-sm font-medium text-destructive"
                  onClick={async () => {
                    const supabase = getSupabase();
                    await supabase.auth.signOut();
                    window.location.href = `/${locale}`;
                  }}
                >
                  {t("cerrarSesion")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("iniciarSesion")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("registrarse")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
