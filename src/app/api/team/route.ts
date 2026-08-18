import { addDays } from "date-fns";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { hasPermission } from "@/lib/permissions";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(session.user.role as Role, "manageTeam")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const [members, invitations] = await Promise.all([
    db.organizationMember.findMany({
      where: { organizationId: session.user.organizationId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    db.teamInvitation.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: "INVITED",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    data: {
      members: members.map((member) => ({
        id: member.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        role: member.role,
        status: member.status,
      })),
      invitations,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId || !session.user.role) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  if (!hasPermission(session.user.role as Role, "manageTeam")) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = inviteSchema.parse(body);

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);

    await db.teamInvitation.upsert({
      where: {
        organizationId_email: {
          organizationId: session.user.organizationId,
          email: parsed.email.toLowerCase(),
        },
      },
      update: {
        role: parsed.role,
        tokenHash,
        invitedById: session.user.id,
        expiresAt: addDays(new Date(), 7),
        status: "INVITED",
      },
      create: {
        organizationId: session.user.organizationId,
        email: parsed.email.toLowerCase(),
        role: parsed.role,
        tokenHash,
        invitedById: session.user.id,
        expiresAt: addDays(new Date(), 7),
        status: "INVITED",
      },
    });

    await sendEmail({
      to: parsed.email.toLowerCase(),
      subject: "Uitnodiging voor WerkKeur-team",
      html: `<p>Je bent uitgenodigd om deel te nemen aan een WerkKeur-team. Deze uitnodigingsflow wordt verder uitgebreid in een volgende fase.</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Uitnodiging versturen mislukt." }, { status: 400 });
  }
}
