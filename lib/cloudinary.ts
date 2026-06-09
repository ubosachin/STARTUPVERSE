import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true
});

/**
 * Upload a media file to Cloudinary from the server side.
 * @param fileBase64 The base64 data string of the file (e.g. data:image/png;base64,...)
 * @param folder The target subfolder inside 'startupverse/'
 */
export async function uploadToCloudinary(fileBase64: string, folder: string) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are missing. Please configure them in your .env file.");
  }

  try {
    const res = await cloudinary.uploader.upload(fileBase64, {
      folder: `startupverse/${folder}`,
      resource_type: "auto"
    });
    return { url: res.secure_url, publicId: res.public_id };
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    throw new Error(error.message || "Cloudinary upload execution failed.");
  }
}

/**
 * Delete a media file from Cloudinary using its public ID.
 * @param publicId The Cloudinary public ID of the resource to destroy.
 */
export async function deleteFromCloudinary(publicId: string) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return { success: res.result === "ok" };
  } catch (error: any) {
    console.error("Cloudinary delete failed:", error);
    throw new Error(error.message || "Cloudinary deletion failed.");
  }
}
