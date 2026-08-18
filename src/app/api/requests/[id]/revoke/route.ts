import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

type Params = Promise<{ id: string }>;

export async function POST(_: Request, context: { params: Params }) {
  const session = await auth();
  if (!session?.user?.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  if (!hasPermission(session.user.role as Role, "manageRequests")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;

  await db.documentRequest.updateMany({
    where: {
      id,
      organizationId: session.user.organizationId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      status: "REVOKED",
    },
  });

  return NextResponse.json({ ok: true });
}
