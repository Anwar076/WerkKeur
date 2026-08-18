import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

const reminderSchema = z.object({
  reminderDaysBefore30: z.boolean(),
  reminderDaysBefore14: z.boolean(),
  reminderDaysBefore7: z.boolean(),
  reminderOnExpiration: z.boolean(),
  requestReminderAfter3: z.boolean(),
  requestReminderAfter7: z.boolean(),
  requestReminderAfter14: z.boolean(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  if (!hasPermission(session.user.role as Role, "manageOrganizationSettings")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const parsed = reminderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatie mislukt." }, { status: 400 });
  }

  await db.organization.update({
    where: { id: session.user.organizationId },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
