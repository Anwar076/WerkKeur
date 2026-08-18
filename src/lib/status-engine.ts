import { addDays, isBefore, startOfDay } from "date-fns";
import { DocumentReviewStatus, SubcontractorComputedStatus } from "@prisma/client";

export type ComputedDocumentStatus =
  | "MISSING"
  | "PENDING"
  | "VALID"
  | "EXPIRING"
  | "EXPIRED"
  | "REJECTED";

type DocumentStatusInput = {
  exists: boolean;
  expirationDate?: Date | null;
  reviewStatus?: DocumentReviewStatus;
  reminderDays?: number;
};

export function calculateDocumentStatus({
  exists,
  expirationDate,
  reviewStatus,
  reminderDays = 30,
}: DocumentStatusInput): ComputedDocumentStatus {
  if (!exists) {
    return "MISSING";
  }

  if (reviewStatus === DocumentReviewStatus.REJECTED) {
    return "REJECTED";
  }

  if (!expirationDate) {
    return reviewStatus === DocumentReviewStatus.PENDING ? "PENDING" : "VALID";
  }

  const today = startOfDay(new Date());
  const threshold = addDays(today, reminderDays);
  const expires = startOfDay(expirationDate);

  if (isBefore(expires, today)) {
    return "EXPIRED";
  }

  if (expires <= threshold) {
    return "EXPIRING";
  }

  return reviewStatus === DocumentReviewStatus.PENDING ? "PENDING" : "VALID";
}

export function calculateSubcontractorStatus(
  documentStatuses: ComputedDocumentStatus[],
): SubcontractorComputedStatus {
  if (
    documentStatuses.some((status) =>
      ["MISSING", "EXPIRED", "REJECTED"].includes(status),
    )
  ) {
    return SubcontractorComputedStatus.ACTION_REQUIRED;
  }

  if (documentStatuses.some((status) => status === "EXPIRING")) {
    return SubcontractorComputedStatus.ATTENTION;
  }

  return SubcontractorComputedStatus.COMPLIANT;
}
