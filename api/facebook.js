import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { url, type } = req.query;
    if (!url) return res.status(400).json({ error: "Parameter ?url= wajib diisi" });

    const apiUrl = `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || data.status === false) {
      return res.status(500).json({ error: "Gagal ambil data dari API Facebook" });
    }

    const videoHd = data.result?.hd || null;
    const videoSd = data.result?.sd || null;

    if (type === "redirect") {
      const videoUrl = videoHd || videoSd;
      if (!videoUrl) return res.status(404).send("Video tidak ditemukan");
      return res.redirect(videoUrl);
    }

    return res.status(200).json({
      success: true,
      video_hd: videoHd,
      video_sd: videoSd,
      result: data.result
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
