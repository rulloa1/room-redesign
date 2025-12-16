import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Download } from "lucide-react";
import { Button } from "./ui/button";

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  styleName: string;
}

export const BeforeAfter = ({ beforeImage, afterImage, styleName }: BeforeAfterProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = afterImage;
    link.download = `redesigned-${styleName.toLowerCase()}.png`;
    link.click();
  };

  return (
    <div className="w-full space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-medium text-foreground">
          Your {styleName} Redesign
        </h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-strong cursor-ew-resize select-none"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Full) */}
        <img
          src={afterImage}
          alt="Redesigned"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: "none" }}
          />
        </div>
        
        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-background shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-background shadow-medium">
            <ArrowLeftRight className="w-5 h-5 text-foreground" />
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium text-foreground">
          Before
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-sm font-medium text-primary-foreground">
          After
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Drag the slider to compare before and after
      </p>
    </div>
  );
};
