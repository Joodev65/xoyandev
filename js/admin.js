// js/admin.js
// Logic untuk /admin — login, dashboard, CRUD album & informasi.
// Semua permintaan tulis (POST/PUT/DELETE) memakai cookie session HttpOnly (credentials: "include").

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");

// ===================== TOAST =====================
function toast(message, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = `toast ${type === "error" ? "error" : ""}`;
  el.hidden = false;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => (el.hidden = true), 3200);
}

// ===================== BUTTON LOADING STATE =====================
function setLoading(button, loading) {
  button.disabled = loading;
  button.querySelector(".btn-label")?.toggleAttribute("hidden", loading);
  button.querySelector(".spinner")?.toggleAttribute("hidden", !loading);
}

// ===================== CONFIRM MODAL =====================
function confirmAction(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    document.getElementById("confirmMessage").textContent = message;
    modal.hidden = false;

    const cleanup = (result) => {
      modal.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    };
    const okBtn = document.getElementById("confirmOk");
    const cancelBtn = document.getElementById("confirmCancel");
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}

// ===================== API HELPERS =====================
async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan.");
  return data;
}

// ===================== AUTH =====================
async function checkSession() {
  const data = await api("/api/session");
  if (data.authenticated) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  loadAlbumList();
  loadInfoList();
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  const errorEl = document.getElementById("loginError");
  errorEl.hidden = true;
  setLoading(btn, true);

  try {
    const body = {
      username: form.username.value.trim(),
      password: form.password.value,
    };
    await api("/api/login", { method: "POST", body: JSON.stringify(body) });
    showDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  } finally {
    setLoading(btn, false);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  showLogin();
});

// ===================== TABS =====================
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".admin-tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ===================== IMAGE COMPRESSION (Canvas) =====================
function compressImage(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl.split(",")[1]); // base64 tanpa prefix
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===================== EDIT MODAL (shared: album & information) =====================
let currentAlbums = [];
let currentInfo = [];

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

function openEditModal(type, item) {
  editForm.dataset.type = type;
  editForm.dataset.id = item.id;

  document.getElementById("editModalTitle").textContent =
    type === "album" ? "Edit Album" : "Edit Informasi";
  document.getElementById("editCaptionField").hidden = type !== "album";
  document.getElementById("editContentField").hidden = type !== "info";

  editForm.title.value = item.title || "";
  editForm.date.value = item.date || "";
  if (type === "album") {
    editForm.caption.value = item.caption || "";
  } else {
    editForm.content.value = item.content || "";
  }

  editModal.hidden = false;
}

document.getElementById("editCancel").addEventListener("click", () => {
  editModal.hidden = true;
});
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) editModal.hidden = true;
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = editForm.dataset.type;
  const id = Number(editForm.dataset.id);
  const btn = editForm.querySelector("button[type=submit]");
  setLoading(btn, true);

  try {
    if (type === "album") {
      await api("/api/albums", {
        method: "PUT",
        body: JSON.stringify({
          id,
          title: editForm.title.value.trim(),
          caption: editForm.caption.value.trim(),
          date: editForm.date.value,
        }),
      });
      toast("Album berhasil diperbarui.");
      loadAlbumList();
    } else {
      await api("/api/information", {
        method: "PUT",
        body: JSON.stringify({
          id,
          title: editForm.title.value.trim(),
          content: editForm.content.value.trim(),
          date: editForm.date.value,
        }),
      });
      toast("Informasi berhasil diperbarui.");
      loadInfoList();
    }
    editModal.hidden = true;
  } catch (err) {
    toast(err.message, "error");
  } finally {
    setLoading(btn, false);
  }
});

// ===================== ALBUM =====================
const albumImageInput = document.getElementById("albumImageInput");
albumImageInput.addEventListener("change", () => {
  const file = albumImageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("albumPreviewImg").src = reader.result;
    document.getElementById("albumPreview").hidden = false;
  };
  reader.readAsDataURL(file);
});

document.getElementById("albumForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  const file = albumImageInput.files[0];
  if (!file) return;

  setLoading(btn, true);
  try {
    const imageBase64 = await compressImage(file);
    await api("/api/albums", {
      method: "POST",
      body: JSON.stringify({
        title: form.title.value.trim(),
        caption: form.caption.value.trim(),
        date: form.date.value,
        imageBase64,
        imageName: file.name,
      }),
    });
    toast("Album berhasil diunggah & dipush ke GitHub.");
    form.reset();
    document.getElementById("albumPreview").hidden = true;
    loadAlbumList();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    setLoading(btn, false);
  }
});

