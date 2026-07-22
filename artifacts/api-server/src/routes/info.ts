import { Router, type IRouter } from "express";
import { GetRestaurantInfoResponse } from "@workspace/api-zod";
import { readJSON } from "../lib/gcs";

const router: IRouter = Router();

export const INFO_DEFAULTS = {
  name: "Quindici Trattoria Pizzeria",
  address: "Schloßstraße 3, 82031 Grünwald",
  phone: "+49 89 6412550",
  email: "info@quindici-gruenwald.de",
  lat: 48.0483,
  lng: 11.5267,
};

export const INFO_KEY = "config/restaurant-info";

router.get("/info", async (_req, res) => {
  const stored = await readJSON<typeof INFO_DEFAULTS>(INFO_KEY);
  const data = GetRestaurantInfoResponse.parse(stored ?? INFO_DEFAULTS);
  res.json(data);
});

export default router;
