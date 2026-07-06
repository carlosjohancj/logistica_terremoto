"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type Provider = {
  id: string
  name: string
  description: string
  website: string
  donation_link: string
  contact_email: string
  contact_phone: string
  services: string[]
  logo_url: string
}

const MAX_VISIBLE_SERVICES = 2

export function ProviderCard({ provider }: { provider: Provider }) {
  const t = useTranslations("donate")
  const tc = useTranslations("common")
  const ht = useTranslations("helpTypes")

  const services = provider.services ?? []
  const visibleServices = services.slice(0, MAX_VISIBLE_SERVICES)
  const extraCount = services.length - visibleServices.length

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex h-full flex-col gap-3">
        {provider.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={provider.logo_url} alt={provider.name} className="h-10 w-auto object-contain" />
        )}
        <div>
          <h3 className="text-lg font-semibold line-clamp-1">{provider.name}</h3>
          {provider.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{provider.description}</p>
          )}
        </div>
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleServices.map((s) => (
              <span
                key={s}
                title={ht(s)}
                className="max-w-36 truncate text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
              >
                {ht(s)}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                +{extraCount}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {provider.donation_link && (
            <Link href={provider.donation_link} target="_blank">
              <Button variant="default" className="rounded-full gap-1.5 h-10 px-5">
                {t("heroCta")} <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {provider.website && (
            <Link href={provider.website} target="_blank">
              <Button variant="outline" className="rounded-full gap-1.5 h-10 px-5">
                {tc("view")} <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
