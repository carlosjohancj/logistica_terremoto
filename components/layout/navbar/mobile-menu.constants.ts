import type { useTranslations } from "next-intl";

export type NavGroup = "ofrecer" | "mas";

type NavT = ReturnType<typeof useTranslations>;

export function getRootLinks(locale: string, t: NavT, th: NavT) {
  return [
    { href: `/${locale}/empiezo-desde-cero`, label: th("ctaEmpiezo") },
    { href: `/${locale}/solicitar-viaje`, label: t("solicitarViaje") },
    { href: `/${locale}/donar`, label: t("donar") },
  ];
}

export function getOfrecerLinks(locale: string, t: NavT) {
  return [
    { href: `/${locale}/ofrecer-transporte`, label: t("ofrecerTransporte") },
    { href: `/${locale}/ofrecer-hospedaje`, label: t("ofrecerHospedaje") },
    { href: `/${locale}/donaciones-fisicas`, label: t("donacionesFisicas") },
    { href: `/${locale}/ofrecer-insumos`, label: t("ofrecerInsumos") },
  ];
}

export function getMasLinks(locale: string, t: NavT) {
  return [
    { href: `/${locale}/explorar`, label: t("explorar") },
    { href: `/${locale}/empleos`, label: t("empleos") },
    { href: `/${locale}/empresas/registro`, label: t("registroEmpresa") },
    { href: `/${locale}/recursos`, label: t("recursos") },
    { href: `/${locale}/sobre-nosotros`, label: t("sobreNosotros") },
  ];
}
