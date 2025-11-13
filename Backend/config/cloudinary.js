import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier';

export const cloudinaryConfig = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.SECRET_KEY,
        })
        console.log('Cloudinary configured successfully')
    } catch (error) {
        console.error('Error configuring Cloudinary:', error.message)
    }
}

// Upload image from a file **buffer**
export const cloudinaryUploadImg = async(fileBuffer, folder = 'uploads') => {
    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
        });

        return {
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error('Image upload failed');
    }
};

export const cloudinaryDeleteImg = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok')
            return { message: 'Image deleted successfully' };
        throw new Error('Failed to delete image');
    } catch (error) {
        console.error('Cloudinary delete failed:', error.message);
        throw new Error('Image deletion failed');
    }
};