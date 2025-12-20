import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIErrorPanelProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export const AIErrorPanel = ({ onRetry, isRetrying }: AIErrorPanelProps) => {
  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-foreground font-display">
        AI Temporarily Unavailable
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-4">
        <p className="text-muted-foreground">
          The AI service has reached its usage limit. This is usually temporary and
          will resolve shortly.
        </p>
        
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
          <p className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            For App Owners
          </p>
          <p className="text-muted-foreground">
            Check your Lovable workspace settings to add AI usage credits:
            Settings → Workspace → Usage
          </p>
        </div>

        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying..." : "Try Again"}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
