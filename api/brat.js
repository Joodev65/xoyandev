export default async function handler(req, res) {
  try {
    const { text, isAnimated, delay, type } = req.query;
    if (!text) return res.status(400).json({ error: "Parameter ?text= wajib diisi" });

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}${
      isAnimated ? `&isAnimated=${isAnimated}` : ""
    }${delay ? `&delay=${delay}` : ""}`;

    const response = await fetch(apiUrl);

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!data || data.status === false) {
        return res.status(500).json({ error: "Gagal ambil data JSON", raw: data });
      }
      const mediaUrl = data.result?.url || null;
      if (!mediaUrl) return res.status(404).json({ error: "Media tidak ditemukan" });

      if (type === "redirect") return res.redirect(mediaUrl);

      return res.status(200).json({
        success: true,
        url: mediaUrl,
        result: data.result,
      });
    } else {
      
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mime = contentType || "image/png";
      const dataUrl = `data:${mime};base64,${base64}`;

      if (type === "redirect") {
        res.setHeader("Content-Type", mime);
        return res.send(Buffer.from(base64, "base64"));
      }

      return res.status(200).json({
        success: true,
        url: dataUrl,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
