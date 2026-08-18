import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireAuthSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Niet ingelogd.");
  }

  return session;
}

export async function requireOrganizationMembership() {
  const session = await requireAuthSession();

  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      status: "ACTIVE",
    },
    include: {
      organization: true,
    },
  });

  if (!membership) {
    throw new Error("Geen toegang tot deze organisatie.");
  }

  return {
    session,
    organization: membership.organization,
    role: membership.role,
  };
}

export async function requireRole(allowed: Role[]) {
  const context = await requireOrganizationMembership();
  if (!allowed.includes(context.role)) {
    throw new Error("Onvoldoende rechten.");
  }
  return context;
}
