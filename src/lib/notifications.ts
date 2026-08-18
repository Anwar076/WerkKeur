import { NotificationType } from "@prisma/client";
import { db } from "@/lib/db";

type NotificationInput = {
  organizationId: string;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export async function createNotification(input: NotificationInput) {
  return db.notification.create({
    data: {
      organizationId: input.organizationId,
      recipientUserId: input.recipientUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
    },
  });
}

export async function notifyOrganizationMembers(
  organizationId: string,
  payload: Omit<NotificationInput, "organizationId" | "recipientUserId">,
) {
  const members = await db.organizationMember.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
    select: { userId: true },
  });

  if (members.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: members.map((member) => ({
      organizationId,
      recipientUserId: member.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedEntityType: payload.relatedEntityType,
      relatedEntityId: payload.relatedEntityId,
    })),
  });
}
