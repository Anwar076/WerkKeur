import { db } from "@/lib/db";
import { deletePrivateFile } from "@/lib/storage";

export async function deleteSubcontractorData(organizationId: string, subcontractorId: string) {
  const documents = await db.document.findMany({
    where: {
      organizationId,
      subcontractorId,
      deletedAt: null,
    },
    select: {
      id: true,
      storageKey: true,
    },
  });

  for (const document of documents) {
    await deletePrivateFile(document.storageKey);
  }

  await db.$transaction([
    db.document.updateMany({
      where: { organizationId, subcontractorId },
      data: { deletedAt: new Date() },
    }),
    db.subcontractor.deleteMany({
      where: { id: subcontractorId, organizationId },
    }),
  ]);
}
