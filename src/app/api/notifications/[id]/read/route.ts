import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Params = Promise<{ id: string }>;

export async function POST(_: Request, context: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { id } = await context.params;

  await db.notification.updateMany({
    where: {
      id,
      organizationId: session.user.organizationId,
      recipientUserId: session.user.id,
    },
    data: {
      readAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
