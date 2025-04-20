import express from "express";
import { getAccountDataByIdOfAdmin, getAccountDataByIdOfDonor, getAccountDataByIdOfServiceWorker } from "../controllers/getAccountDataByIdController.js";
const router = express.Router();

router.post("/donor", getAccountDataByIdOfDonor)
router.post("/service-worker", getAccountDataByIdOfServiceWorker)
router.post("/admin", getAccountDataByIdOfAdmin)

export default router;