import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import mittagstischRouter from "./mittagstisch";
import dishesRouter from "./dishes";
import reservationsRouter from "./reservations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(mittagstischRouter);
router.use(dishesRouter);
router.use(reservationsRouter);

export default router;
