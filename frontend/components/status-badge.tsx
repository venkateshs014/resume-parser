"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import type { ResumeStatus } from "@/lib/api";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    className: "border-green-200 bg-green-50 text-green-800",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: XCircle,
  },
} satisfies Record<ResumeStatus, { label: string; className: string; icon: ComponentType<{ className?: string }> }>;

export function StatusBadge({ status }: { status: ResumeStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className={`mr-1.5 h-3.5 w-3.5 ${status === "processing" ? "animate-spin" : ""}`} aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
