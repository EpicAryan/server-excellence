import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { Readable } from 'stream';

//Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export const uploadPdfToCloudinary = (buffer: Buffer, filename: string,  chapterId: number,
    chapterName: string) : Promise<string> => {
    return new Promise((resolve, reject) => {
        const folderName = `${chapterName.replace(/\s+/g, '-').toLowerCase()}-${chapterId}`;

        const uploadOptions: UploadApiOptions = {
            resource_type: 'raw',
            public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}.pdf`,
            folder: folderName,
            overwrite: true,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if(error) return reject(error);
                resolve(result?.secure_url || '');
            }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    })
}

export const deleteFileFromCloudinary = async (fileUrl: string): Promise<void> => {
    try {
        console.log("Deleting Cloudinary file:", fileUrl);

        const urlParts = fileUrl.split('/');
        const filenameWithExtension = decodeURIComponent(urlParts[urlParts.length - 1]);
        const folderPath = decodeURIComponent(urlParts[urlParts.length - 2]);
        const publicId = `${folderPath}/${filenameWithExtension}`;

        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw'
        });
    } catch (error){
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
    }
}

// controllers/cloudinary.controller.ts
import { Request, Response } from "express";
// import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (you probably already have this)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateUploadSignature = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chapterId, chapterName, topicName, fileName  } = req.body;

        if (!chapterId || !chapterName || !topicName || !fileName) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        // Generate folder name
        const folderName = `${chapterName.replace(/\s+/g, '-').toLowerCase()}-${chapterId}`;
        
        // Generate timestamp for unique public_id
        const timestamp = Math.round(new Date().getTime() / 1000);
         const publicId = `${timestamp}-${fileName.replace(/\.[^/.]+$/, "")}.pdf`;


        // Create upload parameters
        const uploadParams = {
            public_id: publicId,
            folder: folderName,
            overwrite: "true", // Must be string
            timestamp: timestamp.toString(),
            // resource_type: "raw"
        };

        // Generate signature
        const signature = cloudinary.utils.api_sign_request(uploadParams, process.env.CLOUDINARY_API_SECRET!);

        res.status(200).json({
            signature,
            timestamp,
             publicId,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: folderName,
        });

    } catch (error) {
        console.error('Error generating Cloudinary signature:', error);
        res.status(500).json({ error: 'Failed to generate upload signature' });
    }
};

export const deleteCloudinaryFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            res.status(400).json({ error: 'Public ID is required' });
            return;
        }

        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw'
        });

        res.status(200).json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
