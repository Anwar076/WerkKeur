import { addDays, addMonths, subDays } from "date-fns";
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { defaultDocumentTypes } from "../src/lib/default-document-types";

const prisma = new PrismaClient();

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentRequestItem.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.subcontractorRequirement.deleteMany();
  await prisma.subcontractor.deleteMany();
  await prisma.documentType.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.teamInvitation.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      name: "Bouwbedrijf De Jong B.V.",
      onboardingCompleted: true,
      subcontractorRange: "26-75",
      kvkNumber: "34123456",
      city: "Utrecht",
      email: "info@dejongbouw.nl",
      phone: "+31 30 123 4567",
    },
  });

  const owner = await prisma.user.create({
    data: {
      firstName: "Anja",
      lastName: "de Jong",
      email: "owner@werkkeur-demo.nl",
      passwordHash: await hashPassword("WerkKeurDemo123!"),
      currentOrganizationId: organization.id,
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: organization.id,
      userId: owner.id,
      role: Role.OWNER,
    },
  });

  await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      plan: "BUSINESS",
      status: "TRIALING",
      trialEndsAt: addDays(new Date(), 14),
    },
  });

  const documentTypes = await Promise.all(
    defaultDocumentTypes.map((type) =>
      prisma.documentType.create({
        data: {
          organizationId: organization.id,
          name: type.name,
          description: type.description,
          requiresExpirationDate: type.requiresExpirationDate,
          isRequiredByDefault: ["KvK-uittreksel", "VCA", "AVB-verzekering"].includes(type.name),
          defaultValidityMonths: type.defaultValidityMonths,
          reminderDays: type.reminderDays,
        },
      }),
    ),
  );

  const typeByName = new Map(documentTypes.map((type) => [type.name, type]));

  const subcontractors = [
    { companyName: "ABC Installaties B.V.", email: "info@abcinstallaties.nl", status: "valid" },
    { companyName: "Timmerbedrijf Jansen", email: "kantoor@timmerjansen.nl", status: "expired" },
    { companyName: "Dakwerken Zuid B.V.", email: "contact@dakwerkenzuid.nl", status: "missing" },
    { companyName: "Van Dijk Elektrotechniek", email: "info@vandijkelektro.nl", status: "expiring" },
    { companyName: "Bouwservice Brabant", email: "office@bouwservicebrabant.nl", status: "valid" },
    { companyName: "De Groot Schilderwerken", email: "planning@degrootschilder.nl", status: "expiring" },
    { companyName: "Jansen Klimaattechniek", email: "info@jansenklimaat.nl", status: "missing" },
    { companyName: "Vermeer Montage", email: "projecten@vermeermontage.nl", status: "expired" },
  ];

  for (const [index, subcontractorData] of subcontractors.entries()) {
    const subcontractor = await prisma.subcontractor.create({
      data: {
        organizationId: organization.id,
        companyName: subcontractorData.companyName,
        contactFirstName: "Contact",
        contactLastName: `${index + 1}`,
        contactEmail: subcontractorData.email,
        kvkNumber: `${90000000 + index}`,
        vatNumber: `NL00${index}WERKKEURB01`,
        lastActivityAt: subDays(new Date(), index),
      },
    });

    const requiredTypes = ["KvK-uittreksel", "VCA", "AVB-verzekering"];
    for (const typeName of requiredTypes) {
      const type = typeByName.get(typeName);
      if (!type) continue;
      await prisma.subcontractorRequirement.create({
        data: {
          organizationId: organization.id,
          subcontractorId: subcontractor.id,
          documentTypeId: type.id,
          required: true,
        },
      });
    }

    const kvkType = typeByName.get("KvK-uittreksel");
    if (kvkType) {
      await prisma.document.create({
        data: {
          organizationId: organization.id,
          subcontractorId: subcontractor.id,
          documentTypeId: kvkType.id,
          originalFilename: "kvk.pdf",
          storageKey: `seed-kvk-${subcontractor.id}.pdf`,
          mimeType: "application/pdf",
          fileSize: 1024,
          uploadedById: owner.id,
          reviewStatus: "APPROVED",
        },
      });
    }

    const vcaType = typeByName.get("VCA");
    const avbType = typeByName.get("AVB-verzekering");

    if (vcaType) {
      if (subcontractorData.status === "valid") {
        await prisma.document.create({
          data: {
            organizationId: organization.id,
            subcontractorId: subcontractor.id,
            documentTypeId: vcaType.id,
            originalFilename: "vca.pdf",
            storageKey: `seed-vca-valid-${subcontractor.id}.pdf`,
            mimeType: "application/pdf",
            fileSize: 1024,
            expirationDate: addMonths(new Date(), 18),
            uploadedById: owner.id,
            reviewStatus: "APPROVED",
          },
        });
      }
      if (subcontractorData.status === "expired") {
        await prisma.document.create({
          data: {
            organizationId: organization.id,
            subcontractorId: subcontractor.id,
            documentTypeId: vcaType.id,
            originalFilename: "vca-verlopen.pdf",
            storageKey: `seed-vca-expired-${subcontractor.id}.pdf`,
            mimeType: "application/pdf",
            fileSize: 1024,
            expirationDate: subDays(new Date(), 12),
            uploadedById: owner.id,
            reviewStatus: "APPROVED",
          },
        });
      }
      if (subcontractorData.status === "expiring") {
        await prisma.document.create({
          data: {
            organizationId: organization.id,
            subcontractorId: subcontractor.id,
            documentTypeId: vcaType.id,
            originalFilename: "vca-binnenkort.pdf",
            storageKey: `seed-vca-expiring-${subcontractor.id}.pdf`,
            mimeType: "application/pdf",
            fileSize: 1024,
            expirationDate: addDays(new Date(), 14),
            uploadedById: owner.id,
            reviewStatus: "APPROVED",
          },
        });
      }
    }

    if (avbType && subcontractorData.status !== "missing") {
      await prisma.document.create({
        data: {
          organizationId: organization.id,
          subcontractorId: subcontractor.id,
          documentTypeId: avbType.id,
          originalFilename: "avb.pdf",
          storageKey: `seed-avb-${subcontractor.id}.pdf`,
          mimeType: "application/pdf",
          fileSize: 1024,
          expirationDate:
            subcontractorData.status === "expired" ? subDays(new Date(), 4) : addMonths(new Date(), 10),
          uploadedById: owner.id,
          reviewStatus: "APPROVED",
        },
      });
    }
  }

  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: organization.id,
        actorUserId: owner.id,
        action: "DOCUMENT_UPLOADED",
        entityType: "Document",
        entityId: "seed-1",
        metadata: { message: "ABC Installaties heeft VCA geüpload" },
      },
      {
        organizationId: organization.id,
        actorUserId: owner.id,
        action: "DOCUMENT_APPROVED",
        entityType: "Document",
        entityId: "seed-2",
        metadata: { message: "AVB van Timmerbedrijf Jansen goedgekeurd" },
      },
      {
        organizationId: organization.id,
        actorUserId: owner.id,
        action: "REMINDER_SENT",
        entityType: "DocumentRequest",
        entityId: "seed-3",
        metadata: { message: "Herinnering verzonden naar Dakwerken Zuid" },
      },
    ],
  });

  console.info("Seed voltooid.");
  console.info("Demo login: owner@werkkeur-demo.nl / WerkKeurDemo123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
