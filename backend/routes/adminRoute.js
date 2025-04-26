import express from "express";
import { adminDelete, adminLogin, adminProfilePicUpload, adminRegister, adminUpdate, adminUpdatePassword } from "../controllers/adminController.js";
import { logout } from "../controllers/userAuthController.js";
import { whoIsAllowed } from "../jwt/userAuthJWT.js";
import Upload from "../utils/FileUpload.js";
const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post('/update', adminUpdate)
router.post('/update-password', whoIsAllowed("ADMIN"), adminUpdatePassword)
router.post('/upload-profile-pic', whoIsAllowed("ADMIN"), Upload.single("profilePic"), adminProfilePicUpload)
router.post('/delete', adminDelete)
router.get("/logout", whoIsAllowed("ADMIN"), logout)
export default router;