"use client"

import { useTranslations } from "next-intl"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

interface NumberedPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function NumberedPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: NumberedPaginationProps) {
  const tc = useTranslations("common")

  if (totalPages <= 1) return null

  return (
    <Pagination className={cn("mt-8", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text={tc("previous")}
            className="rounded-full"
            onClick={(e) => {
              e.preventDefault()
              onPageChange(Math.max(1, currentPage - 1))
            }}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <PaginationItem key={n}>
            <PaginationLink
              href="#"
              isActive={n === currentPage}
              className={
                n === currentPage
                  ? "rounded-full bg-primary! text-primary-foreground! hover:bg-primary/90!"
                  : "rounded-full"
              }
              onClick={(e) => {
                e.preventDefault()
                onPageChange(n)
              }}
            >
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            text={tc("next")}
            className="rounded-full"
            onClick={(e) => {
              e.preventDefault()
              onPageChange(Math.min(totalPages, currentPage + 1))
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
