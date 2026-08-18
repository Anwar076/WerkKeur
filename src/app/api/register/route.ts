import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { PlanTier, Role, SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { defaultDocumentTypes } from "@/lib/default-document-types";
import { assertRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    assertRateLimit(`register:${ip}`, { maxRequests: 10, windowMs: 60_000 });

    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Dit e-mailadres is al geregistreerd." },
        { status: 409 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: parsed.organizationName,
          onboardingCompleted: false,
        },
      });

      const user = await tx.user.create({
        data: {
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email: parsed.email.toLowerCase(),
          passwordHash: await hashPassword(parsed.password),
          currentOrganizationId: organization.id,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: Role.OWNER,
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          plan: PlanTier.STARTER,
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: addDays(new Date(), 14),
        },
      });

      await tx.documentType.createMany({
        data: defaultDocumentTypes.map((type) => ({
          organizationId: organization.id,
          name: type.name,
          description: type.description,
          requiresExpirationDate: type.requiresExpirationDate,
          defaultValidityMonths: type.defaultValidityMonths,
          reminderDays: type.reminderDays,
        })),
      });

      return user;
    });

    return NextResponse.json({
      ok: true,
      userId: result.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Registratie is mislukt. Controleer je gegevens." },
      { status: 400 },
    );
  }
}
