// api/_lib/github.js
// Helper untuk berkomunikasi dengan GitHub REST API (Contents API).
// Dipakai untuk commit gambar album & update albums.json / information.json.

const API_BASE = "https://api.github.com";

function getConfig() {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, BRANCH } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error("GITHUB_TOKEN, GITHUB_OWNER, dan GITHUB_REPO wajib diset di environment variables.");
  }
  return {
    token: GITHUB_TOKEN,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: BRANCH || "main",
  };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/**
 * Ambil konten file dari repo. Mengembalikan { content, sha } atau null jika belum ada.
 */
export async function getFile(path) {
  const { token, owner, repo, branch } = getConfig();
  const res = await fetch(
    `${API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
    { headers: headers(token) }
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gagal mengambil ${path}: ${res.status} ${await res.text()}`);

  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { content, sha: json.sha };
}

/**
 * Ambil & parse file JSON dari repo. Mengembalikan array/objek, atau fallback jika belum ada.
 */
export async function getJsonFile(path, fallback = []) {
  const file = await getFile(path);
  if (!file) return fallback;
  return JSON.parse(file.content);
}

/**
 * Buat atau update file di repo (commit + push otomatis lewat Contents API).
 * contentBase64 harus berupa base64 mentah (tanpa prefix data:...).
 */
export async function putFile(path, contentBase64, message) {
  const { token, owner, repo, branch } = getConfig();

  // Cek apakah file sudah ada, untuk mendapatkan sha (wajib saat update).
  const existing = await getFile(path);

  const res = await fetch(
    `${API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch,
        ...(existing ? { sha: existing.sha } : {}),
      }),
    }
  );

  if (!res.ok) throw new Error(`Gagal commit ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Simpan objek JS sebagai file JSON di repo (pretty-printed).
 */
export async function putJsonFile(path, data, message) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  return putFile(path, content, message);
}

/**
 * Hapus file dari repo.
 */
export async function deleteFile(path, message) {
  const { token, owner, repo, branch } = getConfig();
  const existing = await getFile(path);
  if (!existing) return null;

  const res = await fetch(
    `${API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "DELETE",
      headers: headers(token),
      body: JSON.stringify({ message, sha: existing.sha, branch }),
    }
  );

  if (!res.ok) throw new Error(`Gagal menghapus ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}
