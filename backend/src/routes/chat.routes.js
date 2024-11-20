import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { accessChat, fetchChats } from "../controllers/chat.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(accessChat)
router.route("/").get(fetchChats)


export default router