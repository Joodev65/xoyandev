// ===================== DATA: STRUKTUR KELAS =====================
const struktur = {
  wali: { role: "Wali Kelas", name: "Ms Ayulina Siboro" },
  inti: [
    { role: "Ketua", name: "Bryan" },
    { role: "Wakil", name: "Givin" },
    { role: "Sekretaris", name: "Indah & Davyan" },
    { role: "Bendahara", name: "Jenita" }
  ],
  seksi: [
    { role: "Kerohanian", name: "Sela" },
    { role: "Kebersihan", name: "Abel & Johan" },
    { role: "Multimedia", name: "Chelsea & Rafael" },
    { role: "Dekorasi", name: "Jose" },
    { role: "Keamanan", name: "Beatrix" },
    { role: "Sosial", name: "Gracella" }
  ]
};

// ===================== DATA: JADWAL PIKET =====================
const piket = {
  "Senin": ["Jose", "Abel", "Jenita", "Christy", "Bane", "Desi"],
  "Selasa": ["Davyan", "Dian", "Gracella", "Reyhan", "Irvanda", "Tiarma", "Alexandro"],
  "Rabu": ["Indah", "Johan", "Givin", "Airyn", "Evelyn", "Bezalel"],
  "Kamis": ["Dewi", "Beatrix", "Jovan", "Chelsea", "Ignatius", "Alexander"],
  "Jumat": ["Sela", "Anita", "Angel", "Rizky", "Vikas", "Bryan", "Rafael"]
};

// ===================== RENDER: ORG TREE =====================
function initials(name){
  return name.split(/[\s&]+/).filter(Boolean).slice(0,2).map(n=>n[0]).join("").toUpperCase();
}

function renderOrgCard({role, name}){
  return `
    <div class="org-card">
      <div class="org-avatar">${initials(name)}</div>
      <p class="org-role">${role}</p>
      <p class="org-name">${name}</p>
    </div>`;
}

function renderOrgTree(){
  const el = document.getElementById("orgTree");
  el.innerHTML = `
    <div class="org-row">${renderOrgCard(struktur.wali)}</div>
    <div class="org-connector"></div>
    <div class="org-row">${struktur.inti.map(renderOrgCard).join("")}</div>
    <div class="org-connector"></div>
    <div class="org-row">${struktur.seksi.map(renderOrgCard).join("")}</div>
  `;
}

// ===================== RENDER: PIKET =====================
function renderPiket(){
  const el = document.getElementById("piketGrid");
  el.innerHTML = Object.entries(piket).map(([day, names]) => `
    <div class="piket-card">
      <p class="piket-day">${day}</p>
      <div class="piket-names">
        ${names.map(n => `<span class="piket-name">${n}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

// ===================== RENDER: TIMETABLE =====================
// Wali Kelas: Ayulina Siboro — Jadwal resmi TA 2026/2027
const hariList = Object.keys(piket); // Senin..Jumat

const jadwalPelajaran = [
  {
    label: "07.30–07.40", type: "opening",
    byDay: { Senin: "Upacara", Selasa: "Devotion", Rabu: "Devotion", Kamis: "Kebaktian", Jumat: "Devotion" },
    start: "07:30", end: "07:40"
  },
  {
    label: "Les 1", time: "07.40–08.20", type: "lesson",
    byDay: { Senin: "Informatika", Selasa: "B. Inggris", Rabu: "B. Indonesia", Kamis: "B. Inggris", Jumat: "B. Indonesia" },
    start: "07:40", end: "08:20"
  },
  {
    label: "Les 2", time: "08.20–09.00", type: "lesson",
    byDay: { Senin: "Informatika", Selasa: "B. Inggris", Rabu: "B. Indonesia", Kamis: "B. Inggris", Jumat: "B. Indonesia" },
    start: "08:20", end: "09:00"
  },
  {
    label: "Les 3", time: "09.00–09.40", type: "lesson",
    byDay: { Senin: "-", Selasa: "PKN", Rabu: "IPS", Kamis: "-", Jumat: "PJOK" },
    start: "09:00", end: "09:40"
  },
  { label: "09.40–09.55", type: "break", text: "ISTIRAHAT", start: "09:40", end: "09:55" },
  {
    label: "Les 4", time: "09.55–10.35", type: "lesson",
    byDay: { Senin: "Koding", Selasa: "PKN", Rabu: "Seni Musik", Kamis: "B. Indonesia", Jumat: "PJOK" },
    start: "09:55", end: "10:35"
  },
  {
    label: "Les 5", time: "10.35–11.15", type: "lesson",
    byDay: { Senin: "IPS", Selasa: "Matematika", Rabu: "Matematika", Kamis: "B. Indonesia", Jumat: "Agama" },
    start: "10:35", end: "11:15"
  },
  {
    label: "Les 6", time: "11.15–11.55", type: "lesson",
    byDay: { Senin: "IPS", Selasa: "Matematika", Rabu: "Matematika", Kamis: "IPA", Jumat: "Agama" },
    start: "11:15", end: "11:55"
  },
  { label: "11.55–12.10", type: "break", text: "ISTIRAHAT", start: "11:55", end: "12:10" },
  {
    label: "Les 7", time: "12.10–12.50", type: "lesson",
    byDay: { Senin: "Mandarin", Selasa: "IPA", Rabu: "IPA", Kamis: "S. Rupa/Prakarya", Jumat: "Matematika" },
    start: "12:10", end: "12:50"
  },
  {
    label: "Les 8", time: "12.50–13.30", type: "lesson",
    byDay: { Senin: "Mandarin", Selasa: "IPA", Rabu: "IPA", Kamis: "S. Rupa/Prakarya", Jumat: "-" },
    start: "12:50", end: "13:30"
  }
];

function toMinutes(hhmm){
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function renderTimetable(){
  const table = document.getElementById("timetable");
  const now = new Date();
  const today = now.toLocaleDateString("id-ID", { weekday: "long" });
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const thead = "<thead><tr><th>Jam</th>" + hariList.map(h => `<th>${h}</th>`).join("") + "</tr></thead>";

  const rows = jadwalPelajaran.map(period => {
    const isNowPeriod = nowMinutes >= toMinutes(period.start) && nowMinutes < toMinutes(period.end);
    const timeLabel = period.type === "lesson" ? `${period.label}<br><span class="time-range">${period.time}</span>` : period.label;

    if (period.type === "break"){
      return `<tr><td class="time">${timeLabel}</td><td colspan="${hariList.length}" class="break-cell${isNowPeriod ? " now" : ""}">${period.text}</td></tr>`;
    }

    const cells = hariList.map(day => {
      const isToday = day.toLowerCase() === today.toLowerCase();
      const classes = [isToday ? "today" : "", isToday && isNowPeriod ? "now" : ""].filter(Boolean).join(" ");
      const mapel = period.byDay[day] || "-";
      return `<td class="${classes}">${mapel}</td>`;
    }).join("");

    return `<tr><td class="time">${timeLabel}</td>${cells}</tr>`;
  }).join("");

  table.innerHTML = thead + "<tbody>" + rows + "</tbody>";
}

// ===================== ALBUM =====================
let albums = [];

async function loadAlbums(){
  try{
    const res = await fetch("json/albums.json");
    albums = await res.json();
    renderAlbum();
  }catch(e){
    console.error("Gagal memuat album:", e);
  }
}

function renderAlbum(){
  const grid = document.getElementById("albumGrid");
  const query = document.getElementById("albumSearch").value.toLowerCase();
  const sort = document.getElementById("albumSort").value;

  let items = albums.filter(a =>
    a.title.toLowerCase().includes(query) || a.caption.toLowerCase().includes(query)
  );

  items.sort((a,b) => sort === "newest"
    ? new Date(b.date) - new Date(a.date)
    : new Date(a.date) - new Date(b.date)
  );

  grid.innerHTML = items.map(item => `
    <div class="album-item" data-img="${item.image}" data-caption="${item.title}">
      <img data-src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="album-caption">${item.title}</div>
    </div>
  `).join("");

  // lazy load + blur reveal
  grid.querySelectorAll("img[data-src]").forEach(img => {
    const loadImg = () => {
      img.src = img.dataset.src;
      img.onload = () => img.classList.add("loaded");
    };
    if ("IntersectionObserver" in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){ loadImg(); io.disconnect(); }
        });
      });
      io.observe(img);
    } else {
      loadImg();
    }
  });

  grid.querySelectorAll(".album-item").forEach(item => {
    item.addEventListener("click", () => openLightbox(item.dataset.img, item.dataset.caption));
  });
}

