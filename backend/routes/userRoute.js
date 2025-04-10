import express from 'express'
import { logout, userDelete, userLogin, userProfilePicUpload, userRegister, userUpdate } from '../controllers/userAuthController.js'
import { whoIsAllowed } from '../jwt/userAuthJWT.js';
import Upload from '../utils/FileUpload.js';

const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/update', userUpdate)
router.post('/upload-profile-pic', whoIsAllowed("DONOR"), Upload.single('profilePic'), userProfilePicUpload)
router.get('/logout', whoIsAllowed("DONOR"), logout)
router.post('/delete', whoIsAllowed("ANY"), userDelete)

export default router;