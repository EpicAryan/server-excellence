import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if(file.mimetype === 'application/pdf'){
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
}

//Configure upload middleware
export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 //25MB
    }
}).single('file');