function openLightbox(src, caption){
  const lb = document.getElementById("lightbox");
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightboxCaption").textContent = caption;
  lb.classList.add("open");
}
document.getElementById("lightboxClose").addEventListener("click", () => {
  document.getElementById("lightbox").classList.remove("open");
});
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox") e.target.classList.remove("open");
});

document.getElementById("albumSearch").addEventListener("input", renderAlbum);
document.getElementById("albumSort").addEventListener("change", renderAlbum);

// ===================== INFORMATION (Markdown) =====================
function parseMarkdown(md){
  return md
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n- (.*)/g, "<br>• $1");
}

async function loadInformation(){
  try{
    const res = await fetch("json/information.json");
    const data = await res.json();
    const list = document.getElementById("infoList");
    list.innerHTML = data.map(item => `
      <article class="info-item">
        <span class="info-date">${new Date(item.date).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</span>
        <h3>${item.title}</h3>
        <p>${parseMarkdown(item.content)}</p>
      </article>
    `).join("");
  }catch(e){
    console.error("Gagal memuat informasi:", e);
  }
}

// ===================== SCROLL ANIMATIONS =====================
function initScrollAnimations(){
  const targets = document.querySelectorAll("[data-animate]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => io.observe(t));
}

// ===================== NAVBAR =====================
function initNavbar(){
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

// ===================== FLOATING PARTICLES =====================
function initParticles(){
  const container = document.getElementById("particles");
  const count = window.innerWidth < 640 ? 10 : 22;
  for (let i = 0; i < count; i++){
    const p = document.createElement("span");
    p.className = "particle";
    const size = 3 + Math.random() * 5;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = `-${Math.random() * 20}px`;
    p.style.animationDuration = `${10 + Math.random() * 10}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(p);
  }
}

// ===================== GRAIN TEXTURE =====================
function initGrain(){
  const canvas = document.getElementById("grain");
  const ctx = canvas.getContext("2d");
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function draw(){
    resize();
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4){
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i+1] = v;
      imageData.data[i+2] = v;
      imageData.data[i+3] = 12;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  draw();
  window.addEventListener("resize", draw);
}

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {
  renderOrgTree();
  renderPiket();
  renderTimetable();
  loadAlbums();
  loadInformation();
  initScrollAnimations();
  initNavbar();
  initParticles();
  initGrain();
  if (window.lucide) lucide.createIcons();
  window.addEventListener("load", () => { if (window.lucide) lucide.createIcons(); });
});
