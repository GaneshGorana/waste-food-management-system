import express from "express";
import { getAdminDashboardFood, getAdminDashboardServiceWorker, getAdminDashboardUser, getDonorDashboard, getServiceWorkerDashboard } from "../controllers/dashboardController.js";
import { whoIsAllowed } from "../jwt/userAuthJWT.js";
const router = express.Router();

router.get('/donor', whoIsAllowed("DONOR"), getDonorDashboard);
router
    .get('/admin-user', whoIsAllowed("ADMIN"), getAdminDashboardUser)
    .get('/admin-service-worker', whoIsAllowed("ADMIN"), getAdminDashboardServiceWorker)
    .get('/admin-food', whoIsAllowed("ADMIN"), getAdminDashboardFood);

router.get('/service-worker', whoIsAllowed("SERVICE"), getServiceWorkerDashboard)
export default router;