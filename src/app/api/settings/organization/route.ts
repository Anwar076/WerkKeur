import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { organizationSettingsSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(session.user.role as Role, "manageOrganizationSettings")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = organizationSettingsSchema.parse(body);

    await db.organization.update({
      where: { id: session.user.organizationId },
      data: {
        name: parsed.name,
        kvkNumber: parsed.kvkNumber || null,
        addressLine1: parsed.addressLine1 || null,
        postalCode: parsed.postalCode || null,
        city: parsed.city || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Instellingen opslaan mislukt." }, { status: 400 });
  }
}
