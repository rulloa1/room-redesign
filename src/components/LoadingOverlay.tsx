import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
}

export const LoadingOverlay = ({
  isVisible,
  title = "Reimagining Your Space",
  description = "Our AI is working its magic to transform your room...",
}: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card shadow-strong animate-scale-in">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-muted animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
            style={{ animationDuration: "1s" }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-display font-medium text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
