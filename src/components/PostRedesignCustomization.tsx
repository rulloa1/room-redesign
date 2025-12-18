import { useState } from "react";
import { Paintbrush, Wand2, Download, Heart, Share2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomCustomizations, RoomCustomizationOptions, getDefaultCustomizations } from "@/components/RoomCustomizations";
import { toast } from "sonner";

interface PostRedesignCustomizationProps {
  originalImage: string;
  redesignedImage: string;
  styleName: string;
  onRefine: (customizations: RoomCustomizationOptions) => Promise<void>;
  onDownload: () => void;
  onSave: (isFavorite: boolean) => Promise<void>;
  isRefining: boolean;
  isFavorite: boolean;
}

export const PostRedesignCustomization = ({
  originalImage,
  redesignedImage,
  styleName,
  onRefine,
  onDownload,
  onSave,
  isRefining,
  isFavorite: initialIsFavorite,
}: PostRedesignCustomizationProps) => {
  const [customizations, setCustomizations] = useState<RoomCustomizationOptions>(
    getDefaultCustomizations()
  );
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showCustomizations, setShowCustomizations] = useState(false);

  const handleRefine = async () => {
    const hasCustomizations =
      customizations.wallColor !== "keep" ||
      customizations.trimStyle !== "keep" ||
      customizations.additionalDetails.trim() !== "";

    if (!hasCustomizations) {
      toast.info("Please select some customizations first");
      return;
    }

    await onRefine(customizations);
  };

  const handleToggleFavorite = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    await onSave(newFavoriteState);
    toast.success(newFavoriteState ? "Added to favorites" : "Removed from favorites");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${styleName} Room Redesign`,
          text: "Check out my room redesign created with RoomRevive AI!",
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-primary" />
              Customize Your Redesign
            </CardTitle>
            <CardDescription>
              Fine-tune wall colors, trim, and other details
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-red-500 border-red-500/50" : ""}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showCustomizations ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCustomizations(true)}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Customize Wall Colors & Trim
          </Button>
        ) : (
          <>
            <RoomCustomizations
              value={customizations}
              onChange={setCustomizations}
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="hero"
                onClick={handleRefine}
                disabled={isRefining}
                className="flex-1"
              >
                {isRefining ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Apply Customizations
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCustomizations(getDefaultCustomizations());
                  setShowCustomizations(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
