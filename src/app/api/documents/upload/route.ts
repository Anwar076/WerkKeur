import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { db } from "@/lib/db";
import { notifyOrganizationMembers } from "@/lib/notifications";
import { hasPermission } from "@/lib/permissions";
import { storePrivateFile } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(session.user.role as Role, "manageDocuments")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const formData = await request.formData();
  const subcontractorId = formData.get("subcontractorId");
  const documentTypeId = formData.get("documentTypeId");
  const file = formData.get("file");
  const expirationDateRaw = formData.get("expirationDate");
  const issueDateRaw = formData.get("issueDate");

  if (!(file instanceof File) || typeof subcontractorId !== "string" || typeof documentTypeId !== "string") {
    return NextResponse.json({ error: "Verplichte velden ontbreken." }, { status: 400 });
  }

  const subcontractor = await db.subcontractor.findFirst({
    where: {
      id: subcontractorId,
      organizationId: session.user.organizationId,
    },
  });

  if (!subcontractor) {
    return NextResponse.json({ error: "Onderaannemer niet gevonden." }, { status: 404 });
  }

  const documentType = await db.documentType.findFirst({
    where: {
      id: documentTypeId,
      organizationId: session.user.organizationId,
    },
  });

  if (!documentType) {
    return NextResponse.json({ error: "Documenttype niet gevonden." }, { status: 404 });
  }

  try {
    const stored = await storePrivateFile(file);
    const issueDate = typeof issueDateRaw === "string" && issueDateRaw ? new Date(issueDateRaw) : null;
    const expirationDate =
      typeof expirationDateRaw === "string" && expirationDateRaw ? new Date(expirationDateRaw) : null;

    const document = await db.document.create({
      data: {
        organizationId: session.user.organizationId,
        subcontractorId,
        documentTypeId,
        originalFilename: stored.originalFilename,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        issueDate,
        expirationDate,
        uploadedById: session.user.id,
        reviewStatus: "APPROVED",
      },
    });

    await db.subcontractor.update({
      where: { id: subcontractorId },
      data: { lastActivityAt: new Date() },
    });

    await logActivity({
      organizationId: session.user.organizationId,
      actorUserId: session.user.id,
      action: "DOCUMENT_UPLOADED",
      entityType: "Document",
      entityId: document.id,
      metadata: {
        subcontractorId,
      },
    });

    await notifyOrganizationMembers(session.user.organizationId, {
      type: "DOCUMENT_RECEIVED",
      title: "Document ontvangen",
      message: `${subcontractor.companyName} heeft een ${documentType.name} document aangeleverd.`,
      relatedEntityType: "Subcontractor",
      relatedEntityId: subcontractorId,
    });

    return NextResponse.json({ ok: true, documentId: document.id });
  } catch {
    return NextResponse.json({ error: "Uploaden mislukt." }, { status: 400 });
  }
}
