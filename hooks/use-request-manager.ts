"use client"

import { useMemo, useState } from "react"
import {
  getCapacityInfo,
  type TransportistaOffer,
  type TransportRequest,
} from "@/lib/transportista/request-helpers"

const PAGE_SIZE = 9

interface UseRequestManagerOptions {
  requests: TransportRequest[]
  transportistaOffers?: TransportistaOffer[]
  onTakeRequest: (request: TransportRequest) => void
}

export function useRequestManager({ requests, transportistaOffers, onTakeRequest }: UseRequestManagerOptions) {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<TransportRequest | null>(null)

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))
  const visibleRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return requests.slice(start, start + PAGE_SIZE)
  }, [requests, page])

  const selectedCapacityInfo = useMemo(
    () => (selected ? getCapacityInfo(selected, transportistaOffers) : null),
    [selected, transportistaOffers]
  )

  function openDialog(request: TransportRequest) {
    setSelected(request)
  }

  function closeDialog() {
    setSelected(null)
  }

  function confirmTake() {
    if (!selected) return
    onTakeRequest(selected)
    setSelected(null)
  }

  return {
    page,
    setPage,
    totalPages,
    visibleRequests,
    selected,
    selectedCapacityInfo,
    openDialog,
    closeDialog,
    confirmTake,
  }
}
