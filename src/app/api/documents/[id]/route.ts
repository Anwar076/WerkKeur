import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { deletePrivateFile } from "@/lib/storage";

type Params = Promise<{ id: string }>;

export async function DELETE(_: Request, context: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(session.user.role as Role, "manageDocuments")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;
  const document = await db.document.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document niet gevonden." }, { status: 404 });
  }

  await deletePrivateFile(document.storageKey);
  await db.document.update({
    where: { id: document.id },
    data: {
      deletedAt: new Date(),
    },
  });

  await logActivity({
    organizationId: session.user.organizationId,
    actorUserId: session.user.id,
    action: "DOCUMENT_DELETED",
    entityType: "Document",
    entityId: document.id,
    metadata: {
      subcontractorId: document.subcontractorId,
    },
  });

  return NextResponse.json({ ok: true });
}
