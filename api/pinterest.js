import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { url, type } = req.query;
    if (!url) return res.status(400).json({ error: "Parameter ?url= wajib diisi" });

    const apiUrl = `https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || data.status === false) {
      return res.status(500).json({ error: "Gagal ambil data dari API Pinterest" });
    }

    const mediaUrl = data.result?.url || data.result?.media || null;
    if (!mediaUrl) return res.status(404).json({ error: "Media tidak ditemukan" });

    
    if (type === "redirect") {
      return res.redirect(mediaUrl);
    }

    
    return res.status(200).json({
      success: true,
      url: mediaUrl,
      result: data.result
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
