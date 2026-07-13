"use client"

import { NumberedPagination } from "@/components/shared/numbered-pagination"
import { RequestCard } from "./card"
import { RequestConfirmDialog } from "./confirm-dialog"
import { RequestEmptyState } from "./empty-state"
import { useRequestManager } from "@/hooks/use-request-manager"
import type { TransportistaOffer, TransportRequest } from "@/lib/transportista/request-helpers"

type Props = {
  requests: TransportRequest[]
  profiles: Record<string, { name: string; phone: string }>
  onTakeRequest: (req: TransportRequest) => void
  transportistaOffers?: TransportistaOffer[]
}

export default function RequestManager({ requests, profiles, onTakeRequest, transportistaOffers }: Props) {
  const {
    page,
    setPage,
    totalPages,
    visibleRequests,
    selected,
    selectedCapacityInfo,
    openDialog,
    closeDialog,
    confirmTake,
  } = useRequestManager({ requests, transportistaOffers, onTakeRequest })

  if (requests.length === 0) {
    return <RequestEmptyState />
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            profile={profiles[request.user_id]}
            transportistaOffers={transportistaOffers}
            onTake={openDialog}
          />
        ))}
      </div>

      <NumberedPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />

      <RequestConfirmDialog
        request={selected}
        profile={selected ? profiles[selected.user_id] : undefined}
        capacityInfo={selectedCapacityInfo}
        onCancel={closeDialog}
        onConfirm={confirmTake}
      />
    </>
  )
}
