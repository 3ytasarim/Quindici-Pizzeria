import { Router } from "express";

const router = Router();

router.get("/instagram/posts", async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return res.json({ posts: [], configured: false });
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=3&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json();
      req.log.error({ err }, "Instagram API error");
      return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
    }
    const data = await response.json() as { data: unknown[] };
    return res.json({ posts: data.data ?? [], configured: true });
  } catch (err) {
    req.log.error({ err }, "Instagram fetch failed");
    return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
  }
});

export default router;