async function loadAlbumList() {
  const list = document.getElementById("albumList");
  list.innerHTML = "<p>Memuat...</p>";
  try {
    const albums = await api("/api/albums");
    currentAlbums = albums;
    if (!albums.length) {
      list.innerHTML = "<p>Belum ada album.</p>";
      return;
    }
    list.innerHTML = albums
      .map(
        (a) => `
      <div class="admin-list-item" data-id="${a.id}">
        <img src="${a.image}" alt="${a.title}">
        <div class="item-body">
          <h3>${a.title}</h3>
          <p>${a.caption || "—"} · ${a.date}</p>
        </div>
        <div class="item-actions">
          <button class="icon-btn" data-action="edit-album" data-id="${a.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="icon-btn danger" data-action="delete-album" data-id="${a.id}" data-title="${a.title}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>`
      )
      .join("");
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    list.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

document.getElementById("albumList").addEventListener("click", async (e) => {
  const editBtn = e.target.closest("[data-action=edit-album]");
  if (editBtn) {
    const album = currentAlbums.find((a) => a.id === Number(editBtn.dataset.id));
    if (album) openEditModal("album", album);
    return;
  }

  const btn = e.target.closest("[data-action=delete-album]");
  if (!btn) return;
  const ok = await confirmAction(`Hapus album "${btn.dataset.title}"?`);
  if (!ok) return;
  try {
    await api("/api/albums", { method: "DELETE", body: JSON.stringify({ id: Number(btn.dataset.id) }) });
    toast("Album dihapus.");
    loadAlbumList();
  } catch (err) {
    toast(err.message, "error");
  }
});

// ===================== INFORMATION =====================
function parseMarkdownPreview(md) {
  return md
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

const infoForm = document.getElementById("infoForm");
infoForm.content.addEventListener("input", () => {
  document.getElementById("infoPreview").innerHTML = `
    <h3>${infoForm.title.value || "Judul Pengumuman"}</h3>
    <p>${parseMarkdownPreview(infoForm.content.value)}</p>`;
});
infoForm.title.addEventListener("input", () => infoForm.content.dispatchEvent(new Event("input")));

infoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  setLoading(btn, true);
  try {
    await api("/api/information", {
      method: "POST",
      body: JSON.stringify({
        title: form.title.value.trim(),
        content: form.content.value.trim(),
        date: form.date.value,
      }),
    });
    toast("Informasi berhasil disimpan & dipush ke GitHub.");
    form.reset();
    document.getElementById("infoPreview").innerHTML = "";
    loadInfoList();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    setLoading(btn, false);
  }
});

async function loadInfoList() {
  const list = document.getElementById("infoList");
  list.innerHTML = "<p>Memuat...</p>";
  try {
    const info = await api("/api/information");
    currentInfo = info;
    if (!info.length) {
      list.innerHTML = "<p>Belum ada informasi.</p>";
      return;
    }
    list.innerHTML = info
      .map(
        (i) => `
      <div class="admin-list-item" data-id="${i.id}">
        <div class="item-body">
          <h3>${i.title}</h3>
          <p>${i.date}</p>
        </div>
        <div class="item-actions">
          <button class="icon-btn" data-action="edit-info" data-id="${i.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="icon-btn danger" data-action="delete-info" data-id="${i.id}" data-title="${i.title}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>`
      )
      .join("");
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    list.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}

document.getElementById("infoList").addEventListener("click", async (e) => {
  const editBtn = e.target.closest("[data-action=edit-info]");
  if (editBtn) {
    const info = currentInfo.find((i) => i.id === Number(editBtn.dataset.id));
    if (info) openEditModal("info", info);
    return;
  }

  const btn = e.target.closest("[data-action=delete-info]");
  if (!btn) return;
  const ok = await confirmAction(`Hapus informasi "${btn.dataset.title}"?`);
  if (!ok) return;
  try {
    await api("/api/information", { method: "DELETE", body: JSON.stringify({ id: Number(btn.dataset.id) }) });
    toast("Informasi dihapus.");
    loadInfoList();
  } catch (err) {
    toast(err.message, "error");
  }
});

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  if (window.lucide) lucide.createIcons();
});
