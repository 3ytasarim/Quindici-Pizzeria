import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import mittagstischRouter from "./mittagstisch";
import dishesRouter from "./dishes";
import reservationsRouter from "./reservations";
import galleryRouter from "./gallery";
import pizzaRouter from "./pizza";
import filesRouter from "./files";
import instagramRouter from "./instagram";

const router: IRouter = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith("/files/")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

router.use(healthRouter);
router.use(adminRouter);
router.use(mittagstischRouter);
router.use(dishesRouter);
router.use(reservationsRouter);
router.use(galleryRouter);
router.use(pizzaRouter);
router.use(filesRouter);
router.use(instagramRouter);

export default router;
