import Link from "next/link";
import type { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

export function NavAuthActions({
  locale,
  t,
  isLoggedIn,
  userName,
  userRole,
}: {
  locale: string;
  t: ReturnType<typeof useTranslations>;
  isLoggedIn: boolean;
  userName: string;
  userRole: string | null;
}) {
  if (!isLoggedIn) {
    return (
      <div className="hidden lg:flex items-center gap-2">
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
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2">
      {(userRole === "transportista" || userRole === "voluntario") && (
        <Link href={`/${locale}/${userRole === "transportista" ? "transportista" : "voluntario"}`}>
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
    </div>
  );
}
