import Link from "next/link";
import type { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { NavDropdown } from "./nav-dropdown";
import { NavDropdownLink } from "./nav-dropdown-link";

const NAV_LINK_CLASS =
  "whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary";

export function NavDesktopLinks({
  locale,
  t,
  th,
  isLoggedIn,
  isActive,
  ofrecerActive,
  masActive,
}: {
  locale: string;
  t: ReturnType<typeof useTranslations>;
  th: ReturnType<typeof useTranslations>;
  isLoggedIn: boolean;
  isActive: (href: string) => boolean;
  ofrecerActive: boolean;
  masActive: boolean;
}) {
  return (
    <nav className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
      <Link
        href={`/${locale}/empiezo-desde-cero`}
        className={cn(
          NAV_LINK_CLASS,
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
          NAV_LINK_CLASS,
          isActive(`/${locale}/solicitar-viaje`)
            ? "text-primary"
            : "text-muted-foreground",
        )}
      >
        {t("solicitarViaje")}
      </Link>
      <NavDropdown
        label={t("ofrecerTransporte").split(" ")[0]}
        active={ofrecerActive}
      >
        <NavDropdownLink
          href={`/${locale}/ofrecer-transporte`}
          active={isActive(`/${locale}/ofrecer-transporte`)}
        >
          {t("ofrecerTransporte")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/ofrecer-hospedaje`}
          active={isActive(`/${locale}/ofrecer-hospedaje`)}
        >
          {t("ofrecerHospedaje")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/donaciones-fisicas`}
          active={isActive(`/${locale}/donaciones-fisicas`)}
        >
          {t("donacionesFisicas")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/ofrecer-insumos`}
          active={isActive(`/${locale}/ofrecer-insumos`)}
        >
          {t("ofrecerInsumos")}
        </NavDropdownLink>
      </NavDropdown>
      <Link
        href={`/${locale}/donar`}
        className={cn(
          NAV_LINK_CLASS,
          isActive(`/${locale}/donar`)
            ? "text-primary"
            : "text-muted-foreground",
        )}
      >
        {t("donar")}
      </Link>
      <NavDropdown label={t("mas")} active={masActive}>
        {isLoggedIn && (
          <NavDropdownLink
            href={`/${locale}/perfil?tab=conexiones`}
            active={isActive(`/${locale}/perfil`)}
          >
            {t("matches")}
          </NavDropdownLink>
        )}
        <NavDropdownLink
          href={`/${locale}/explorar`}
          active={isActive(`/${locale}/explorar`)}
        >
          {t("explorar")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/empleos`}
          active={isActive(`/${locale}/empleos`)}
        >
          {t("empleos")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/empresas/registro`}
          active={isActive(`/${locale}/empresas/registro`)}
        >
          {t("registroEmpresa")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/recursos`}
          active={isActive(`/${locale}/recursos`)}
        >
          {t("recursos")}
        </NavDropdownLink>
        <NavDropdownLink
          href={`/${locale}/sobre-nosotros`}
          active={isActive(`/${locale}/sobre-nosotros`)}
        >
          {t("sobreNosotros")}
        </NavDropdownLink>
      </NavDropdown>
    </nav>
  );
}
