"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { SkeletonDetail } from "@/components/ui/skeleton"
import {
  Package, MapPin, Truck, Phone, User,
  ChevronLeft, ShoppingCart,
} from "lucide-react"

type Supply = {
  id: string
  type: "offer" | "request"
  category: string
  title: string
  description: string
  quantity: number
  condition: string
  state: string
  municipality: string
  city: string
  address: string
  contact_name: string
  contact_phone: string
  needs_transport: boolean
  status: string
  created: string
}

export default function SupplyDetailPage() {
  const t = useTranslations("supplies")
  const tc = useTranslations("common")
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<Supply | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItem() {
      try {
        const supabase = getSupabase()
        const { data: res } = await supabase.from(TABLES.SUPPLIES).select("*").eq("id", id).single()
        setItem(res as unknown as Supply)
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  if (loading) return <SkeletonDetail />
  if (!item) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4 mr-1" /> {tc("back")}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl mb-1">{item.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                {t(item.category)}
              </div>
            </div>
            <Badge
              variant={item.type === "offer" ? "default" : "secondary"}
              className="shrink-0 text-sm px-3 py-1"
            >
              {item.type === "offer" ? t("iOffer") : t("iNeed")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {[item.city, item.municipality, item.state].filter(Boolean).join(", ")}
            </span>
            {item.quantity > 0 && (
              <span>{t("qty")}: {item.quantity}</span>
            )}
            {item.condition && (
              <span>{t("condition")}: {t(item.condition)}</span>
            )}
          </div>

          {item.description && (
            <div>
              <h3 className="font-semibold mb-2">{t("description")}</h3>
              <p className="text-muted-foreground whitespace-pre-line">{item.description}</p>
            </div>
          )}

          {item.address && (
            <div>
              <h3 className="font-semibold mb-2">{t("address")}</h3>
              <p className="text-muted-foreground">{item.address}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">{t("contact")}</h3>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" /> {item.contact_name}
              </span>
              {item.contact_phone && (
                <a
                  href={`https://wa.me/${item.contact_phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" /> {item.contact_phone}
                </a>
              )}
            </div>
          </div>

          {item.needs_transport && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t("needsTransport")}</p>
                  <p className="text-sm text-muted-foreground">{t("transportDesc")}</p>
                  <Link href={`/explorar?state=${item.state}`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {t("findTransport")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
