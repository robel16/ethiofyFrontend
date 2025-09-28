"use client";

import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import {
  Search,
  Image as ImageIcon,
  Trash2,
  Plus,
  RefreshCw,
  Grid3X3,
  List,
} from "lucide-react";
import { FileService, UploadedFile } from "@/services/file.service";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ImageLibraryProps {
  canvas: fabric.Canvas | null;
  onImageAdd?: (image: fabric.Image) => void;
}

export function ImageLibrary({ canvas, onImageAdd }: ImageLibraryProps) {
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fileService = FileService.getInstance();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;

      const response = await fileService.getUserFiles(
        currentPage,
        20,
        searchTerm
      );

      if (reset) {
        setImages(response.files);
        setPage(1);
      } else {
        setImages((prev) => [...prev, ...response.files]);
      }

      setHasMore(currentPage < response.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to load images");
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    loadImages(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadImages();
    }
  };

  const addImageToCanvas = (image: UploadedFile) => {
    if (!canvas) return;

    fabric.Image.fromURL(
      image.url,
      (img) => {
        // Scale image to fit design area
        const designArea = { width: 120, height: 160 };
        const scale = Math.min(
          designArea.width / img.width!,
          designArea.height / img.height!,
          1
        );

        img.set({
          left: 280,
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

  const deleteImage = async (imageId: string) => {
    try {
      await fileService.deleteFile(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
      console.error("Error deleting image:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Images</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadImages(true)}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Images Grid/List */}
      {images.length === 0 ? (
        <div className="py-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4 text-gray-500">No images found</p>
          <p className="text-sm text-gray-400">
            Upload some images to get started
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-2"
          )}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                "overflow-hidden rounded-lg border transition-shadow hover:shadow-md",
                viewMode === "list" && "flex items-center p-2"
              )}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.originalName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="mb-1 truncate text-sm font-medium">
                      {image.originalName}
                    </p>
                    <p className="mb-2 text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => addImageToCanvas(image)}
                        className="flex-1"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteImage(image.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.originalName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="truncate text-sm font-medium">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => addImageToCanvas(image)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
