import { Router } from "express";
import {loginUser ,logoutUser , registerUser, refreshAccessToken, searchUser } from "../controllers/user.controller.js";
import {uploadProfilePhoto} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    uploadProfilePhoto,
    registerUser
)

router.route("/login").post(loginUser)
router.route("/searchUser").post(searchUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router