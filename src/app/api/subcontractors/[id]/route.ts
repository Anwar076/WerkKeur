import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { db } from "@/lib/db";
import { deleteSubcontractorData } from "@/lib/gdpr";
import { hasPermission } from "@/lib/permissions";
import { buildSubcontractorStatuses } from "@/lib/subcontractor-status";
import { subcontractorSchema } from "@/lib/validation";

async function getContext() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId || !session.user.role) {
    return null;
  }

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role as Role,
  };
}

type Params = Promise<{ id: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const authContext = await getContext();
  if (!authContext) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { id } = await context.params;

  const subcontractor = await db.subcontractor.findFirst({
    where: {
      id,
      organizationId: authContext.organizationId,
    },
    include: {
      requirements: {
        include: { documentType: true },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: "desc" },
      },
      documentRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!subcontractor) {
    return NextResponse.json({ error: "Onderaannemer niet gevonden." }, { status: 404 });
  }

  const status = buildSubcontractorStatuses(subcontractor.requirements, subcontractor.documents);
  return NextResponse.json({
    data: {
      ...subcontractor,
      ...status,
    },
  });
}

export async function PATCH(request: Request, context: { params: Params }) {
  const authContext = await getContext();
  if (!authContext) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(authContext.role, "manageSubcontractors")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;

  const existing = await db.subcontractor.findFirst({
    where: { id, organizationId: authContext.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Onderaannemer niet gevonden." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = subcontractorSchema.partial().parse(body);

    const updated = await db.subcontractor.update({
      where: { id: existing.id },
      data: {
        companyName: parsed.companyName ?? existing.companyName,
        kvkNumber: parsed.kvkNumber ?? existing.kvkNumber,
        vatNumber: parsed.vatNumber ?? existing.vatNumber,
        contactFirstName: parsed.contactFirstName ?? existing.contactFirstName,
        contactLastName: parsed.contactLastName ?? existing.contactLastName,
        contactEmail: parsed.contactEmail ?? existing.contactEmail,
        contactPhone: parsed.contactPhone ?? existing.contactPhone,
        lastActivityAt: new Date(),
      },
    });

    await logActivity({
      organizationId: authContext.organizationId,
      actorUserId: authContext.userId,
      action: "SUBCONTRACTOR_UPDATED",
      entityType: "Subcontractor",
      entityId: updated.id,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bijwerken mislukt." }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: { params: Params }) {
  const authContext = await getContext();
  if (!authContext) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(authContext.role, "manageSubcontractors")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await db.subcontractor.findFirst({
    where: { id, organizationId: authContext.organizationId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Onderaannemer niet gevonden." }, { status: 404 });
  }

  await deleteSubcontractorData(authContext.organizationId, existing.id);

  await logActivity({
    organizationId: authContext.organizationId,
    actorUserId: authContext.userId,
    action: "SUBCONTRACTOR_UPDATED",
    entityType: "Subcontractor",
    entityId: existing.id,
    metadata: { deleted: true },
  });

  return NextResponse.json({ ok: true });
}
