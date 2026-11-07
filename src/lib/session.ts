import { SignJWT, jwtVerify } from "jose";

// Edge-safe session helpers (used by middleware and the server).

export const SESSION_COOKIE = "diary_session";
export const SESSION_DAYS = 30;

export type Role = "ADMIN" | "JUNIOR";

export type SessionPayload = {
  uid: string;
  name: string;
  role: Role;
};

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set (at least 32 characters).");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.uid !== "string") return null;
    return {
      uid: payload.uid,
      name: String(payload.name ?? ""),
      role: payload.role === "ADMIN" ? "ADMIN" : "JUNIOR",
    };
  } catch {
    return null;
  }
}
