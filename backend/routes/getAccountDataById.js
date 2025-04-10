import express from "express";
import { getAccountDataByIdOfAdmin, getAccountDataByIdOfDonor, getAccountDataByIdOfOrganization, getAccountDataByIdOfServiceWorker } from "../controllers/getAccountDataByIdController.js";
const router = express.Router();

router.post("/donor", getAccountDataByIdOfDonor)
router.post("/service-worker", getAccountDataByIdOfServiceWorker)
router.post("/admin", getAccountDataByIdOfAdmin)
router.post("/organization", getAccountDataByIdOfOrganization)

export default router;