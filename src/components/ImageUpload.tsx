import { useCallback, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  if (selectedImage) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-medium animate-scale-in">
        <img
          src={selectedImage}
          alt="Selected home"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClear}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-soft"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium text-foreground">
          Original Image
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="sr-only"
      />
      <div className="flex flex-col items-center gap-4 p-8">
        <div
          className={cn(
            "p-4 rounded-2xl transition-all duration-300",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}
        >
          {isDragging ? (
            <ImageIcon className="w-10 h-10 text-primary" />
          ) : (
            <Upload className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground font-display">
            {isDragging ? "Drop your image here" : "Upload a photo of your space"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-muted">JPG</span>
          <span className="px-2 py-1 rounded-md bg-muted">PNG</span>
          <span className="px-2 py-1 rounded-md bg-muted">WEBP</span>
        </div>
      </div>
    </label>
  );
};
