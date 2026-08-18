import { ActivityAction, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ActivityLogInput = {
  organizationId: string;
  actorUserId?: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(input: ActivityLogInput) {
  await db.activityLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
