import { createHash, randomBytes } from "node:crypto";

export function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateDocumentRequestToken() {
  const token = generateSecureToken();
  return {
    token,
    tokenHash: hashToken(token),
  };
}

export function isRequestTokenUsable(input: {
  revokedAt: Date | null;
  tokenExpiresAt: Date;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  return !input.revokedAt && input.tokenExpiresAt > now;
}
