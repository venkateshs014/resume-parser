"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ParsedResumePanel } from "@/components/parsed-resume-panel";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResume, type ResumeRead } from "@/lib/api";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;

export function ResultView({ resumeId }: { resumeId: string }) {
  const [resume, setResume] = useState<ResumeRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const next = await getResume(resumeId);
        if (cancelled) {
          return;
        }
        setResume(next);
        if (next.status === "pending" || next.status === "processing") {
          if (attempts >= MAX_POLL_ATTEMPTS) {
            setError("Processing is taking longer than expected. Refresh this page to check again.");
            return;
          }
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load resume");
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [resumeId]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            Processing error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!resume) {
    return (
      <Card>
        <CardContent className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          Loading resume...
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{resume.filename ?? resume.original_filename ?? "Resume"}</CardTitle>
            <CardDescription>Resume ID: {resume.id}</CardDescription>
          </div>
          <StatusBadge status={resume.status} />
        </CardHeader>
      </Card>

      {resume.status === "failed" ? (
        <Card>
          <CardHeader>
            <CardTitle>Failed</CardTitle>
            <CardDescription>{resume.error_message ?? "The backend could not process this resume."}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {resume.parsed_data ? (
        <ParsedResumePanel resume={resume.parsed_data} />
      ) : (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
            Processing resume data...
          </CardContent>
        </Card>
      )}
    </section>
  );
}
