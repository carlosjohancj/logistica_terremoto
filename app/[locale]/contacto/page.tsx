import { useTranslations } from "next-intl"
import { Phone, Mail } from "lucide-react"
import { WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/contact-info"

const BACKGROUND_URL =
  "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/countries-ve.webp"

export default function ContactoPage() {
  const t = useTranslations("contact")

  return (
    <section
      className="relative flex min-h-140 items-center bg-cover bg-center"
      style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="container relative mx-auto px-4 py-20">
        <div className="max-w-md rounded-2xl bg-card/85 p-8 shadow-xl ring-1 ring-white/10 backdrop-blur-md sm:p-10">
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>

          <div className="mt-10 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t("phoneLabel")}
              </p>
              <p className="mt-1 flex items-center gap-2 text-lg font-medium">
                <Phone className="size-4 text-primary" />
                {WHATSAPP_NUMBER}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t("emailLabel")}
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 flex items-center gap-2 text-lg font-medium text-primary hover:underline"
              >
                <Mail className="size-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
