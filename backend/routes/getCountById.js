import express from "express";
import { whoIsAllowed } from "../jwt/userAuthJWT.js";
import { getCountByIdOfDonorForAdmin, getCountByIdOfFoodForAdmin, getCountByIdOfFoodForDonor, getCountByIdOfFoodForServiceWorker, getCountByIdOfServiceWorkerForAdmin } from "../controllers/getCountById.js";
const router = express.Router();

router.get("/get-count-by-id-of-food-for-donor", whoIsAllowed("DONOR"), getCountByIdOfFoodForDonor);
router.get("/get-count-by-id-of-food-for-service-worker", whoIsAllowed("SERVICE"), getCountByIdOfFoodForServiceWorker);

router
    .get('/get-count-by-id-of-donor-for-admin', whoIsAllowed("ADMIN"), getCountByIdOfDonorForAdmin)
    .get('/get-count-by-id-of-service-worker-for-admin', whoIsAllowed("ADMIN"), getCountByIdOfServiceWorkerForAdmin)
    .get('/get-count-by-id-of-food-for-admin', whoIsAllowed("ADMIN"), getCountByIdOfFoodForAdmin)
export default router;