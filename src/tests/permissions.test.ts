import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { hasPermission } from "../lib/permissions";

describe("permissions", () => {
  it("allows owner to manage billing", () => {
    expect(hasPermission(Role.OWNER, "manageBilling")).toBe(true);
  });

  it("prevents employee from managing billing", () => {
    expect(hasPermission(Role.EMPLOYEE, "manageBilling")).toBe(false);
  });

  it("allows employee to manage documents", () => {
    expect(hasPermission(Role.EMPLOYEE, "manageDocuments")).toBe(true);
  });
});
