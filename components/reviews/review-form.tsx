"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { reviewSchema, ReviewValues } from "@/lib/schemas/review"

type ReviewFormProps = {
  matchId: string
  toUserId: string
  onSuccess?: () => void
}

export function ReviewForm({ matchId, toUserId, onSuccess }: ReviewFormProps) {
  const tc = useTranslations("common")

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: "",
    },
  })

  async function onSubmit(values: ReviewValues) {
    try {
      const supabase = getSupabase()
      await supabase
        .from(TABLES.REVIEWS)
        .insert({
          match: matchId,
          to_user: toUserId,
          rating: values.rating,
          category: values.category,
          comment: values.comment,
        })
        .select()
        .single()
      toast.success("Reseña publicada")
      reset()
      onSuccess?.()
    } catch {
      toast.error(tc("error"))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Puntuación</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={field.value >= n ? "default" : "outline"}
                  size="sm"
                  onClick={() => field.onChange(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="hospedaje">Hospedaje</SelectItem>
                <SelectItem value="colaboracion">Colaboración</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Comentario</Label>
        <Textarea {...register("comment")} rows={3} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? tc("loading") : "Publicar reseña"}
      </Button>
    </form>
  )
}
