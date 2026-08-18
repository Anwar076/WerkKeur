import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
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

  const requestRecord = await db.documentRequest.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      subcontractor: true,
      items: {
        where: { status: "REQUESTED" },
        include: { documentType: true },
      },
    },
  });

  if (!requestRecord) {
    return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });
  }

  if (!requestRecord.subcontractor.contactEmail) {
    return NextResponse.json({ error: "Geen e-mailadres bekend." }, { status: 400 });
  }

  await sendEmail({
    to: requestRecord.subcontractor.contactEmail,
    subject: "Herinnering: documenten aanleveren",
    html: `<p>Er ontbreken nog documenten: ${requestRecord.items
      .map((item) => item.documentType.name)
      .join(", ")}</p>`,
  });

  await db.documentRequest.update({
    where: { id: requestRecord.id },
    data: { lastReminderSentAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
