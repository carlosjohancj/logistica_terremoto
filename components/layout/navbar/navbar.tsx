"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useNavbar } from "@/hooks/use-navbar";
import { NavLogo } from "./nav-logo";
import { NavDesktopLinks } from "./nav-desktop-links";
import { NavAuthActions } from "./nav-auth-actions";
import { NavMobileToggle } from "./nav-mobile-toggle";
import { NavMobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const th = useTranslations("home");
  const {
    isActive,
    menuOpen,
    setMenuOpen,
    isLoggedIn,
    userName,
    userRole,
    ofrecerPaths,
    masPaths,
  } = useNavbar(locale);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLogo locale={locale} />

        <NavDesktopLinks
          locale={locale}
          t={t}
          th={th}
          isLoggedIn={isLoggedIn}
          isActive={isActive}
          ofrecerActive={ofrecerPaths.some(isActive)}
          masActive={masPaths.some(isActive)}
        />

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LanguageSwitcher />
          <NavAuthActions
            locale={locale}
            t={t}
            isLoggedIn={isLoggedIn}
            userName={userName}
            userRole={userRole}
          />
          <NavMobileToggle
            t={t}
            open={menuOpen}
            onToggle={() => setMenuOpen(!menuOpen)}
          />
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
