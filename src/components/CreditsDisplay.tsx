import { Sparkles, Crown, Zap } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CreditsDisplay = () => {
  const { user } = useAuth();
  const { credits, loading } = useCredits();

  if (!user || loading) return null;

  const getTierIcon = () => {
    switch (credits?.tier) {
      case "pro":
        return <Crown className="h-4 w-4 text-amber-400" />;
      case "basic":
        return <Zap className="h-4 w-4 text-blue-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTierLabel = () => {
    switch (credits?.tier) {
      case "pro":
        return "Pro";
      case "basic":
        return "Basic";
      default:
        return "Free";
    }
  };

  const getCreditsText = () => {
    if (credits?.tier === "pro") {
      return "Unlimited";
    }
    return `${credits?.creditsRemaining ?? 0} credits`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
        {getTierIcon()}
        <span className="text-sm font-medium">{getTierLabel()}</span>
        <span className="text-sm text-muted-foreground">•</span>
        <span className="text-sm text-muted-foreground">{getCreditsText()}</span>
      </div>
      {credits?.tier === "free" && (
        <Button asChild size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10">
          <Link to="/pricing">Upgrade</Link>
        </Button>
      )}
    </div>
  );
};
