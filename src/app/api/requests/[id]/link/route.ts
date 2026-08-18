import { addDays } from "date-fns";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { hasPermission } from "@/lib/permissions";
import { generateDocumentRequestToken } from "@/lib/tokens";

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
  const requestRecord = await db.documentRequest.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!requestRecord) {
    return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });
  }

  const { token, tokenHash } = generateDocumentRequestToken();

  await db.documentRequest.update({
    where: { id: requestRecord.id },
    data: {
      tokenHash,
      tokenExpiresAt: addDays(new Date(), 30),
      revokedAt: null,
      status: requestRecord.status === "REVOKED" ? "OPEN" : requestRecord.status,
    },
  });

  return NextResponse.json({
    ok: true,
    uploadUrl: `${env.APP_URL}/aanleveren/${token}`,
  });
}
