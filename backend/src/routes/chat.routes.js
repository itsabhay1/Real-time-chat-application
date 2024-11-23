import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { accessChat, addUser, createGroup, fetchChats, removeUser, renameGroupChat } from "../controllers/chat.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(accessChat)
router.route("/").get(fetchChats)
router.route("/groupChat").post(createGroup)
router.route("/renameGroup").put(renameGroupChat)
router.route("/addUser").put(addUser)
router.route("/removeUser").put(removeUser)


export default router