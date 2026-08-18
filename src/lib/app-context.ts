import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getAppContext() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/inloggen");
  }

  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      status: "ACTIVE",
    },
    include: {
      organization: true,
      user: true,
    },
  });

  if (!membership) {
    redirect("/inloggen");
  }

  return {
    session,
    user: membership.user,
    organization: membership.organization,
    role: membership.role,
  };
}
