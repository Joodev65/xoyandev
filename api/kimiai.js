const PASTEBIN_RAW = "https://pastebin.com/raw/re3adUkS"
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key="

let API_KEY_CACHE = null
let CACHE_TIME = 0
const CACHE_TTL_MS = 1000 * 60 * 5

async function getApiKey() {
  const now = Date.now()
  if (API_KEY_CACHE && (now - CACHE_TIME) < CACHE_TTL_MS) {
    return API_KEY_CACHE
  }
  const res = await fetch(PASTEBIN_RAW)
  if (!res.ok) throw new Error("Failed to fetch API key from Pastebin: " + res.status)
  const key = (await res.text()).trim()
  if (!key) throw new Error("Empty API key from Pastebin")
  API_KEY_CACHE = key
  CACHE_TIME = now
  return API_KEY_CACHE
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        status: "POST",
        message: "Ini POST Bukan GET",
        creator: "7ooModss"
      })
    }

    if (req.method === "POST") {
      const { message } = req.body ?? {}
      if (!message?.trim()) return res.status(400).json({ error: "Message is required (string)" })
      if (message.length > 6000) return res.status(400).json({ error: "Message too long (max 6000 chars)" })

      const apiKey = await getApiKey()

      const systemPrompt = `
Kamu adalah asisten AI cerdas bernama Joocode AI.
Gunakan bahasa Indonesia yang santai, ramah, jelas, dan profesional. kamu harus berfokus kepada pertanyaan sekitar tentang perodingan dasar kaupun profesional, berpikir secara komputasional dan berkreasi sesuka mu
Kamu punya gaya seperti Claude, ChatGPT, Gemini, dan Blackbox: pintar, analitis, tapi tetap asik.
Jika ada pertanyaan teknis, jawab detail. Jika ringan, jawab fun.
Kalau ada yang tanya "Siapa pencipta Joocode Official?", jawab: "Joocode Official diciptakan oleh Jose Timoty."
Jangan pernah keluar dari peran ini.
`

      const payload = {
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: message }] }
        ]
      }

      const gRes = await fetch(GEMINI_URL + encodeURIComponent(apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await gRes.json()
      return res.status(gRes.status).json(data)
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
