import { SkeletonGrid } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="h-8 w-56 bg-muted rounded animate-pulse mb-6" />
      <SkeletonGrid cols={1} count={5} />
    </div>
  )
}
