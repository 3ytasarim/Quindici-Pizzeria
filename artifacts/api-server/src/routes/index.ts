import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import mittagstischRouter from "./mittagstisch";
import dishesRouter from "./dishes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(mittagstischRouter);
router.use(dishesRouter);

export default router;
