export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const url = req.query?.url;
  const mode = req.query?.mode || "json"; 

  if (!url) return res.status(400).json({ error: "Missing url query param" });

  try {
    const apiUrl = `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`;
    const r = await fetch(apiUrl);
    const data = await r.json();

    if (!data.status || !Array.isArray(data.data) || data.data.length === 0) {
      return res.status(500).json({ error: "IG API error", raw: data });
    }

    const medias = data.data; 
    const first = medias[0]; 

    if (mode === "redirect") {
      if (!first.url) return res.status(500).json({ error: "No media url" });
      res.writeHead(302, { Location: first.url });
      return res.end();
    }

    
    return res.status(200).json({
      source: url,
      provider: "7oocode-api",
      medias: medias.map(m => ({
        type: m.type || (m.url.endsWith(".mp4") ? "video" : "image"),
        url: m.url,
        thumbnail: m.thumbnail || null
      })),
      timestamp: data.timestamp || null
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
