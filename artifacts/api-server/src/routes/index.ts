import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import homeRouter from "./home";
import booksRouter from "./books";
import chaptersRouter from "./chapters";
import commentsRouter from "./comments";
import usersRouter from "./users";
import premiumRouter from "./premium";
import adminRouter from "./admin";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(homeRouter);
router.use(booksRouter);
router.use(chaptersRouter);
router.use(commentsRouter);
router.use(usersRouter);
router.use(premiumRouter);
router.use(adminRouter);
router.use(notificationsRouter);

export default router;
