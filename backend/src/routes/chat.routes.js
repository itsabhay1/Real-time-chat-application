import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { accessChat } from "../controllers/chat.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(accessChat)


export default router