# 9A — Always Aspiring
Website resmi kelas 9A "Always Aspiring", SMP Methodist 6 (Class of 2026/2027).

Vanilla HTML/CSS/JS (tanpa framework) untuk halaman publik, dengan Admin Panel yang
melakukan commit & push otomatis ke GitHub lewat GitHub REST API — sehingga album foto
dan informasi kelas bisa diubah tanpa menyentuh kode, dan situs redeploy otomatis di Vercel.

---

## 1. Struktur Folder

```
├─ index.html              # Landing page (Hero, About, Struktur, Jadwal, Album, Informasi)
├─ manifest.json           # PWA / SEO manifest
├─ robots.txt              # SEO — arahan crawler
├─ sitemap.xml             # SEO — sitemap
├─ vercel.json             # Konfigurasi Vercel (headers, clean URLs)
├─ package.json
├─ .env.example            # Template environment variable
│
├─ css/
│  ├─ style.css            # Style halaman publik (tokens warna & font sesuai brief)
│  └─ admin.css            # Style admin panel
│
├─ js/
│  ├─ main.js               # Render struktur kelas, piket, timetable, album, info, animasi
│  └─ admin.js               # Logic admin: login, CRUD album/informasi, kompresi gambar
│
├─ json/
│  ├─ albums.json           # Data album (dibaca statis oleh index.html, ditulis oleh admin)
│  └─ information.json      # Data informasi/pengumuman (markdown)
│
├─ albums/                  # (dibuat otomatis) — foto album di-commit ke sini oleh admin panel
│
├─ admin/
│  └─ index.html             # Halaman /admin — login + dashboard
│
└─ api/                      # Vercel Serverless Functions (Node.js, ESM)
   ├─ login.js               # POST — cek ADMIN_USERNAME/PASSWORD, set cookie session
   ├─ logout.js              # POST — hapus cookie session
   ├─ session.js             # GET  — cek status login (dipakai admin dashboard)
   ├─ albums.js               # GET/POST/PUT/DELETE — CRUD album + commit ke GitHub
   ├─ information.js          # GET/POST/PUT/DELETE — CRUD informasi + commit ke GitHub
   └─ _lib/
      ├─ session.js           # Sign/verify cookie session (HMAC SHA-256, tanpa DB)
      └─ github.js            # Wrapper GitHub Contents API (get/put/delete file)
```

## 2. Cara Kerja Admin Panel → GitHub → Vercel

1. Admin login di `/admin` (username & password dari ENV, session disimpan di cookie
   HttpOnly yang ditandatangani HMAC — bukan JWT library, tapi setara secara keamanan
   untuk kebutuhan ini).
2. Saat admin **upload foto album**: gambar dikompres di browser (Canvas API, resize
   max 1600px + kompresi JPEG) → dikirim ke `/api/albums` → server commit file gambar
   ke folder `albums/` dan update `json/albums.json` lewat GitHub REST API → otomatis
   push ke branch yang dikonfigurasi.
3. Saat admin **tambah/edit informasi**: `/api/information` update `json/information.json`
   lewat GitHub REST API.
4. Karena setiap perubahan adalah commit asli ke GitHub, jika repo terhubung ke proyek
   Vercel (Git Integration), Vercel akan **redeploy otomatis** setiap ada push — jadi
   perubahan admin akan tampil di situs publik setelah build baru selesai (biasanya
   hitungan puluhan detik).

> Catatan: pendekatan ini dipilih agar tidak perlu database eksternal maupun binary
> compression (mis. `sharp`) di server — semua "vanilla" dan mudah diaudit, sesuai
> instruksi awal untuk menghindari dependency yang tidak perlu.

## 3. Environment Variables

Salin `.env.example` → `.env` untuk pengembangan lokal, lalu isi juga di
**Vercel → Project → Settings → Environment Variables**:

| Variable          | Keterangan                                                        |
|-------------------|--------------------------------------------------------------------|
| `ADMIN_USERNAME`  | Username login admin                                               |
| `ADMIN_PASSWORD`  | Password login admin                                                |
| `SESSION_SECRET`  | String acak panjang untuk menandatangani cookie (`openssl rand -hex 32`) |
| `GITHUB_TOKEN`    | Personal Access Token GitHub (lihat langkah di bawah)              |
| `GITHUB_OWNER`    | Username/organisasi pemilik repo                                   |
| `GITHUB_REPO`     | Nama repository                                                     |
| `BRANCH`          | Branch tujuan commit, contoh `main`                                 |

### Membuat GitHub Personal Access Token

1. Buka GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. Pilih repository target (repo website kelas ini saja, jangan "All repositories").
3. Permissions → **Contents: Read and write**.
4. Generate, lalu salin token — ini nilai `GITHUB_TOKEN`. Simpan baik-baik, token
   hanya tampil sekali.

## 4. Menjalankan Secara Lokal

```bash
npm install -g vercel     # jika belum ada Vercel CLI
vercel dev                # menjalankan static site + serverless functions sekaligus
```

Buka `http://localhost:3000` untuk halaman publik, dan `http://localhost:3000/admin`
untuk panel admin. Pastikan file `.env` sudah terisi karena `vercel dev` membacanya
secara otomatis.

## 5. Deployment ke Vercel (dari awal sampai online)

1. **Push project ini ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "init: website 9A always aspiring"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. **Import ke Vercel**
   - Buka [vercel.com/new](https://vercel.com/new) → pilih repo yang baru di-push.
   - Framework Preset: pilih **Other** (karena vanilla, tanpa build step).
   - Root Directory: biarkan default (root repo).
3. **Isi Environment Variables** (lihat tabel di atas) di step import, atau setelah
   project dibuat lewat **Settings → Environment Variables**. Terapkan untuk
   *Production*, *Preview*, dan *Development*.
4. **Deploy**. Vercel akan build & memberi domain `*.vercel.app`.
5. Ganti `REPLACE-WITH-DOMAIN` pada `robots.txt` dan `sitemap.xml` dengan domain final,
   commit ulang.
6. (Opsional) Hubungkan domain kustom di **Settings → Domains**.
7. Sejak repo terhubung ke Vercel, setiap commit baru — termasuk commit otomatis dari
   admin panel — akan memicu deployment baru secara otomatis.

## 6. Catatan Data

- Data **Jadwal Pelajaran** (termasuk sesi pagi Upacara/Devotion/Kebaktian dan jam
  istirahat) sudah lengkap sesuai jadwal resmi TA 2026/2027 di `js/main.js`
  (`jadwalPelajaran`). Tabel otomatis menyorot hari & jam yang sedang berjalan
  berdasarkan waktu perangkat pengunjung.
- Ganti `ADMIN_USERNAME` / `ADMIN_PASSWORD` default sebelum deploy ke production.

## 7. Teknologi

HTML, CSS (CSS Variables, clamp typography, Grid/Flex), JavaScript (ES Modules,
Intersection Observer, Canvas API) — tanpa framework frontend. Backend memakai
Vercel Serverless Functions (Node.js, ES Modules) hanya untuk menyimpan
`GITHUB_TOKEN` dengan aman di sisi server; tidak ada database.

## 8. Lisensi & Kredit

Dibuat khusus untuk kelas 9A "Always Aspiring", SMP Methodist 6 — Class of 2026/2027.
Ikon dari [Lucide](https://lucide.dev). Font dari Google Fonts (Cormorant Garamond,
Playfair Display, Inter, Space Grotesk).
