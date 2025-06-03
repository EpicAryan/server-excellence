// routes/cloudinary.routes.ts
import { Router } from 'express';
import { generateUploadSignature, deleteCloudinaryFile } from '../services';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/upload-signature',  generateUploadSignature);
router.post('/delete-file', authenticate, isAdmin, deleteCloudinaryFile);

export default router;
