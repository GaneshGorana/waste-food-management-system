import express from 'express'
import { addNearByPlace, deleteNearByPlace, nearbyPlaces, updateNearByPlace } from '../controllers/nearbyPlacesController.js';
const router = express.Router();

router.get('/', nearbyPlaces)
router.post('/add', addNearByPlace).post('/update', updateNearByPlace).post('/delete', deleteNearByPlace)

export default router;