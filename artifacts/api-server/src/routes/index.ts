import { Router, type IRouter } from "express";
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
