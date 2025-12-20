import { useState } from "react";
import { Palette, Sofa, Lightbulb, Home, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface RoomAnalysisData {
  roomType: string;
  currentStyle: string;
  colorPalette: {
    dominant: string;
    accent: string[];
    suggested: string[];
  };
  furniture: {
    detected: string[];
    suggestions: string[];
  };
  lighting: string;
  recommendations: string[];
}

interface RoomAnalysisProps {
  analysis: RoomAnalysisData | null;
  isLoading: boolean;
  onAnalyze: () => void;
  hasImage: boolean;
}

export const RoomAnalysis = ({ analysis, isLoading, onAnalyze, hasImage }: RoomAnalysisProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!hasImage) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-display font-medium text-foreground">
            Room Analysis
          </h3>
        </div>
        {!analysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Room
              </>
            )}
          </Button>
        )}
      </div>

      {!analysis && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Get AI-powered insights about your room including detected furniture, color palette, and design recommendations.
        </p>
      )}

      {analysis && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between mb-4">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                {analysis.roomType.charAt(0).toUpperCase() + analysis.roomType.slice(1)} • {analysis.currentStyle.charAt(0).toUpperCase() + analysis.currentStyle.slice(1)} Style
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6">
            {/* Color Palette */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Palette className="w-4 h-4 text-primary" />
                Color Palette
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Dominant:</span>
                  <Badge variant="secondary">{analysis.colorPalette.dominant}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Accents:</span>
                  {analysis.colorPalette.accent.map((color, i) => (
                    <Badge key={i} variant="outline">{color}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Suggested:</span>
                  {analysis.colorPalette.suggested.map((color, i) => (
                    <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{color}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Furniture */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sofa className="w-4 h-4 text-primary" />
                Furniture
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Detected:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {analysis.furniture.detected.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {analysis.furniture.suggestions.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-primary/30 text-primary">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lighting */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="w-4 h-4 text-primary" />
                Lighting
              </div>
              <p className="text-sm text-muted-foreground">{analysis.lighting}</p>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Design Recommendations
              </div>
              <ul className="space-y-1.5">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
