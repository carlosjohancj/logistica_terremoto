"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Briefcase,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useJobDetail } from "@/hooks/use-job-detail";

interface JobDetailDialogProps {
  jobId: string | null;
  jobIds: string[];
  onOpenChange: (open: boolean) => void;
  onNavigate: (id: string) => void;
}

export function JobDetailDialog({
  jobId,
  jobIds,
  onOpenChange,
  onNavigate,
}: JobDetailDialogProps) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");

  const { job, loading, previousId, nextId } = useJobDetail({
    jobId,
    jobIds,
    onError: () => toast.error(tc("error")),
  });

  return (
    <Dialog open={!!jobId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {loading && (
          <p className="text-center text-muted-foreground py-8">
            {tc("loading")}
          </p>
        )}
        {!loading && job && (
          <>
            <DialogHeader className="pr-8">
              <Badge
                variant="outline"
                className="w-fit h-auto px-3 py-1.5 text-base font-medium"
              >
                {t(job.modality)}
              </Badge>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary shrink-0" />
                <DialogTitle className="text-2xl">{job.title}</DialogTitle>
              </div>
              <DialogDescription className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {job.company?.name || "Empresa"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location_city}, {job.location_state}
                </span>
                {job.salary_range && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.salary_range}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t("postedDate")}:{" "}
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t("description")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {job.description || t("noDescription")}
                </p>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="font-semibold mb-2">{t("requirements")}</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  {t("contact")}
                </p>
                <a
                  href={`mailto:${job.contact_email}`}
                  className="inline-flex items-center gap-2"
                >
                  <Button size="lg" className="w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-1" />
                    {t("applyEmail")}
                  </Button>
                </a>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                disabled={!previousId}
                onClick={() => previousId && onNavigate(previousId)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {tc("previous")}
              </Button>
              <Button
                variant="outline"
                disabled={!nextId}
                onClick={() => nextId && onNavigate(nextId)}
              >
                {tc("next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
