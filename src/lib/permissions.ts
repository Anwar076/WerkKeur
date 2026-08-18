import { Role } from "@prisma/client";

type PermissionMap = Record<string, Role[]>;

const PERMISSIONS: PermissionMap = {
  manageBilling: [Role.OWNER],
  manageOrganizationSettings: [Role.OWNER, Role.ADMIN],
  manageTeam: [Role.OWNER, Role.ADMIN],
  manageSubcontractors: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
  manageDocuments: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
  manageRequests: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
};

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(role);
}

export function requireRole(
  role: Role,
  allowedRoles: Role[],
  message = "Je hebt geen toegang tot deze actie.",
): void {
  if (!allowedRoles.includes(role)) {
    throw new Error(message);
  }
}
