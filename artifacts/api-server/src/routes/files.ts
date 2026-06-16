import { Router } from "express";
import { streamFile } from "../lib/gcs";

const router = Router();

router.get("/files/:folder/:filename", async (req, res) => {
  const { folder, filename } = req.params;
  if (!folder || !filename) return res.status(404).end();
  await streamFile(`${folder}/${filename}`, res);
});

export default router;
