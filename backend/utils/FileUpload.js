import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = req.body.foodName ? 'food' : 'user';
        return cb(null, path.resolve(`./uploads/${folder}`));
    },
    filename: function (req, file, cb) {
        return cb(null, `${randomUUID()}-${file.originalname}`);
    },
});

const Upload = multer({ storage });
export default Upload;