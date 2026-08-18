import { describe, expect, it } from "vitest";
import { generateDocumentRequestToken, hashToken, isRequestTokenUsable } from "../lib/tokens";

describe("document request token", () => {
  it("generates unguessable token with hash", () => {
    const { token, tokenHash } = generateDocumentRequestToken();
    expect(token.length).toBeGreaterThan(20);
    expect(hashToken(token)).toBe(tokenHash);
  });

  it("invalidates revoked tokens", () => {
    const result = isRequestTokenUsable({
      revokedAt: new Date(),
      tokenExpiresAt: new Date(Date.now() + 1000),
    });
    expect(result).toBe(false);
  });

  it("invalidates expired tokens", () => {
    const result = isRequestTokenUsable({
      revokedAt: null,
      tokenExpiresAt: new Date(Date.now() - 1000),
    });
    expect(result).toBe(false);
  });

  it("accepts active non-revoked token", () => {
    const result = isRequestTokenUsable({
      revokedAt: null,
      tokenExpiresAt: new Date(Date.now() + 60_000),
    });
    expect(result).toBe(true);
  });
});
