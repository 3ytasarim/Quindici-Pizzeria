import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import mittagstischRouter from "./mittagstisch";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(mittagstischRouter);

export default router;
