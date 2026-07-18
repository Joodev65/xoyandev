// api/_lib/session.js
// Session login sederhana berbasis cookie yang ditandatangani HMAC (SHA-256).
// Tidak memakai library eksternal atau database — sesuai kebutuhan "SESSION LOGIN via ENV".

import crypto from "crypto";

const COOKIE_NAME = "kelas9a_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 jam

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET belum diset di environment variables.");
  return secret;
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${hmac}`;
}

function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [data, hmac] = token.split(".");
  const expected = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  const validSig = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  if (!validSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionCookie(username) {
  const payload = { user: username, exp: Date.now() + MAX_AGE_SECONDS * 1000 };
  const token = sign(payload);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function getSessionFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verify(match[1]);
}

export function requireAuth(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Sesi tidak valid. Silakan login kembali." });
    return null;
  }
  return session;
}
