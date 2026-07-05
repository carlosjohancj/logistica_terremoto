"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { Search, Download, Eye, Tag } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"

type Graphic = {
  id: string
  title: string
  description: string
  category: string
  file: string
  thumbnail: string
  tags: string
  downloads: number
  status: string
  collectionId: string
  collectionName: string
}

export default function RecursosPage() {
  const t = useTranslations("graphics")
  const tc = useTranslations("common")

  const [items, setItems] = useState<Graphic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [preview, setPreview] = useState<Graphic | null>(null)


  const categories = [
    { value: "flyer", label: t("flyer") },
    { value: "infografia", label: t("infografia") },
    { value: "banner", label: t("banner") },
    { value: "logo", label: t("logo") },
    { value: "manual", label: t("manual") },
    { value: "otro", label: t("otro") },
  ]

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const res = await supabase.from(TABLES.GRAPHICS).select("*").eq("status", "published").order("created_at", { ascending: false })
        setItems((res.data || []) as unknown as Graphic[])
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function fileUrl(item: Graphic, field: "file" | "thumbnail") {
    if (!item[field]) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/graphics/${item[field]}`
  }

  async function trackDownload(item: Graphic) {
    try {
      const supabase = getSupabase()
      await supabase.from(TABLES.GRAPHICS).update({
        downloads: (item.downloads || 0) + 1,
      }).eq("id", item.id)
    } catch {}
  }

  const filtered = items.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !item.title.toLowerCase().includes(q) &&
        !(item.tags || "").toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t("category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("all")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <SkeletonGrid cols={4} count={8} />}
      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground">{t("noResults")}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <button
              type="button"
              className="aspect-video bg-muted relative cursor-pointer overflow-hidden w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setPreview(item)}
              aria-label={item.title}
            >
              {item.thumbnail || item.file ? (
                <img
                  src={fileUrl(item, item.thumbnail ? "thumbnail" : "file") || ""}
                  alt=""
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Eye className="h-8 w-8" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm">{item.title}</CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {t(item.category)}
                </Badge>
              </div>
              {item.description && (
                <CardDescription className="text-xs line-clamp-2">
                  {item.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.tags && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {item.tags.split(",").slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreview(item)}
                    aria-label={tc("view")}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("download")}
                    nativeButton={false}
                    render={
                      <a
                        href={fileUrl(item, "file") || "#"}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackDownload(item)}
                      />
                    }
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>{preview.title}</DialogTitle>
                {preview.description && (
                  <DialogDescription>{preview.description}</DialogDescription>
                )}
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                {preview.file && (
                  <img
                    src={fileUrl(preview, "file") || ""}
                    alt={preview.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t(preview.category)}</Badge>
                  {preview.tags && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {preview.tags}
                    </span>
                  )}
                </div>
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={fileUrl(preview, "file") || "#"}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackDownload(preview)}
                    />
                  }
                >
                  <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                  {t("download")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
