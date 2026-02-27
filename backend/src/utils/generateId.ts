import crypto from "crypto";

export function generateRegistrationId(): string {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `FF2026-${random}`;
}
