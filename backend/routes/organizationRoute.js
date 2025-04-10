import express from 'express'
import { organizationLogin, organizationRegister } from '../controllers/organizationAuthController.js';

const router = express.Router();

router.post('/register', organizationRegister);
router.post('/login', organizationLogin);

export default router;