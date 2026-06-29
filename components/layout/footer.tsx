"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const t = useTranslations("home");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg text-primary mb-3">Desde Cero</h3>
            <p className="text-sm text-muted-foreground">{t("heroDesc")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Enlaces</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href={`/${locale}/solicitar-viaje`} className="hover:text-primary">{t("ctaSolicitar")}</Link></li>
              <li><Link href={`/${locale}/ofrecer-transporte`} className="hover:text-primary">{t("ctaTransporte")}</Link></li>
              <li><Link href={`/${locale}/ofrecer-hospedaje`} className="hover:text-primary">{t("ctaHospedaje")}</Link></li>
              <li><Link href={`/${locale}/donar`} className="hover:text-primary">{t("ctaDonar")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Ayuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">Preguntas frecuentes</span></li>
              <li><span className="cursor-default">Contacto</span></li>
              <li><span className="cursor-default">Términos de uso</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>WhatsApp: +58 XXX-XXX-XXXX</li>
              <li>Email: contacto@desdecero.org</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>{t("footer")} &copy; {year}</p>
        </div>
      </div>
    </footer>
  );
}
