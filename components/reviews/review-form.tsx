"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"

type ReviewFormProps = {
  matchId: string
  toUserId: string
  onSuccess?: () => void
}

export function ReviewForm({ matchId, toUserId, onSuccess }: ReviewFormProps) {
  const tc = useTranslations("common")

  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || !category) {
      toast.error(tc("error"), { description: tc("errorRequired") })
      return
    }

    setSubmitting(true)
    try {
      const pb = getPB()
      await pb.collection(COLLECTIONS.REVIEWS).create({
        match: matchId,
        to_user: toUserId,
        rating,
        category,
        comment,
      })
      toast.success("Reseña publicada")
      setRating(0)
      setCategory("")
      setComment("")
      onSuccess?.()
    } catch {
      toast.error(tc("error"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Puntuación</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              type="button"
              variant={rating >= n ? "default" : "outline"}
              size="sm"
              onClick={() => setRating(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transporte">Transporte</SelectItem>
            <SelectItem value="hospedaje">Hospedaje</SelectItem>
            <SelectItem value="colaboracion">Colaboración</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Comentario</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? tc("loading") : "Publicar reseña"}
      </Button>
    </form>
  )
}
