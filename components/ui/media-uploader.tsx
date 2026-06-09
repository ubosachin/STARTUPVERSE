"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, Film, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "./button";
import { uploadMediaAction, deleteMediaAction } from "@/lib/actions/media";
import { cn } from "@/lib/utils/cn";

interface MediaUploaderProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onDeleteSuccess?: () => void;
  defaultValue?: string;
  defaultPublicId?: string;
  folder?: string;
  label?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

export function MediaUploader({
  onUploadSuccess,
  onDeleteSuccess,
  defaultValue = "",
  defaultPublicId = "",
  folder = "general",
  label = "Upload media or documents",
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "application/pdf"],
  maxSizeMB = 10,
  className
}: MediaUploaderProps) {
  const [fileUrl, setFileUrl] = useState<string>(defaultValue);
  const [publicId, setPublicId] = useState<string>(defaultPublicId);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is ${maxSizeMB}MB.`);
      return;
    }

    // Validate type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed formats: ${allowedTypes.map(t => t.split("/")[1]).join(", ")}`);
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await uploadMediaAction(formData);
      if (res.success && res.url && res.publicId) {
        setFileUrl(res.url);
        setPublicId(res.publicId);
        onUploadSuccess(res.url, res.publicId);
      } else {
        setError(res.error || "Failed to upload file to storage.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleDelete() {
    if (!publicId) {
      setFileUrl("");
      if (onDeleteSuccess) onDeleteSuccess();
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await deleteMediaAction(publicId);
      if (res.success) {
        setFileUrl("");
        setPublicId("");
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        setError(res.error || "Failed to delete resource from storage.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete file.");
    } finally {
      setIsUploading(false);
    }
  }

  const isImage = fileUrl && (fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || fileUrl.includes("/image/upload/"));
  const isVideo = fileUrl && (fileUrl.match(/\.(mp4|webm|ogg|mov)/i) || fileUrl.includes("/video/upload/"));
  const isPdf = fileUrl && fileUrl.match(/\.pdf/i);

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && <label className="text-xs font-bold uppercase tracking-wider text-muted">{label}</label>}

      {fileUrl ? (
        <div className="relative rounded-2xl border border-border bg-surface/30 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[160px] group">
          {/* Media Preview */}
          {isImage && (
            <img src={fileUrl} alt="Uploaded preview" className="max-h-48 object-contain rounded-xl shadow-soft" />
          )}

          {isVideo && (
            <video src={fileUrl} controls className="max-h-48 rounded-xl shadow-soft" />
          )}

          {isPdf && (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger shadow-sm">
                <FileText size={22} />
              </div>
              <span className="text-xs font-semibold text-ink truncate max-w-xs">PDF Document Uploaded</span>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold hover:underline">
                View Document →
              </a>
            </div>
          )}

          {!isImage && !isVideo && !isPdf && (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <Sparkles size={22} />
              </div>
              <span className="text-xs font-semibold text-ink truncate max-w-xs">Attachment Loaded</span>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold hover:underline">
                Open Link →
              </a>
            </div>
          )}

          {/* Delete action overlay */}
          <Button
            type="button"
            variant="dark"
            size="icon"
            onClick={handleDelete}
            disabled={isUploading}
            className="absolute top-2 right-2 size-8 rounded-full shadow-md hover:bg-danger hover:scale-105 transition"
            title="Remove Media"
          >
            {isUploading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 min-h-[160px]",
            isDragging 
              ? "border-primary bg-primary/5 scale-[0.98]" 
              : "border-border hover:border-primary/50 hover:bg-surface/50 bg-white"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={allowedTypes.join(",")}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-bold text-muted uppercase tracking-wide">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <>
              <div className="grid size-12 place-items-center rounded-2xl bg-surface border border-border/80 text-muted shadow-line">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">Drag and drop or click to upload</p>
                <p className="text-[10px] text-muted mt-1 leading-normal max-w-[240px] mx-auto">
                  Supports images, videos, and PDFs up to {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-semibold text-danger bg-danger/10 px-3 py-1.5 rounded-lg animate-pulse">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
