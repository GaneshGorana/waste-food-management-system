import express from "express";
import { getSearchTableDataForDonor, getSearchTableDataForDonorByAdmin, getSearchTableDataForFoodByAdmin, getSearchTableDataForserviceWorker, getSearchTableDataForServiceWorkerByAdmin } from "../controllers/searchFilterTableController.js";
const router = express.Router();

router.post('/get-search-filter-table-for-donor', getSearchTableDataForDonor)
router.post('/get-search-filter-table-for-service-worker', getSearchTableDataForserviceWorker)

router.post('/get-search-filter-table-for-donor-by-admin', getSearchTableDataForDonorByAdmin)
router.post('/get-search-filter-table-for-service-worker-by-admin', getSearchTableDataForServiceWorkerByAdmin)
router.post('/get-search-filter-table-for-food-by-admin', getSearchTableDataForFoodByAdmin)
export default router;