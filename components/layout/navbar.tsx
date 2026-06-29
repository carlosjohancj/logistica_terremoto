"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";
import { getPB } from "@/lib/pocketbase";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const pb = getPB();
    setIsLoggedIn(!!pb.authStore.model);
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(!!pb.authStore.model);
    });
    return () => unsubscribe();
  }, []);

  const links = [
    { href: `/${locale}`, label: t("inicio") },
    { href: `/${locale}/solicitar-viaje`, label: t("solicitarViaje") },
    { href: `/${locale}/ofrecer-transporte`, label: t("ofrecerTransporte") },
    { href: `/${locale}/ofrecer-hospedaje`, label: t("ofrecerHospedaje") },
    { href: `/${locale}/explorar`, label: t("explorar") },
    { href: `/${locale}/donar`, label: t("donar") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Desde Cero</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <>
              <Link href={`/${locale}/matches`}>
                <Button variant="ghost" size="sm">Conexiones</Button>
              </Link>
              <Link href={`/${locale}/perfil`}>
                <Button variant="outline" size="sm">{t("perfil")}</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`}>
                <Button variant="outline" size="sm">{t("iniciarSesion")}</Button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <Button size="sm">{t("registrarse")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
