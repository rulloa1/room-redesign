import { Paintbrush, Frame, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface RoomCustomizationOptions {
  wallColor: string;
  wallColorCustom: string;
  trimStyle: string;
  trimColor: string;
  additionalDetails: string;
}

interface RoomCustomizationsProps {
  value: RoomCustomizationOptions;
  onChange: (options: RoomCustomizationOptions) => void;
  suggestedColor?: string;
}

const wallColorOptions = [
  { value: "keep", label: "Keep Original" },
  { value: "white", label: "Classic White" },
  { value: "off-white", label: "Warm Off-White / Cream" },
  { value: "light-gray", label: "Light Gray" },
  { value: "greige", label: "Greige (Gray-Beige)" },
  { value: "navy", label: "Navy Blue" },
  { value: "sage", label: "Sage Green" },
  { value: "terracotta", label: "Terracotta" },
  { value: "charcoal", label: "Charcoal" },
  { value: "blush", label: "Blush Pink" },
  { value: "accent-wall", label: "Accent Wall" },
  { value: "custom", label: "Custom Color..." },
];

const trimStyleOptions = [
  { value: "keep", label: "Keep Original" },
  { value: "none", label: "No Trim / Minimal" },
  { value: "simple", label: "Simple Baseboards" },
  { value: "classic", label: "Classic Crown Molding" },
  { value: "wainscoting", label: "Wainscoting" },
  { value: "shiplap", label: "Shiplap" },
  { value: "board-batten", label: "Board and Batten" },
  { value: "picture-rail", label: "Picture Rail Molding" },
  { value: "coffered", label: "Coffered Ceiling Trim" },
];

const trimColorOptions = [
  { value: "white", label: "Bright White" },
  { value: "match", label: "Match Wall Color" },
  { value: "contrast", label: "Contrasting Dark" },
  { value: "wood", label: "Natural Wood" },
  { value: "black", label: "Black" },
];

export const RoomCustomizations = ({ value, onChange, suggestedColor }: RoomCustomizationsProps) => {
  const updateOption = <K extends keyof RoomCustomizationOptions>(
    key: K,
    newValue: RoomCustomizationOptions[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  // If there's a suggested color and wall color is still default, show it
  const showSuggestedColor = suggestedColor && value.wallColor === "keep";

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="customizations" className="border-border">
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="w-4 h-4 text-primary" />
            Customize Details (Optional)
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Suggested Color Alert */}
          {showSuggestedColor && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground mb-2">
                <span className="font-medium">AI Suggested Color:</span> {suggestedColor}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateOption("wallColor", "custom");
                  updateOption("wallColorCustom", suggestedColor);
                }}
                className="text-xs"
              >
                Apply "{suggestedColor}"
              </Button>
            </div>
          )}

          {/* Wall Color */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Paintbrush className="w-4 h-4 text-muted-foreground" />
              Wall Color
            </Label>
            <Select
              value={value.wallColor}
              onValueChange={(v) => updateOption("wallColor", v)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose wall color preference" />
              </SelectTrigger>
              <SelectContent>
                {wallColorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value.wallColor === "custom" && (
              <Input
                placeholder="Describe your desired wall color (e.g., 'Benjamin Moore Simply White')"
                value={value.wallColorCustom}
                onChange={(e) => updateOption("wallColorCustom", e.target.value)}
                className="bg-background"
              />
            )}
          </div>

          {/* Trim Style */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Frame className="w-4 h-4 text-muted-foreground" />
              Trim & Molding Style
            </Label>
            <Select
              value={value.trimStyle}
              onValueChange={(v) => updateOption("trimStyle", v)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose trim style" />
              </SelectTrigger>
              <SelectContent>
                {trimStyleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trim Color - only show if trim style is not 'keep' or 'none' */}
          {value.trimStyle && !["keep", "none"].includes(value.trimStyle) && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Trim Color</Label>
              <Select
                value={value.trimColor}
                onValueChange={(v) => updateOption("trimColor", v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose trim color" />
                </SelectTrigger>
                <SelectContent>
                  {trimColorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Details */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Details / Requests</Label>
            <Textarea
              placeholder="Any specific requests? (e.g., 'Add recessed lighting', 'Include built-in shelving', 'Make it feel more spacious')"
              value={value.additionalDetails}
              onChange={(e) => updateOption("additionalDetails", e.target.value)}
              className="bg-background min-h-[80px] resize-none"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const getDefaultCustomizations = (): RoomCustomizationOptions => ({
  wallColor: "keep",
  wallColorCustom: "",
  trimStyle: "keep",
  trimColor: "white",
  additionalDetails: "",
});
