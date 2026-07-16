import { Router, type IRouter } from "express";
import { GetRestaurantInfoResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/info", (_req, res) => {
  const data = GetRestaurantInfoResponse.parse({
    name: "Quindici Trattoria Pizzeria",
    address: "Schloßstraße 3, 82031 Grünwald",
    phone: "+49 89 6412550",
    email: "info@quindici-gruenwald.de",
    lat: 48.0483,
    lng: 11.5267,
  });
  res.json(data);
});

export default router;
