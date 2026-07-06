"use client"

import { useEffect, useState } from "react"
import { getSupabase, TABLES } from "@/lib/supabase"
import type { Job } from "@/components/jobs/job-card"

const PAGE_SIZE = 15

interface UseJobsListingOptions {
  onError?: () => void
}

export function useJobsListing({ onError }: UseJobsListingOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterModality, setFilterModality] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from(TABLES.JOBS)
          .select("*, company:companies(name)")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .range(0, 99)
        setJobs((data ?? []) as unknown as Job[])
      } catch {
        onError?.()
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, filterState, filterModality])

  const filtered = jobs.filter((job) => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !job.title.toLowerCase().includes(q) &&
        !(job.company?.name || "").toLowerCase().includes(q)
      )
        return false
    }
    if (filterState && job.location_state !== filterState) return false
    if (filterModality && job.modality !== filterModality) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return {
    jobs: paginated,
    loading,
    isEmpty: !loading && filtered.length === 0,
    search,
    setSearch,
    filterState,
    setFilterState,
    filterModality,
    setFilterModality,
    currentPage,
    totalPages,
    setPage,
  }
}
