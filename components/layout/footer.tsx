"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/contact-info";

export function Footer() {
  const t = useTranslations("home");
  const n = useTranslations("nav");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/logo-main.png" alt="Desde Cero" className="h-auto w-40 mb-3" />
            <p className="text-sm text-muted-foreground">{t("heroDesc")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{n("enlaces")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${locale}/empiezo-desde-cero`} className="hover:text-primary">{t("ctaEmpiezo")}</Link></li>
              <li><Link href={`/${locale}/solicitar-viaje`} className="hover:text-primary">{t("ctaSolicitar")}</Link></li>
              <li><Link href={`/${locale}/ofrecer-transporte`} className="hover:text-primary">{t("ctaTransporte")}</Link></li>
              <li><Link href={`/${locale}/ofrecer-hospedaje`} className="hover:text-primary">{t("ctaHospedaje")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{n("ayuda")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${locale}/#faq`} className="hover:text-primary">{n("preguntasFrecuentes")}</Link></li>
              <li><Link href={`/${locale}/contacto`} className="hover:text-primary">{n("contacto")}</Link></li>
              <li><Link href={`/${locale}/terminos-de-uso`} className="hover:text-primary">{n("terminosUso")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{n("contacto")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{n("whatsapp")}: {WHATSAPP_NUMBER}</li>
              <li>{n("email")}: {CONTACT_EMAIL}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground space-x-4">
          <span>{t("footer")} &copy; {year}</span>
          <Link href={`/${locale}/donar`} className="hover:text-primary underline underline-offset-2">{t("donarPlataforma")}</Link>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          &copy; <a href="https://www.openstreetmap.org/copyright" className="hover:text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
        </div>
      </div>
    </footer>
  );
}
