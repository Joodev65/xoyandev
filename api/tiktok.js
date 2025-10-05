const TIKWM_API = "https://www.tikwm.com/api/";

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
    const r = await fetch(TIKWM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.tikwm.com/"
      },
      body: JSON.stringify({ url })
    });

    const data = await r.json();
    if (data.code !== 0) return res.status(500).json({ error: "TikWM error", raw: data });

    const d = data.data;

    if (mode === "redirect") {
      if (!d.play) return res.status(500).json({ error: "No video url" });
      res.writeHead(302, { Location: d.play });
      return res.end();
    }

    
    return res.status(200).json({
      id: d.id,
      caption: d.title,
      duration: d.duration,
      play: d.play,
      wmplay: d.wmplay,
      music: d.music,
      author: d.author,
      stats: {
        play_count: d.play_count,
        digg_count: d.digg_count,
        comment_count: d.comment_count,
        share_count: d.share_count
      },
      cover: d.cover
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
