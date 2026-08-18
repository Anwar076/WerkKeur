import { describe, expect, it } from "vitest";
import { DocumentReviewStatus } from "@prisma/client";
import { calculateDocumentStatus, calculateSubcontractorStatus } from "../lib/status-engine";

describe("calculateDocumentStatus", () => {
  it("returns MISSING when required document is absent", () => {
    const result = calculateDocumentStatus({ exists: false });
    expect(result).toBe("MISSING");
  });

  it("returns EXPIRED when expiration date is in the past", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = calculateDocumentStatus({
      exists: true,
      expirationDate: yesterday,
      reviewStatus: DocumentReviewStatus.APPROVED,
      reminderDays: 30,
    });
    expect(result).toBe("EXPIRED");
  });

  it("returns EXPIRING when expiration date is today", () => {
    const today = new Date();
    const result = calculateDocumentStatus({
      exists: true,
      expirationDate: today,
      reviewStatus: DocumentReviewStatus.APPROVED,
      reminderDays: 30,
    });
    expect(result).toBe("EXPIRING");
  });

  it("returns EXPIRING when expiration date is exactly 30 days away", () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const result = calculateDocumentStatus({
      exists: true,
      expirationDate: date,
      reviewStatus: DocumentReviewStatus.APPROVED,
      reminderDays: 30,
    });
    expect(result).toBe("EXPIRING");
  });

  it("returns VALID when expiration date is beyond reminder threshold", () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    const result = calculateDocumentStatus({
      exists: true,
      expirationDate: date,
      reviewStatus: DocumentReviewStatus.APPROVED,
      reminderDays: 30,
    });
    expect(result).toBe("VALID");
  });

  it("returns REJECTED when review status is rejected", () => {
    const result = calculateDocumentStatus({
      exists: true,
      reviewStatus: DocumentReviewStatus.REJECTED,
    });
    expect(result).toBe("REJECTED");
  });
});

describe("calculateSubcontractorStatus", () => {
  it("returns ACTION_REQUIRED when one document is missing", () => {
    const result = calculateSubcontractorStatus(["VALID", "MISSING"]);
    expect(result).toBe("ACTION_REQUIRED");
  });

  it("returns ATTENTION when one document is expiring", () => {
    const result = calculateSubcontractorStatus(["VALID", "EXPIRING"]);
    expect(result).toBe("ATTENTION");
  });

  it("returns COMPLIANT when all are valid", () => {
    const result = calculateSubcontractorStatus(["VALID", "VALID"]);
    expect(result).toBe("COMPLIANT");
  });
});
