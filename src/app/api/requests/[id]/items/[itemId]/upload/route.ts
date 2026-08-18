import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyOrganizationMembers } from "@/lib/notifications";
import { assertRateLimit } from "@/lib/rate-limit";
import { hashToken, isRequestTokenUsable } from "@/lib/tokens";
import { storePrivateFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";

type Params = Promise<{ id: string; itemId: string }>;

export async function POST(request: Request, context: { params: Params }) {
  try {
    const { id, itemId } = await context.params;
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    assertRateLimit(`public-upload:${ip}`, { maxRequests: 30, windowMs: 60_000 });

    const formData = await request.formData();
    const token = formData.get("token");
    const file = formData.get("file");
    const expirationDateRaw = formData.get("expirationDate");
    const issueDateRaw = formData.get("issueDate");

    if (typeof token !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "Ongeldige uploaddata." }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const documentRequest = await db.documentRequest.findFirst({
      where: {
        id,
        tokenHash,
        revokedAt: null,
        tokenExpiresAt: {
          gt: new Date(),
        },
      },
      include: {
        subcontractor: true,
        items: {
          where: { id: itemId },
          include: { documentType: true },
        },
      },
    });

    if (
      !documentRequest ||
      !isRequestTokenUsable({
        revokedAt: documentRequest.revokedAt,
        tokenExpiresAt: documentRequest.tokenExpiresAt,
        now: new Date(),
      })
    ) {
      return NextResponse.json({ error: "Uploadlink ongeldig of verlopen." }, { status: 403 });
    }

    const requestItem = documentRequest.items[0];
    if (!requestItem) {
      return NextResponse.json({ error: "Verzoekregel niet gevonden." }, { status: 404 });
    }

    const stored = await storePrivateFile(file);
    const issueDate = typeof issueDateRaw === "string" && issueDateRaw ? new Date(issueDateRaw) : null;
    const expirationDate =
      typeof expirationDateRaw === "string" && expirationDateRaw ? new Date(expirationDateRaw) : null;

    const document = await db.document.create({
      data: {
        organizationId: documentRequest.organizationId,
        subcontractorId: documentRequest.subcontractorId,
        documentTypeId: requestItem.documentTypeId,
        requestItemId: requestItem.id,
        originalFilename: stored.originalFilename,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        issueDate,
        expirationDate,
        reviewStatus: "PENDING",
      },
    });

    await db.documentRequestItem.update({
      where: { id: requestItem.id },
      data: {
        status: "RECEIVED",
        fulfilledAt: new Date(),
      },
    });

    const requestItems = await db.documentRequestItem.findMany({
      where: { documentRequestId: documentRequest.id },
    });

    const received = requestItems.filter((item) => item.status === "RECEIVED").length;
    const newStatus = received === requestItems.length ? "COMPLETE" : received > 0 ? "PARTIAL" : "OPEN";

    await db.documentRequest.update({
      where: { id: documentRequest.id },
      data: {
        status: newStatus,
      },
    });

    await db.subcontractor.update({
      where: { id: documentRequest.subcontractorId },
      data: { lastActivityAt: new Date() },
    });

    await logActivity({
      organizationId: documentRequest.organizationId,
      action: "DOCUMENT_UPLOADED",
      entityType: "Document",
      entityId: document.id,
      metadata: {
        subcontractorId: documentRequest.subcontractorId,
        source: "public-request-upload",
      },
    });

    await notifyOrganizationMembers(documentRequest.organizationId, {
      type: "DOCUMENT_RECEIVED",
      title: "Document ontvangen",
      message: `${documentRequest.subcontractor.companyName} heeft ${requestItem.documentType.name} aangeleverd.`,
      relatedEntityType: "DocumentRequest",
      relatedEntityId: documentRequest.id,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Uploaden mislukt of te veel verzoeken." }, { status: 400 });
  }
}
