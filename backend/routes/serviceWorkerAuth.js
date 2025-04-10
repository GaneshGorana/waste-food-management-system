import express from "express";
import { workerApprove, workerDelete, workerLogin, workerProfilePicUpload, workerRegister, workerReject, workerUpdate } from "../controllers/serviceWorkerController.js";
import { logout } from "../controllers/userAuthController.js";
import { whoIsAllowed } from "../jwt/userAuthJWT.js";
import Upload from "../utils/FileUpload.js";
const router = express.Router();

router.post('/register', workerRegister)
router.post('/login', workerLogin)
router.post('/update', workerUpdate)
router.post('/upload-profile-pic', whoIsAllowed("SERVICE"), Upload.single('profilePic'), workerProfilePicUpload)
router.post('/delete', whoIsAllowed("ADMIN"), workerDelete)
router.post('/approve', whoIsAllowed("ADMIN"), workerApprove)
router.post('/reject', whoIsAllowed("ADMIN"), workerReject)
router.get('/logout', whoIsAllowed("SERVICE"), logout)
export default router;