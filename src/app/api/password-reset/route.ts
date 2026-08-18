import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { hashToken, generateSecureToken } from "@/lib/tokens";
import { passwordResetRequestSchema } from "@/lib/validation";
import { env } from "@/lib/env";
import { assertRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    assertRateLimit(`password-reset:${ip}`, { maxRequests: 10, windowMs: 60_000 });

    const body = await request.json();
    const parsed = passwordResetRequestSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = addHours(new Date(), 1);

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "WerkKeur wachtwoord herstellen",
      html: `<p>Klik op de link om je wachtwoord te herstellen:</p><p>${env.APP_URL}/wachtwoord-herstellen/${rawToken}</p><p>Deze link is 1 uur geldig.</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Aanvraag mislukt." }, { status: 400 });
  }
}
