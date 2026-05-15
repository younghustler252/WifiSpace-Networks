// modules/shared/services/cloudinary.service.js
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    
});

export class CloudinaryService {
    
    async upload(file) {
        const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: "avatars",
            overwrite: true,
            resource_type: "image"
        });
    

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    }

    async delete(publicId) {
        if (!publicId) return;
        await cloudinary.v2.uploader.destroy(publicId);
    }

}