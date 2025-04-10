import express from 'express'
import { nearbyPlaces } from '../controllers/nearbyPlacesController.js';
const router = express.Router();

router.get('/', nearbyPlaces)

export default router;