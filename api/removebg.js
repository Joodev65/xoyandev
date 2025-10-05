import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = new FormData();

    if (req.headers["content-type"].includes("multipart/form-data")) {
      req.pipe(formData);
    }

    if (req.query.image_url) {
      formData.append("image_url", req.query.image_url);
    }

    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": "TunFjWyWn6RwU2Wkj9K1bo5K"
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const buffer = await response.buffer();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
