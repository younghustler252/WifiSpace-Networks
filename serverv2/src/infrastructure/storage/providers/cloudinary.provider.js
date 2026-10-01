import cloudinary from "cloudinary";
import { FileStorageService } from "../file-storage.interface.js";

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

export class CloudinaryProvider extends FileStorageService {
	async upload(file, { folder = "avatars" } = {}) {
		const result = await cloudinary.v2.uploader.upload(file.path, {
			folder,
			overwrite: true,
			resource_type: "image"
		});

		return { url: result.secure_url, publicId: result.public_id };
	}

	async delete(publicId) {
		if (!publicId) return;
		await cloudinary.v2.uploader.destroy(publicId);
	}
}