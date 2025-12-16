import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SubscriptionTier = "free" | "basic" | "pro";

interface UserCredits {
  tier: SubscriptionTier;
  creditsRemaining: number;
  creditsMonthlyLimit: number;
  totalRedesigns: number;
  subscriptionStartedAt: string | null;
  subscriptionEndsAt: string | null;
}

interface CreditsContextType {
  credits: UserCredits | null;
  loading: boolean;
  useCredit: () => Promise<boolean>;
  refreshCredits: () => Promise<void>;
  canUseFeature: (feature: string) => boolean;
  isPremiumStyle: (styleId: string) => boolean;
}

const defaultCredits: UserCredits = {
  tier: "free",
  creditsRemaining: 0,
  creditsMonthlyLimit: 3,
  totalRedesigns: 0,
  subscriptionStartedAt: null,
  subscriptionEndsAt: null,
};

const premiumStyles = ["art-deco", "japanese", "mediterranean", "modern-spa"];

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching credits:", error);
        setCredits(defaultCredits);
      } else if (data) {
        setCredits({
          tier: data.tier as SubscriptionTier,
          creditsRemaining: data.credits_remaining,
          creditsMonthlyLimit: data.credits_monthly_limit,
          totalRedesigns: data.total_redesigns,
          subscriptionStartedAt: data.subscription_started_at,
          subscriptionEndsAt: data.subscription_ends_at,
        });
      } else {
        setCredits(defaultCredits);
      }
    } catch (err) {
      console.error("Error:", err);
      setCredits(defaultCredits);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const refreshCredits = async () => {
    await fetchCredits();
  };

  const useCredit = async (): Promise<boolean> => {
    if (!user || !credits) return false;

    // Pro users have unlimited
    if (credits.tier === "pro") {
      await refreshCredits();
      return true;
    }

    // Check if has credits
    if (credits.creditsRemaining <= 0) {
      return false;
    }

    // Optimistically update
    setCredits(prev => prev ? { ...prev, creditsRemaining: prev.creditsRemaining - 1 } : null);
    
    // The actual deduction happens in the edge function via RPC
    return true;
  };

  const canUseFeature = (feature: string): boolean => {
    if (!credits) return false;
    
    switch (feature) {
      case "hd-images":
      case "no-watermark":
        return credits.tier !== "free";
      case "save-designs":
      case "compare-options":
      case "commercial-use":
      case "priority-processing":
        return credits.tier === "pro";
      default:
        return true;
    }
  };

  const isPremiumStyle = (styleId: string): boolean => {
    return premiumStyles.includes(styleId);
  };

  return (
    <CreditsContext.Provider
      value={{
        credits,
        loading,
        useCredit,
        refreshCredits,
        canUseFeature,
        isPremiumStyle,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};
