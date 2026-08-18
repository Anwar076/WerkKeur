import { addDays, isAfter, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import { buildSubcontractorStatuses } from "@/lib/subcontractor-status";

export async function getDashboardData(organizationId: string) {
  const subcontractors = await db.subcontractor.findMany({
    where: { organizationId },
    include: {
      requirements: {
        include: { documentType: true },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: "desc" },
      },
    },
    orderBy: { companyName: "asc" },
  });

  const mapped = subcontractors.map((subcontractor) => {
    const statusResult = buildSubcontractorStatuses(subcontractor.requirements, subcontractor.documents);
    return {
      ...subcontractor,
      ...statusResult,
    };
  });

  const actionRequired = mapped.filter((item) => item.subcontractorStatus === "ACTION_REQUIRED");
  const attention = mapped.filter((item) => item.subcontractorStatus === "ATTENTION");
  const compliant = mapped.filter((item) => item.subcontractorStatus === "COMPLIANT");

  const soonDate = addDays(startOfDay(new Date()), 30);
  const expiringDocuments = mapped.flatMap((subcontractor) =>
    subcontractor.documentStatuses
      .filter((item) => item.expirationDate && isAfter(soonDate, item.expirationDate))
      .map((item) => ({
        subcontractorId: subcontractor.id,
        subcontractorName: subcontractor.companyName,
        ...item,
      })),
  );

  const recentActivity = await db.activityLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return {
    totals: {
      subcontractors: mapped.length,
      compliant: compliant.length,
      attention: attention.length,
      actionRequired: actionRequired.length,
    },
    actionRequired: actionRequired.slice(0, 8),
    expiringDocuments: expiringDocuments.slice(0, 8),
    recentActivity,
  };
}
