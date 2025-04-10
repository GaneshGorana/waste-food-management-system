import express from "express";
import { whoIsAllowed } from "../jwt/userAuthJWT.js";
import { refreshAdminCookie, refreshServiceWorkerCookie, refreshUserCookie } from "../controllers/refreshCookie.js";
const router = express.Router();

router.post("/user", whoIsAllowed("DONOR"), refreshUserCookie)
router.post("/service-worker", whoIsAllowed("SERVICE"), refreshServiceWorkerCookie)
router.post("/admin", whoIsAllowed("ADMIN"), refreshAdminCookie)
export default router;