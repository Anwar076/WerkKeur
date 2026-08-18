import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { documentTypeSchema } from "@/lib/validation";

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

export async function GET() {
  const context = await getContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const data = await db.documentType.findMany({
    where: { organizationId: context.organizationId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await getContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(context.role, "manageOrganizationSettings")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = documentTypeSchema.parse(body);

    const created = await db.documentType.create({
      data: {
        organizationId: context.organizationId,
        name: parsed.name,
        description: parsed.description || null,
        requiresExpirationDate: parsed.requiresExpirationDate,
        defaultValidityMonths: parsed.defaultValidityMonths,
        reminderDays: parsed.reminderDays,
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch {
    return NextResponse.json({ error: "Documenttype aanmaken mislukt." }, { status: 400 });
  }
}
