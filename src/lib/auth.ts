import { cookies } from "next/headers";

// ── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  subscriptionStatus: "free" | "pro";
  createdAt: Date;
}

export type SafeUser = Omit<User, "passwordHash">;

// ── In-memory user store (v1) ──────────────────────────────────────────────

const users = new Map<string, User>();
const emailIndex = new Map<string, string>(); // email -> userId

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function getUserByEmail(email: string): User | undefined {
  const userId = emailIndex.get(email.toLowerCase());
  if (!userId) return undefined;
  return users.get(userId);
}

export function createUser(email: string, name: string, passwordHash: string): User {
  const id = crypto.randomUUID();
  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    passwordHash,
    subscriptionStatus: "free",
    createdAt: new Date(),
  };
  users.set(id, user);
  emailIndex.set(user.email, id);
  return user;
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ── Password hashing (Web Crypto PBKDF2) ───────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(password, salt);
  const hashBuffer = await crypto.subtle.exportKey("raw", key);
  const hashArray = new Uint8Array(hashBuffer);

  // Store as salt:hash in hex
  return `${toHex(salt)}:${toHex(hashArray)}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, hashHex] = hash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = fromHex(saltHex);
  const key = await deriveKey(password, salt);
  const hashBuffer = await crypto.subtle.exportKey("raw", key);
  const computed = toHex(new Uint8Array(hashBuffer));

  return computed === hashHex;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: KEY_LENGTH * 8 },
    true,
    ["sign"],
  );
}

function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ── Session tokens (HMAC-signed) ───────────────────────────────────────────

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return secret;
}

async function getSigningKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(userId: string): Promise<string> {
  const key = await getSigningKey();
  const payload = `${userId}.${Date.now()}`;
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [userId, timestamp, signatureHex] = parts;
    if (!userId || !timestamp || !signatureHex) return null;

    const key = await getSigningKey();
    const payload = `${userId}.${timestamp}`;
    const encoder = new TextEncoder();
    const signature = fromHex(signatureHex);

    const valid = await crypto.subtle.verify("HMAC", key, signature as BufferSource, encoder.encode(payload));
    if (!valid) return null;

    // Check token expiry (30 days)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (tokenAge > thirtyDays) return null;

    return userId;
  } catch {
    return null;
  }
}

// ── Cookie helpers ─────────────────────────────────────────────────────────

const SESSION_COOKIE = "session";
const THIRTY_DAYS = 30 * 24 * 60 * 60;

export function setSessionCookie(token: string): Headers {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${THIRTY_DAYS}`,
  );
  return headers;
}

export function clearSessionCookie(): Headers {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  );
  return headers;
}

export async function getSessionFromRequest(request: Request): Promise<SafeUser | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const sessionToken = parseCookie(cookieHeader, SESSION_COOKIE);
  if (!sessionToken) return null;

  const userId = await verifySessionToken(sessionToken);
  if (!userId) return null;

  const user = getUserById(userId);
  if (!user) return null;

  return toSafeUser(user);
}

export async function getSessionFromCookies(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const userId = await verifySessionToken(sessionToken);
  if (!userId) return null;

  const user = getUserById(userId);
  if (!user) return null;

  return toSafeUser(user);
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}
