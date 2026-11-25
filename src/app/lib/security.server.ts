import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

export type SecureAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "producer" | "superadmin";
  status: "pending" | "active" | "suspended";
  mustChangePassword: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  failedAttempts: number;
  lockedUntil?: string;
  ownerName?: string;
  city?: string;
  country?: string;
  rccm?: string;
  identityNumber?: string;
  createdAt: string;
};

export function getSessionSecret() {
  const secret = process.env.KINLIVE_SESSION_SECRET;
  if (!secret) return new TextEncoder().encode("development-only-change-this-session-secret-2026");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(account: SecureAccount) {
  return new SignJWT({ sub: account.id, role: account.role, email: account.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSessionSecret());
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload;
  } catch {
    return null;
  }
}

export function encryptBuffer(buffer: Buffer) {
  const key = scryptSync(process.env.KINLIVE_DOCUMENT_KEY || "development-only-document-key-2026", "kinlive-document-salt", 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptBuffer(buffer: Buffer) {
  const key = scryptSync(process.env.KINLIVE_DOCUMENT_KEY || "development-only-document-key-2026", "kinlive-document-salt", 32);
  const iv = buffer.subarray(0, 16);
  const tag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function isStrongPassword(password: string) {
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}
