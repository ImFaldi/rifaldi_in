import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/authConstants";

const SCRYPT_KEY_LENGTH = 64;

export interface AuthTokenPayload {
  sub: string;
  email: string;
  exp: number;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET belum dikonfigurasi. Tambahkan AUTH_SECRET di .env.local (fallback ke SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return secret;
}

function base64urlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? `${normalized}${"=".repeat(4 - padding)}` : normalized;
  return Buffer.from(padded, "base64").toString("utf8");
}

function signTokenParts(headerB64: string, payloadB64: string): string {
  const secret = getAuthSecret();
  const content = `${headerB64}.${payloadB64}`;
  return base64urlEncode(createHmac("sha256", secret).update(content).digest());
}

export function createAuthToken(userId: string, email: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload: AuthTokenPayload = {
    sub: userId,
    email,
    exp: Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS,
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signatureB64 = signTokenParts(headerB64, payloadB64);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const expectedSignature = signTokenParts(headerB64, payloadB64);

  const incomingBuffer = Buffer.from(signatureB64);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (incomingBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(incomingBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadB64)) as AuthTokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, existingHash] = passwordHash.split(":");
  if (!salt || !existingHash) return false;

  const hashBuffer = Buffer.from(existingHash, "hex");
  const testBuffer = scryptSync(password, salt, SCRYPT_KEY_LENGTH);

  if (hashBuffer.length !== testBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, testBuffer);
}

export function validateAuthPayload(email: string, password: string): string | null {
  if (!email || !password) {
    return "Email dan password wajib diisi.";
  }

  const normalizedEmail = normalizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return "Format email tidak valid.";
  }

  if (password.length < 8) {
    return "Password minimal 8 karakter.";
  }

  return null;
}

export function getAuthCookieFromRequest(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function requireDashboardAuth(request: NextRequest): NextResponse | null {
  const token = getAuthCookieFromRequest(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ message: "Sesi login tidak valid." }, { status: 401 });
  }

  return null;
}
