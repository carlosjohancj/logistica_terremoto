"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type AidRequest = {
  id: string
  title: string
  description: string
  story: string
  amount_needed: number
  help_type: string
  location_state: string
  location_city: string
  status: string
  created_at: string
}

export function AidRequestCard({ request, locale }: { request: AidRequest; locale: string }) {
  const f = useTranslations("familyAid")
  const ht = useTranslations("helpTypes")

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 gap-2">
        <Badge variant="secondary" className="w-fit whitespace-normal text-left h-auto py-1">
          {ht(request.help_type)}
        </Badge>
        <CardTitle className="text-base">{request.title}</CardTitle>
        {request.description && (
          <CardDescription className="line-clamp-2">{request.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {request.amount_needed && <span>{f("cantidad")}: ${request.amount_needed}</span>}
          {(request.location_city || request.location_state) && (
            <span>
              {request.location_city}
              {request.location_city && request.location_state ? ", " : ""}
              {request.location_state}
            </span>
          )}
          <span>{new Date(request.created_at).toLocaleDateString()}</span>
        </div>
        {request.story && (
          <p className="text-xs text-muted-foreground italic line-clamp-2 border-l-2 border-primary/20 pl-3">
            {request.story}
          </p>
        )}
        <div className="mt-auto pt-2">
          <Link href={`/${locale}/contacto`}>
            <Button
              className="w-full h-11 gap-2 rounded-full bg-accent text-accent-foreground font-semibold shadow-md shadow-accent/30 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/40"
            >
              <MessageCircle className="h-4 w-4" />
              {f("contactar")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
