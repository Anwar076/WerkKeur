import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { db } from "@/lib/db";
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

export async function GET(request: Request) {
  const context = await getContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const statusFilter = searchParams.get("status");

  const subcontractors = await db.subcontractor.findMany({
    where: {
      organizationId: context.organizationId,
      companyName: query ? { contains: query, mode: "insensitive" } : undefined,
    },
    include: {
      requirements: {
        include: { documentType: true },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = subcontractors.map((subcontractor) => {
    const status = buildSubcontractorStatuses(subcontractor.requirements, subcontractor.documents);
    return {
      id: subcontractor.id,
      companyName: subcontractor.companyName,
      contactName:
        [subcontractor.contactFirstName, subcontractor.contactLastName].filter(Boolean).join(" ") ||
        "—",
      contactEmail: subcontractor.contactEmail,
      createdAt: subcontractor.createdAt,
      lastActivityAt: subcontractor.lastActivityAt,
      documentsRequired: subcontractor.requirements.length,
      status: status.subcontractorStatus,
    };
  });

  const filtered =
    statusFilter && statusFilter !== "ALL"
      ? rows.filter((row) => row.status === statusFilter)
      : rows;

  return NextResponse.json({ data: filtered });
}

export async function POST(request: Request) {
  const context = await getContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(context.role, "manageSubcontractors")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = subcontractorSchema.parse(body);

    const subcontractor = await db.$transaction(async (tx) => {
      const created = await tx.subcontractor.create({
        data: {
          organizationId: context.organizationId,
          companyName: parsed.companyName,
          kvkNumber: parsed.kvkNumber || null,
          vatNumber: parsed.vatNumber || null,
          contactFirstName: parsed.contactFirstName || null,
          contactLastName: parsed.contactLastName || null,
          contactEmail: parsed.contactEmail || null,
          contactPhone: parsed.contactPhone || null,
          lastActivityAt: new Date(),
        },
      });

      if (parsed.requirementDocumentTypeIds.length > 0) {
        await tx.subcontractorRequirement.createMany({
          data: parsed.requirementDocumentTypeIds.map((documentTypeId) => ({
            organizationId: context.organizationId,
            subcontractorId: created.id,
            documentTypeId,
            required: true,
          })),
        });
      }

      return created;
    });

    await logActivity({
      organizationId: context.organizationId,
      actorUserId: context.userId,
      action: "SUBCONTRACTOR_CREATED",
      entityType: "Subcontractor",
      entityId: subcontractor.id,
      metadata: {
        companyName: subcontractor.companyName,
      },
    });

    return NextResponse.json({ ok: true, subcontractorId: subcontractor.id });
  } catch {
    return NextResponse.json({ error: "Onderaannemer aanmaken is mislukt." }, { status: 400 });
  }
}
