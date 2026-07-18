// api/albums.js
// CRUD album kelas. Setiap perubahan langsung commit + push ke GitHub repo
// lewat Contents API, sehingga Vercel otomatis redeploy (jika repo terhubung ke Vercel).

import { requireAuth } from "./_lib/session.js";
import { getJsonFile, putJsonFile, putFile, deleteFile } from "./_lib/github.js";

const ALBUMS_JSON_PATH = "json/albums.json";

// Gambar dikirim sebagai base64 — perbesar limit body dari default 1mb.
export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

function sanitizeFilename(name = "photo.jpg") {
  return name.toLowerCase().replace(/[^a-z0-9.\-]/g, "-");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    const session = requireAuth(req, res);
    if (!session) return; // requireAuth sudah mengirim response 401
  }

  try {
    if (req.method === "GET") {
      const albums = await getJsonFile(ALBUMS_JSON_PATH, []);
      return res.status(200).json(albums);
    }

    if (req.method === "POST") {
      const { title, caption, date, imageBase64, imageName } = req.body || {};
      if (!title || !imageBase64) {
        return res.status(400).json({ error: "title dan imageBase64 wajib diisi." });
      }

      const filename = `${Date.now()}-${sanitizeFilename(imageName)}`;
      const imagePath = `albums/${filename}`;

      // 1. Upload gambar ke folder albums/
      await putFile(imagePath, imageBase64, `chore(album): tambah foto ${filename}`);

      // 2. Update albums.json
      const albums = await getJsonFile(ALBUMS_JSON_PATH, []);
      const newEntry = {
        id: Date.now(),
        title,
        caption: caption || "",
        image: `/${imagePath}`,
        date: date || new Date().toISOString().slice(0, 10),
      };
      const updated = [newEntry, ...albums];
      await putJsonFile(ALBUMS_JSON_PATH, updated, `chore(album): tambah entri "${title}"`);

      return res.status(201).json(newEntry);
    }

    if (req.method === "PUT") {
      const { id, title, caption, date } = req.body || {};
      if (!id) return res.status(400).json({ error: "id wajib diisi." });

      const albums = await getJsonFile(ALBUMS_JSON_PATH, []);
      const idx = albums.findIndex((a) => a.id === id);
      if (idx === -1) return res.status(404).json({ error: "Album tidak ditemukan." });

      albums[idx] = {
        ...albums[idx],
        ...(title !== undefined ? { title } : {}),
        ...(caption !== undefined ? { caption } : {}),
        ...(date !== undefined ? { date } : {}),
      };
      await putJsonFile(ALBUMS_JSON_PATH, albums, `chore(album): edit entri "${albums[idx].title}"`);

      return res.status(200).json(albums[idx]);
    }

    if (req.method === "DELETE") {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: "id wajib diisi." });

      const albums = await getJsonFile(ALBUMS_JSON_PATH, []);
      const target = albums.find((a) => a.id === id);
      if (!target) return res.status(404).json({ error: "Album tidak ditemukan." });

      const updated = albums.filter((a) => a.id !== id);
      await putJsonFile(ALBUMS_JSON_PATH, updated, `chore(album): hapus entri "${target.title}"`);

      // Hapus juga file gambar terkait, jika ada.
      if (target.image?.startsWith("/albums/")) {
        await deleteFile(target.image.slice(1), `chore(album): hapus foto ${target.image}`).catch(() => null);
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Terjadi kesalahan pada server." });
  }
}
