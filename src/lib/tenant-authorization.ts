export function canAccessTenantResource(userOrganizationId: string, resourceOrganizationId: string) {
  return userOrganizationId === resourceOrganizationId;
}
