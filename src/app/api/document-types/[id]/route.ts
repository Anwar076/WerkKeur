import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { documentTypeSchema } from "@/lib/validation";

type Params = Promise<{ id: string }>;

async function getContext() {
  const session = await auth();
  if (!session?.user?.organizationId || !session.user.role) {
    return null;
  }
  return {
    organizationId: session.user.organizationId,
    role: session.user.role as Role,
  };
}

export async function PATCH(request: Request, context: { params: Params }) {
  const authContext = await getContext();
  if (!authContext) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  if (!hasPermission(authContext.role, "manageOrganizationSettings")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const parsed = documentTypeSchema.partial().parse(await request.json());
    const updated = await db.documentType.updateMany({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
      data: {
        name: parsed.name,
        description: parsed.description,
        requiresExpirationDate: parsed.requiresExpirationDate,
        defaultValidityMonths: parsed.defaultValidityMonths,
        reminderDays: parsed.reminderDays,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Documenttype niet gevonden." }, { status: 404 });
    }

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
  if (!hasPermission(authContext.role, "manageOrganizationSettings")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }
  const { id } = await context.params;

  try {
    const deleted = await db.documentType.deleteMany({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Documenttype niet gevonden." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Verwijderen mislukt." }, { status: 400 });
  }
}
