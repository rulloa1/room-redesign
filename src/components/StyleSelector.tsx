import { cn } from "@/lib/utils";
import { Check, Lock, Crown } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

interface Style {
  id: string;
  name: string;
  description: string;
  icon: string;
  premium?: boolean;
}

const styles: Style[] = [
  { id: "modern", name: "Modern", description: "Clean lines, minimal clutter", icon: "🏢" },
  { id: "scandinavian", name: "Scandinavian", description: "Light, airy, functional", icon: "🌿" },
  { id: "industrial", name: "Industrial", description: "Raw materials, urban edge", icon: "🏭" },
  { id: "bohemian", name: "Bohemian", description: "Eclectic, colorful, layered", icon: "🎨" },
  { id: "minimalist", name: "Minimalist", description: "Less is more, pure simplicity", icon: "◽" },
  { id: "traditional", name: "Traditional", description: "Classic, elegant, timeless", icon: "🏛️" },
  { id: "mid-century", name: "Mid-Century Modern", description: "Retro charm, organic curves", icon: "🪑" },
  { id: "coastal", name: "Coastal", description: "Beach vibes, relaxed feel", icon: "🌊" },
  { id: "farmhouse", name: "Farmhouse", description: "Rustic warmth, cozy charm", icon: "🏡" },
  { id: "modern-spa", name: "Modern Spa", description: "Serene, zen-inspired retreat", icon: "🧘", premium: true },
  { id: "art-deco", name: "Art Deco", description: "Bold geometry, glamorous", icon: "💎", premium: true },
  { id: "japanese", name: "Japanese", description: "Wabi-sabi, natural harmony", icon: "🎋", premium: true },
  { id: "mediterranean", name: "Mediterranean", description: "Warm tones, terracotta", icon: "🌅", premium: true },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
  onPremiumClick?: (styleName: string) => void;
}

export const StyleSelector = ({ selectedStyle, onStyleSelect, onPremiumClick }: StyleSelectorProps) => {
  const { credits } = useCredits();
  const isPaidUser = credits && credits.tier !== "free";

  const handleStyleClick = (style: Style) => {
    if (style.premium && !isPaidUser) {
      onPremiumClick?.(style.name);
    } else {
      onStyleSelect(style.id);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-display font-medium text-foreground mb-4">
        Choose a Style
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {styles.map((style) => {
          const isLocked = style.premium && !isPaidUser;
          const isSelected = selectedStyle === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style)}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 text-left",
                isSelected && !isLocked
                  ? "border-primary bg-primary/5 shadow-soft"
                  : isLocked
                  ? "border-border/50 bg-muted/30 opacity-75 hover:opacity-100"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              {/* Selected check */}
              {isSelected && !isLocked && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-primary">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              {/* Premium badge */}
              {style.premium && (
                <div className={cn(
                  "absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  isPaidUser 
                    ? "bg-amber-500/10 text-amber-500" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {isPaidUser ? (
                    <Crown className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  <span>PRO</span>
                </div>
              )}
              
              <span className="text-2xl mb-2">{style.icon}</span>
              <span className={cn(
                "font-medium",
                isLocked ? "text-muted-foreground" : "text-foreground"
              )}>
                {style.name}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {style.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
