import express from "express"
import { foodAdd, foodAllocateToWorker, foodDelete, foodDeliveries, foodDeliveryAccept, foodDeliveryAcceptFromNearbyPlace, foodDeliveryCollect, foodDeliveryComplete, foodImageUpload, foodUpdate } from "../controllers/foodController.js"
import Upload from "../utils/FileUpload.js"
import { whoIsAllowed } from "../jwt/userAuthJWT.js"
const router = express.Router()

router.post('/add', whoIsAllowed("ANY"), Upload.single('foodImage'), foodAdd)
router.post('/upload-food-image', whoIsAllowed("DONOR"), Upload.single('foodImage'), foodImageUpload)
router.post('/update', whoIsAllowed("ANY"), foodUpdate)
router.post('/delete', whoIsAllowed("ANY"), foodDelete)
router.get('/available-deliveries', foodDeliveries)
router.post('/delivery-accept', whoIsAllowed("SERVICE"), foodDeliveryAccept)
router.post('/delivery-accept-from-nearby-place', whoIsAllowed("SERVICE"), foodDeliveryAcceptFromNearbyPlace)
router.post('/delivery-collect', whoIsAllowed("SERVICE"), foodDeliveryCollect)
router.post('/delivery-complete', whoIsAllowed("SERVICE"), foodDeliveryComplete)
router.post('/service-worker/add', whoIsAllowed("ADMIN"), foodAllocateToWorker)

export default router