import { env } from "@/lib/env";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  if (env.EMAIL_PROVIDER === "console") {
    console.info("[WERKKEUR_EMAIL]", { to, subject, html });
    return;
  }

  if (env.EMAIL_PROVIDER === "resend") {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY ontbreekt.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error("E-mail verzenden is mislukt.");
    }
  }
}
