import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { onboardingStepOneSchema, onboardingStepThreeSchema, onboardingStepTwoSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const step = body.step as number;

    if (step === 1) {
      const parsed = onboardingStepOneSchema.parse(body.data);
      await db.organization.update({
        where: { id: session.user.organizationId },
        data: {
          name: parsed.organizationName,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (step === 2) {
      const parsed = onboardingStepTwoSchema.parse(body.data);
      await db.organization.update({
        where: { id: session.user.organizationId },
        data: {
          subcontractorRange: parsed.subcontractorRange,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (step === 3) {
      const parsed = onboardingStepThreeSchema.parse(body.data);

      await db.documentType.updateMany({
        where: { organizationId: session.user.organizationId },
        data: { isRequiredByDefault: false },
      });

      const updatedTypes = await db.documentType.updateMany({
        where: {
          organizationId: session.user.organizationId,
          id: { in: parsed.documentTypeIds },
        },
        data: { isRequiredByDefault: true },
      });

      await db.organization.update({
        where: { id: session.user.organizationId },
        data: {
          onboardingCompleted: true,
        },
      });

      return NextResponse.json({ ok: true, selectedCount: updatedTypes.count });
    }

    return NextResponse.json({ error: "Onbekende onboardingstap." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Onboarding stap mislukt." }, { status: 400 });
  }
}
