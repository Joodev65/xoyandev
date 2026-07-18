// api/login.js
import { createSessionCookie } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: "ADMIN_USERNAME / ADMIN_PASSWORD belum diset di ENV." });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ error: "Username atau password salah." });
  }

  res.setHeader("Set-Cookie", createSessionCookie(username));
  return res.status(200).json({ ok: true, user: username });
}
