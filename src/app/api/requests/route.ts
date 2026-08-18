import { addDays } from "date-fns";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { documentRequestTemplate } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { hasPermission } from "@/lib/permissions";
import { generateDocumentRequestToken } from "@/lib/tokens";
import { requestCreationSchema } from "@/lib/validation";

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

export async function GET() {
  const context = await getContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const data = await db.documentRequest.findMany({
    where: {
      organizationId: context.organizationId,
    },
    include: {
      subcontractor: true,
      items: {
        include: {
          documentType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = data.map((request) => {
    const total = request.items.length;
    const received = request.items.filter((item) => item.status === "RECEIVED").length;
    return {
      id: request.id,
      subcontractorName: request.subcontractor.companyName,
      recipient: request.subcontractor.contactEmail,
      requestedDocuments: request.items.map((item) => item.documentType.name),
      dateSent: request.sentAt,
      progress: `${received}/${total}`,
      status: request.status,
      lastReminder: request.lastReminderSentAt,
    };
  });

  return NextResponse.json({ data: mapped });
}

export async function POST(request: Request) {
  const context = await getContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(context.role, "manageRequests")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = requestCreationSchema.parse(body);

    const subcontractor = await db.subcontractor.findFirst({
      where: {
        id: parsed.subcontractorId,
        organizationId: context.organizationId,
      },
    });

    if (!subcontractor) {
      return NextResponse.json({ error: "Onderaannemer niet gevonden." }, { status: 404 });
    }

    const organization = await db.organization.findUnique({
      where: { id: context.organizationId },
      select: { name: true },
    });

    const documentTypes = await db.documentType.findMany({
      where: {
        organizationId: context.organizationId,
        id: { in: parsed.documentTypeIds },
      },
    });

    if (documentTypes.length === 0) {
      return NextResponse.json({ error: "Geen documenttypes geselecteerd." }, { status: 400 });
    }

    const { token, tokenHash } = generateDocumentRequestToken();
    const expiresAt = addDays(new Date(), 30);

    const created = await db.documentRequest.create({
      data: {
        organizationId: context.organizationId,
        subcontractorId: subcontractor.id,
        sentById: context.userId,
        tokenHash,
        tokenExpiresAt: expiresAt,
        items: {
          createMany: {
            data: documentTypes.map((type) => ({
              documentTypeId: type.id,
            })),
          },
        },
      },
      include: {
        items: {
          include: {
            documentType: true,
          },
        },
        subcontractor: true,
      },
    });

    const uploadUrl = `${env.APP_URL}/aanleveren/${token}`;
    if (subcontractor.contactEmail) {
      const template = documentRequestTemplate({
        organizationName: organization?.name ?? "WerkKeur klant",
        contactName: subcontractor.contactFirstName ?? subcontractor.companyName,
        documents: created.items.map((item) => item.documentType.name),
        uploadUrl,
      });

      await sendEmail({
        to: subcontractor.contactEmail,
        subject: template.subject,
        html: template.html,
      });
    }

    await logActivity({
      organizationId: context.organizationId,
      actorUserId: context.userId,
      action: "REQUEST_SENT",
      entityType: "DocumentRequest",
      entityId: created.id,
      metadata: { subcontractorId: subcontractor.id },
    });

    return NextResponse.json({
      ok: true,
      requestId: created.id,
      uploadUrl,
    });
  } catch {
    return NextResponse.json({ error: "Documentverzoek versturen mislukt." }, { status: 400 });
  }
}
