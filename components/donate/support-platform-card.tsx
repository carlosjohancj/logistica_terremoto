"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"

export function SupportPlatformCard() {
  const t = useTranslations("donate")

  return (
    <Card className="mb-12">
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">{t("plataformaTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("plataformaDesc")}</p>
        <Link href="https://paypal.me/desdecero" target="_blank">
          <Button className={cn(BUTTON_HEIGHT_CLASS, "rounded-full px-10 gap-2")}>
            <Heart className="h-4 w-4" /> {t("heroCta")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
