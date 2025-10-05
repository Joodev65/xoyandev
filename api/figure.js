import fetch from "node-fetch";

export default async function handler(req, res) {
  const { imgurl } = req.query;

  if (!imgurl) {
    return res.status(400).json({
      status: false,
      creator: "7ooModdss",
      result: "Enter ImgUrl",
    });
  }

  try {
    const apiRes = await fetch(`https://yume-figure.vercel.app/api/tofigure?imgurl=${encodeURIComponent(imgurl)}`);
    const data = await apiRes.json();

    if (data.status === true) {
      return res.json({
        status: true,
        creator: "7ooModdss",
        result: data.result,
      });
    } else {
      return res.json({
        status: false,
        creator: "7ooModdss",
        result: data.result || "error",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "7ooModdss",
      result: "internal server error",
    });
  }
}
