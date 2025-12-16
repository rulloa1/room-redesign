import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Style {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const styles: Style[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines, minimal clutter",
    icon: "🏢",
  },
  {
    id: "modern-spa",
    name: "Modern Spa",
    description: "Serene, zen-inspired retreat",
    icon: "🧘",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Light, airy, functional",
    icon: "🌿",
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Raw materials, urban edge",
    icon: "🏭",
  },
  {
    id: "bohemian",
    name: "Bohemian",
    description: "Eclectic, colorful, layered",
    icon: "🎨",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Less is more, pure simplicity",
    icon: "◽",
  },
  {
    id: "traditional",
    name: "Traditional",
    description: "Classic, elegant, timeless",
    icon: "🏛️",
  },
  {
    id: "mid-century",
    name: "Mid-Century Modern",
    description: "Retro charm, organic curves",
    icon: "🪑",
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Beach vibes, relaxed feel",
    icon: "🌊",
  },
  {
    id: "farmhouse",
    name: "Farmhouse",
    description: "Rustic warmth, cozy charm",
    icon: "🏡",
  },
  {
    id: "art-deco",
    name: "Art Deco",
    description: "Bold geometry, glamorous",
    icon: "💎",
  },
  {
    id: "japanese",
    name: "Japanese",
    description: "Wabi-sabi, natural harmony",
    icon: "🎋",
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    description: "Warm tones, terracotta",
    icon: "🌅",
  },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export const StyleSelector = ({ selectedStyle, onStyleSelect }: StyleSelectorProps) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-display font-medium text-foreground mb-4">
        Choose a Style
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            className={cn(
              "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 text-left",
              selectedStyle === style.id
                ? "border-primary bg-primary/5 shadow-soft"
                : "border-border hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            {selectedStyle === style.id && (
              <div className="absolute top-3 right-3 p-1 rounded-full bg-primary">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <span className="text-2xl mb-2">{style.icon}</span>
            <span className="font-medium text-foreground">{style.name}</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {style.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
