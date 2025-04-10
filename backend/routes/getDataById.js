import express from "express";
import { whoIsAllowed } from "../jwt/userAuthJWT.js";
import { getDataByIdOfDonorForAdmin, getDataByIdOfFoodForAdmin, getDataByIdOfFoodForDonor, getDataByIdOfFoodForServiceWorker, getDataByIdOfServiceWorkerForAdmin } from "../controllers/getDataById.js";
const router = express.Router();

router.post("/get-data-by-id-of-food-for-donor", whoIsAllowed("DONOR"), getDataByIdOfFoodForDonor);
router.post("/get-data-by-id-of-food-for-service-worker", whoIsAllowed("SERVICE"), getDataByIdOfFoodForServiceWorker);

router
    .post('/get-data-by-id-of-donor-for-admin', whoIsAllowed("ADMIN"), getDataByIdOfDonorForAdmin)
    .post('/get-data-by-id-of-service-worker-for-admin', whoIsAllowed("ADMIN"), getDataByIdOfServiceWorkerForAdmin)
    .post('/get-data-by-id-of-food-for-admin', whoIsAllowed("ADMIN"), getDataByIdOfFoodForAdmin)
export default router;