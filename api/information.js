// api/information.js
// CRUD pengumuman kelas (markdown). Commit langsung ke information.json via GitHub API.

import { requireAuth } from "./_lib/session.js";
import { getJsonFile, putJsonFile } from "./_lib/github.js";

const INFO_JSON_PATH = "json/information.json";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    const session = requireAuth(req, res);
    if (!session) return;
  }

  try {
    if (req.method === "GET") {
      const info = await getJsonFile(INFO_JSON_PATH, []);
      return res.status(200).json(info);
    }

    if (req.method === "POST") {
      const { title, content, date } = req.body || {};
      if (!title || !content) {
        return res.status(400).json({ error: "title dan content wajib diisi." });
      }

      const info = await getJsonFile(INFO_JSON_PATH, []);
      const newEntry = {
        id: Date.now(),
        title,
        content,
        date: date || new Date().toISOString().slice(0, 10),
      };
      const updated = [newEntry, ...info];
      await putJsonFile(INFO_JSON_PATH, updated, `chore(info): tambah pengumuman "${title}"`);

      return res.status(201).json(newEntry);
    }

    if (req.method === "PUT") {
      const { id, title, content, date } = req.body || {};
      if (!id) return res.status(400).json({ error: "id wajib diisi." });

      const info = await getJsonFile(INFO_JSON_PATH, []);
      const idx = info.findIndex((i) => i.id === id);
      if (idx === -1) return res.status(404).json({ error: "Informasi tidak ditemukan." });

      info[idx] = {
        ...info[idx],
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(date !== undefined ? { date } : {}),
      };
      await putJsonFile(INFO_JSON_PATH, info, `chore(info): edit pengumuman "${info[idx].title}"`);

      return res.status(200).json(info[idx]);
    }

    if (req.method === "DELETE") {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: "id wajib diisi." });

      const info = await getJsonFile(INFO_JSON_PATH, []);
      const target = info.find((i) => i.id === id);
      if (!target) return res.status(404).json({ error: "Informasi tidak ditemukan." });

      const updated = info.filter((i) => i.id !== id);
      await putJsonFile(INFO_JSON_PATH, updated, `chore(info): hapus pengumuman "${target.title}"`);

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Terjadi kesalahan pada server." });
  }
}
