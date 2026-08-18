import { addDays, isAfter, startOfDay } from "date-fns";
import { ReminderType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { expirationReminderTemplate } from "@/lib/email/templates";
import { env } from "@/lib/env";

export async function processDocumentReminders() {
  const today = startOfDay(new Date());
  const horizon = addDays(today, 30);

  const documents = await db.document.findMany({
    where: {
      deletedAt: null,
      expirationDate: {
        gte: today,
        lte: horizon,
      },
      subcontractor: {
        contactEmail: {
          not: null,
        },
      },
    },
    include: {
      subcontractor: true,
      documentType: true,
    },
  });

  for (const document of documents) {
    if (!document.expirationDate || !document.subcontractor.contactEmail) {
      continue;
    }

    const reminderKey = `doc-exp:${document.id}:${document.expirationDate.toISOString().slice(0, 10)}`;
    const existing = await db.reminder.findUnique({
      where: { reminderKey },
    });

    if (existing?.sentAt) {
      continue;
    }

    const template = expirationReminderTemplate({
      contactName: document.subcontractor.contactFirstName ?? document.subcontractor.companyName,
      documentType: document.documentType.name,
      expirationDate: document.expirationDate.toLocaleDateString("nl-NL"),
      uploadUrl: `${env.APP_URL}/aanleveren`,
    });

    await sendEmail({
      to: document.subcontractor.contactEmail,
      subject: template.subject,
      html: template.html,
    });

    await db.reminder.upsert({
      where: { reminderKey },
      update: { sentAt: new Date() },
      create: {
        organizationId: document.organizationId,
        type: ReminderType.DOCUMENT_EXPIRATION,
        reminderKey,
        recipientEmail: document.subcontractor.contactEmail,
        scheduledFor: new Date(),
        sentAt: new Date(),
        documentId: document.id,
        subcontractorId: document.subcontractorId,
      },
    });
  }
}

export async function processRequestReminders() {
  const staleThreshold = addDays(new Date(), -3);
  const openRequests = await db.documentRequest.findMany({
    where: {
      status: {
        in: ["OPEN", "PARTIAL"],
      },
      revokedAt: null,
      tokenExpiresAt: {
        gt: new Date(),
      },
      OR: [{ lastReminderSentAt: null }, { lastReminderSentAt: { lt: staleThreshold } }],
    },
    include: {
      subcontractor: true,
      items: {
        where: { status: "REQUESTED" },
        include: { documentType: true },
      },
    },
  });

  for (const request of openRequests) {
    const contactEmail = request.subcontractor.contactEmail;
    if (!contactEmail || request.items.length === 0) {
      continue;
    }

    const reminderKey = `request-missing:${request.id}:${startOfDay(new Date()).toISOString()}`;
    const existing = await db.reminder.findUnique({ where: { reminderKey } });
    if (existing && isAfter(existing.createdAt, addDays(new Date(), -1))) {
      continue;
    }

    await sendEmail({
      to: contactEmail,
      subject: `Herinnering: documenten aanleveren voor ${request.subcontractor.companyName}`,
      html: `<p>Er ontbreken nog documenten in je verzoek. Lever deze aan via je persoonlijke uploadlink.</p>`,
    });

    await db.reminder.create({
      data: {
        organizationId: request.organizationId,
        type: ReminderType.REQUEST_MISSING_DOCUMENT,
        reminderKey,
        recipientEmail: contactEmail,
        scheduledFor: new Date(),
        sentAt: new Date(),
        documentRequestId: request.id,
        subcontractorId: request.subcontractorId,
      },
    });

    await db.documentRequest.update({
      where: { id: request.id },
      data: { lastReminderSentAt: new Date() },
    });
  }
}
