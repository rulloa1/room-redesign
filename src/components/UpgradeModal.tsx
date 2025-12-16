import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "no-credits" | "premium-style" | "premium-feature";
  featureName?: string;
}

const plans = [
  {
    name: "Basic",
    price: "$14.99",
    period: "/month",
    icon: Zap,
    iconColor: "text-blue-400",
    features: ["20 redesigns/month", "No watermark", "All design styles", "HD images"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$24.99",
    period: "/month",
    icon: Crown,
    iconColor: "text-amber-400",
    features: ["Unlimited redesigns", "Priority processing", "Save designs", "Compare options", "Commercial use"],
    highlight: true,
  },
];

export const UpgradeModal = ({ open, onOpenChange, reason = "no-credits", featureName }: UpgradeModalProps) => {
  const getMessage = () => {
    switch (reason) {
      case "no-credits":
        return "You've used all your free redesigns. Upgrade to continue transforming your spaces!";
      case "premium-style":
        return `The "${featureName}" style is available on paid plans. Upgrade to unlock all premium styles!`;
      case "premium-feature":
        return `"${featureName}" is a premium feature. Upgrade to access this and more!`;
      default:
        return "Upgrade to unlock more features!";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-4 rounded-xl border transition-all ${
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
                  <span className="font-semibold text-lg">{plan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe Later
          </Button>
          <Button asChild className="flex-1">
            <Link to="/pricing" onClick={() => onOpenChange(false)}>
              View All Plans
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
