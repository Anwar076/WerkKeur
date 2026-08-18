import { SubcontractorComputedStatus } from "@prisma/client";
import { ComputedDocumentStatus } from "@/lib/status-engine";

export const subcontractorStatusMeta: Record<
  SubcontractorComputedStatus,
  { label: string; className: string }
> = {
  COMPLIANT: {
    label: "In orde",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  ATTENTION: {
    label: "Aandacht nodig",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  ACTION_REQUIRED: {
    label: "Actie vereist",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export const documentStatusMeta: Record<
  ComputedDocumentStatus,
  { label: string; className: string }
> = {
  MISSING: { label: "Ontbreekt", className: "bg-red-100 text-red-800 border-red-200" },
  PENDING: { label: "In behandeling", className: "bg-slate-100 text-slate-800 border-slate-200" },
  VALID: { label: "Geldig", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  EXPIRING: { label: "Verloopt binnenkort", className: "bg-amber-100 text-amber-800 border-amber-200" },
  EXPIRED: { label: "Verlopen", className: "bg-red-100 text-red-800 border-red-200" },
  REJECTED: { label: "Afgekeurd", className: "bg-red-100 text-red-800 border-red-200" },
};
