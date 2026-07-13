"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabase, TABLES } from "@/types/supabase";
import { HELP_TYPES } from "@/lib/forms/constants";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { NumberedPagination } from "@/components/shared/numbered-pagination";
import {
  SELECT_TRIGGER_CLASS,
  BUTTON_HEIGHT_CLASS,
} from "@/components/shared/field-styles";
import { cn } from "@/lib/utils";
import { AidRequestCard, type AidRequest } from "./aid-request-card";
import { SectionHeader } from "./section-header";

const PAGE_SIZE = 9;

export function FamilyAidSection() {
  const f = useTranslations("familyAid");
  const ht = useTranslations("helpTypes");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";

  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("open");
  const [page, setPage] = useState(1);

  const statusLabels: Record<string, string> = {
    open: f("open"),
    fulfilled: f("fulfilled"),
    closed: f("closed"),
  };

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from(TABLES.FAMILY_AID_REQUESTS)
          .select("*")
          .order("created_at", { ascending: false })
          .range(0, 99);
        setRequests((data ?? []) as AidRequest[]);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatus]);

  const filtered = requests.filter((r) => {
    if (filterType && r.help_type !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section>
      <SectionHeader
        icon={Users}
        title={f("title")}
        description={f("subtitle")}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-2 shrink-0">
          <Search
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-sm font-medium">{f("filters")}:</span>
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v ?? "")}
        >
          <SelectTrigger
            aria-label={f("filters")}
            className={cn(SELECT_TRIGGER_CLASS, "sm:w-44")}
          >
            <SelectValue placeholder={f("all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{f("all")}</SelectItem>
            {HELP_TYPES.map((htype) => (
              <SelectItem key={htype} value={htype}>
                {ht(htype)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v ?? "")}
        >
          <SelectTrigger
            aria-label={f("filters")}
            className={cn(SELECT_TRIGGER_CLASS, "sm:w-40")}
          >
            <SelectValue placeholder={f("all")}>
              {(v: string) => statusLabels[v] ?? f("all")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">{f("open")}</SelectItem>
            <SelectItem value="fulfilled">{f("fulfilled")}</SelectItem>
            <SelectItem value="closed">{f("closed")}</SelectItem>
          </SelectContent>
        </Select>
        <Link href={`/${locale}/donar/solicitar`} className="sm:ml-auto">
          <Button
            className={cn(
              BUTTON_HEIGHT_CLASS,
              "w-full sm:w-auto whitespace-nowrap",
            )}
          >
            {f("formTitle")}
          </Button>
        </Link>
      </div>

      {loading && <SkeletonGrid cols={3} count={6} />}
      {!loading && filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          {f("sinResultados")}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
        {paginated.map((req) => (
          <AidRequestCard key={req.id} request={req} locale={locale} />
        ))}
      </div>

      {!loading && (
        <NumberedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}
