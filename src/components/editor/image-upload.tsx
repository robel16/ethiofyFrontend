"use client";

import { useState, useCallback, useRef } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { FileService, UploadedFile } from "@/services/file.service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ImageUploadProps {
  canvas: fabric.Canvas | null;
  onImageAdd?: (image: fabric.Image) => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  uploadedFile?: UploadedFile;
}

export function ImageUpload({
  canvas,
  onImageAdd,
  onUploadComplete,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileService = FileService.getInstance();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);

    // Initialize upload progress for each file
    const initialUploads: UploadProgress[] = files.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploads(initialUploads);

    const uploadPromises = files.map(async (file, index) => {
      try {
        // Validate file
        const validation = fileService.validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Get image dimensions for quality check
        const dimensions = await fileService.getImageDimensions(file);
        if (dimensions.width < 100 || dimensions.height < 100) {
          toast.error(
            `${file.name}: Image too small. Minimum 100x100 pixels required.`
          );
        }

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((upload, i) =>
              i === index && upload.status === "uploading"
                ? { ...upload, progress: Math.min(upload.progress + 10, 90) }
                : upload
            )
          );
        }, 100);

        // Upload file
        const uploadedFile = await fileService.uploadFile(file);

        clearInterval(progressInterval);

        // Update upload status
        setUploads((prev) =>
          prev.map((upload, i) =>
            i === index
              ? {
                  ...upload,
                  progress: 100,
                  status: "completed" as const,
                  uploadedFile,
                }
              : upload
          )
        );

        return uploadedFile;
      } catch (error) {
        setUploads((prev) =>
          prev.map((upload, i) =>
            i === index
              ? {
                  ...upload,
                  status: "error" as const,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : upload
          )
        );

        toast.error(
          `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(
      (result): result is UploadedFile => result !== null
    );

    setIsUploading(false);

    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
      toast.success(
        `Successfully uploaded ${successfulUploads.length} image(s)`
      );
    }
  };

  const addImageToCanvas = (uploadedFile: UploadedFile) => {
    if (!canvas) return;

    fabric.Image.fromURL(
      uploadedFile.url,
      (img) => {
        // Scale image to fit design area
        const designArea = { width: 120, height: 160 };
        const scale = Math.min(
          designArea.width / img.width!,
          designArea.height / img.height!,
          1 // Don't scale up
        );

        img.set({
          left: 280, // Center in design area
          top: 250,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          evented: true,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();

        onImageAdd?.(img);
        toast.success("Image added to design");
      },
      {
        crossOrigin: "anonymous",
      }
    );
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllUploads = () => {
    setUploads([]);
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-gray-900">Upload Images</h3>

      {/* Drag and Drop Area */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-lg font-medium text-gray-900">
          Drop images here or click to upload
        </p>
        <p className="mb-4 text-sm text-gray-500">
          Supports JPEG, PNG, WebP, SVG up to 10MB
        </p>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mb-2"
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose Files
        </Button>

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Upload Progress</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllUploads}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          {uploads.map((upload, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {upload.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {upload.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {upload.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="truncate text-sm font-medium">
                    {upload.file.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {upload.status === "completed" && upload.uploadedFile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addImageToCanvas(upload.uploadedFile!)}
                    >
                      Add to Design
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpload(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {upload.status === "uploading" && (
                <Progress value={upload.progress} className="h-2" />
              )}

              {upload.status === "error" && upload.error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{upload.error}</AlertDescription>
                </Alert>
              )}

              {upload.status === "completed" && (
                <div className="mt-1 text-xs text-gray-500">
                  Upload completed successfully
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <h4 className="mb-2 font-medium text-blue-900">
          Tips for best results:
        </h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use high-resolution images (minimum 300 DPI for printing)</li>
          <li>• PNG files with transparent backgrounds work best</li>
          <li>• Images will be automatically scaled to fit the design area</li>
          <li>• Avoid images smaller than 100x100 pixels</li>
        </ul>
      </div>
    </div>
  );
}
