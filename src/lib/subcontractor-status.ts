import { DocumentType, SubcontractorRequirement } from "@prisma/client";
import { calculateDocumentStatus, calculateSubcontractorStatus, ComputedDocumentStatus } from "@/lib/status-engine";

type RequirementWithType = SubcontractorRequirement & { documentType: DocumentType };
type DocumentLike = {
  id: string;
  documentTypeId: string;
  expirationDate: Date | null;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  uploadedAt: Date;
};

export function buildSubcontractorStatuses(
  requirements: RequirementWithType[],
  documents: DocumentLike[],
) {
  const latestDocumentPerType = new Map<string, DocumentLike>();

  for (const document of documents) {
    const existing = latestDocumentPerType.get(document.documentTypeId);
    if (!existing || existing.uploadedAt < document.uploadedAt) {
      latestDocumentPerType.set(document.documentTypeId, document);
    }
  }

  const documentStatuses = requirements.map((requirement) => {
    const latest = latestDocumentPerType.get(requirement.documentTypeId);
    const status = calculateDocumentStatus({
      exists: Boolean(latest),
      expirationDate: latest?.expirationDate,
      reviewStatus: latest?.reviewStatus,
      reminderDays: requirement.documentType.reminderDays,
    });

    return {
      requirementId: requirement.id,
      documentTypeId: requirement.documentTypeId,
      documentTypeName: requirement.documentType.name,
      status,
      expirationDate: latest?.expirationDate ?? null,
      uploadedAt: latest?.uploadedAt ?? null,
      documentId: latest?.id ?? null,
    };
  });

  const subcontractorStatus = calculateSubcontractorStatus(
    documentStatuses.map((item) => item.status as ComputedDocumentStatus),
  );

  return {
    subcontractorStatus,
    documentStatuses,
  };
}
