// api/session.js
import { getSessionFromRequest } from "./_lib/session.js";

export default async function handler(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({ authenticated: true, user: session.user });
}
