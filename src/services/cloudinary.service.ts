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
            // public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
            public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}.pdf`,
            folder: folderName,
            overwrite: true,
            // format: 'pdf'
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
