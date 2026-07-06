"use client";

import { useEffect, useState } from "react";
import { getSupabase, TABLES } from "@/lib/supabase";

export type JobDetail = {
  id: string;
  title: string;
  company?: { name: string } | null;
  description: string;
  requirements: string;
  location_state: string;
  location_city: string;
  modality: string;
  salary_range: string;
  contact_email: string;
  created_at: string;
};

interface UseJobDetailOptions {
  jobId: string | null;
  jobIds: string[];
  onError?: () => void;
}

export function useJobDetail({ jobId, jobIds, onError }: UseJobDetailOptions) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const loading = !!jobId && job?.id !== jobId;

  const currentIndex = jobId ? jobIds.indexOf(jobId) : -1;
  const previousId = currentIndex > 0 ? jobIds[currentIndex - 1] : null;
  const nextId =
    currentIndex >= 0 && currentIndex < jobIds.length - 1
      ? jobIds[currentIndex + 1]
      : null;

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    async function fetchJob() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from(TABLES.JOBS)
          .select("*, company:companies(name)")
          .eq("id", jobId)
          .single();
        if (active) setJob(data as unknown as JobDetail);
      } catch {
        if (active) onError?.();
      }
    }
    fetchJob();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return { job, loading, previousId, nextId };
}
