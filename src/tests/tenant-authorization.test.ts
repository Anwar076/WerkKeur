import { describe, expect, it } from "vitest";
import { canAccessTenantResource } from "../lib/tenant-authorization";

describe("tenant authorization", () => {
  it("allows access within same organization", () => {
    expect(canAccessTenantResource("org-a", "org-a")).toBe(true);
  });

  it("blocks access to another organization's data", () => {
    expect(canAccessTenantResource("org-a", "org-b")).toBe(false);
  });
});
