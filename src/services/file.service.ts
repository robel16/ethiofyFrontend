import { api } from "@/lib/api";

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadResponse {
  success: boolean;
  file: UploadedFile;
  message?: string;
}

export interface FilesResponse {
  success: boolean;
  files: UploadedFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class FileService {
  private static instance: FileService;

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  async uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<FileUploadResponse>(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "File upload failed");
    }

    return response.data.file;
  }

  async uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post<{
      success: boolean;
      files: UploadedFile[];
    }>("/files/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error("Multiple file upload failed");
    }

    return response.data.files;
  }

  async getUserFiles(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<FilesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await api.get<FilesResponse>(`/files/my-files?${params}`);
    return response.data;
  }

  async getFile(fileId: string): Promise<UploadedFile> {
    const response = await api.get<{ success: boolean; file: UploadedFile }>(
      `/files/${fileId}`
    );

    if (!response.data.success) {
      throw new Error("File not found");
    }

    return response.data.file;
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await api.delete<{ success: boolean; message?: string }>(
      `/files/${fileId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "File deletion failed");
    }
  }

  async generateSignedUrl(fileId: string, expiresIn = 3600): Promise<string> {
    const response = await api.get<{ success: boolean; signedUrl: string }>(
      `/files/${fileId}/signed-url?expiresIn=${expiresIn}`
    );

    if (!response.data.success) {
      throw new Error("Failed to generate signed URL");
    }

    return response.data.signedUrl;
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          "Invalid file type. Please upload JPEG, PNG, WebP, or SVG images.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size too large. Maximum size is 10MB.",
      };
    }

    return { valid: true };
  }

  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }
}
