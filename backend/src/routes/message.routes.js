import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {allMessages, sendMessage} from "../controllers/message.controller.js";
import {uploadMedia} from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/:chatId").get(allMessages);
router.route("/send").post(uploadMedia, sendMessage);

export default router