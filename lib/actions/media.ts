"use server";

import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

/**
 * Server action to upload binary files from standard HTML file inputs or drag-and-drop drops.
 * Supports image, video, and PDF file types.
 * @param formData FormData containing 'file' and optional 'folder' key.
 */
export async function uploadMediaAction(formData: FormData) {
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "general";

  if (!file || file.size === 0) {
    return { success: false, error: "No file provided or the file is empty." };
  }

  // Validate file sizes/types for security
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
    "video/mp4", "video/webm", "video/ogg", "video/quicktime",
    "application/pdf"
  ];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: `Invalid file format: ${file.type}. Allowed formats are images, videos, and PDFs.` };
  }

  // Max 50MB for video/attachments
  const maxSizeBytes = 50 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { success: false, error: "File exceeds the maximum size limit of 50MB." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const res = await uploadToCloudinary(base64Data, folder);
    return { success: true, url: res.url, publicId: res.publicId };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to complete media upload." };
  }
}

/**
 * Server action to delete an asset from Cloudinary.
 * @param publicId Cloudinary public asset ID.
 */
export async function deleteMediaAction(publicId: string) {
  if (!publicId) return { success: false, error: "Missing public asset ID." };

  try {
    const res = await deleteFromCloudinary(publicId);
    return { success: res.success };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete asset." };
  }
}
