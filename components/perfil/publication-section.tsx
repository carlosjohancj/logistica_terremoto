"use client"

import { useState } from "react"
import { NumberedPagination } from "@/components/shared/numbered-pagination"
import { PublicationCard } from "./publication-card"
import type { Publication, PublicationKind, PublicationRecord } from "./publication-types"

const PAGE_SIZE = 6

export function PublicationSection({
  title,
  kind,
  items,
  onSelect,
}: {
  title: string
  kind: PublicationKind
  items: PublicationRecord[]
  onSelect: (publication: Publication) => void
}) {
  const [page, setPage] = useState(1)

  if (items.length === 0) return null

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((item) => (
          <PublicationCard
            key={item.id}
            publication={{ kind, data: item }}
            onClick={() => onSelect({ kind, data: item })}
          />
        ))}
      </div>
      <NumberedPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
    </section>
  )
}
