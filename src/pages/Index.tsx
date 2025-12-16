import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Home, ArrowRight, FolderOpen, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { StyleSelector } from "@/components/StyleSelector";
import { BeforeAfter } from "@/components/BeforeAfter";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ShopThisLook } from "@/components/ShopThisLook";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import heroRoom from "@/assets/hero-room.jpg";

const styleNames: Record<string, string> = {
  modern: "Modern",
  "modern-spa": "Modern Spa",
  scandinavian: "Scandinavian",
  industrial: "Industrial",
  bohemian: "Bohemian",
  minimalist: "Minimalist",
  traditional: "Traditional",
  "mid-century": "Mid-Century Modern",
  coastal: "Coastal",
  farmhouse: "Farmhouse",
  "art-deco": "Art Deco",
  japanese: "Japanese",
  mediterranean: "Mediterranean",
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, useCredit, refreshCredits } = useCredits();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [isLoading, setIsLoading] = useState(false);
  const [redesignedImage, setRedesignedImage] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"no-credits" | "premium-style">("no-credits");
  const [premiumFeatureName, setPremiumFeatureName] = useState("");

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setRedesignedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearImage = useCallback(() => {
    setSelectedImage(null);
    setRedesignedImage(null);
  }, []);

  const handlePremiumStyleClick = (styleName: string) => {
    setPremiumFeatureName(styleName);
    setUpgradeReason("premium-style");
    setUpgradeModalOpen(true);
  };

  const handleRedesign = useCallback(async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to use redesign credits");
      navigate("/auth");
      return;
    }

    // Check credits
    if (credits && credits.tier !== "pro" && credits.creditsRemaining <= 0) {
      setUpgradeReason("no-credits");
      setUpgradeModalOpen(true);
      return;
    }

    // Use a credit
    const canProceed = await useCredit();
    if (!canProceed) {
      setUpgradeReason("no-credits");
      setUpgradeModalOpen(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("redesign-room", {
        body: {
          image: selectedImage,
          style: selectedStyle,
        },
      });

      if (error) {
        console.error("Error calling redesign function:", error);
        throw new Error(error.message || "Failed to redesign room");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.redesignedImage) {
        setRedesignedImage(data.redesignedImage);
        toast.success(`Your ${styleNames[selectedStyle]} redesign is ready!`);
        // Refresh credits to get updated count
        await refreshCredits();
      } else {
        throw new Error("No image was returned");
      }
    } catch (error) {
      console.error("Redesign error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to redesign. Please try again.");
      // Refresh credits in case of error
      await refreshCredits();
    } finally {
      setIsLoading(false);
    }
  }, [selectedImage, selectedStyle, user, credits, useCredit, refreshCredits, navigate]);

  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <LoadingOverlay isVisible={isLoading} />
      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
        reason={upgradeReason}
        featureName={premiumFeatureName}
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-display font-semibold text-foreground">
              RoomRevive
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && <CreditsDisplay />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(user ? "/portfolio" : "/auth")}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Portfolio
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
            <Button variant="hero" size="sm" onClick={scrollToUpload}>
              Start Designing
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Interior Design
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Transform Your Space in{" "}
                <span className="text-primary">Seconds</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Upload a photo of any room and watch as AI reimagines it in your
                favorite design style. From modern minimalism to cozy bohemian vibes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" onClick={scrollToUpload}>
                  Redesign Your Room
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  3 free redesigns
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  13 design styles
                </div>
              </div>
            </div>
            <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-strong animate-float">
                <img
                  src={heroRoom}
                  alt="Beautiful modern living room"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl bg-card shadow-medium border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">AI Enhanced</p>
                    <p className="text-xs text-muted-foreground">Modern Style</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Create Your Dream Space
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload a photo of your room, select your preferred style, and let our AI
              do the rest.
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1: Upload */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <h3 className="text-lg font-display font-medium text-foreground">
                  Upload Your Photo
                </h3>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClear={handleClearImage}
              />
            </div>

            {/* Step 2: Select Style */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h3 className="text-lg font-display font-medium text-foreground">
                  Pick Your Style
                </h3>
              </div>
              <StyleSelector
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
                onPremiumClick={handlePremiumStyleClick}
              />
            </div>

            {/* Redesign Button */}
            <div className="flex justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={handleRedesign}
                disabled={!selectedImage || isLoading}
                className="w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Redesign
                {credits && credits.tier !== "pro" && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-foreground/20 text-xs">
                    {credits.creditsRemaining} left
                  </span>
                )}
              </Button>
            </div>

            {/* Result */}
            {redesignedImage && selectedImage && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                  <BeforeAfter
                    beforeImage={selectedImage}
                    afterImage={redesignedImage}
                    styleName={styleNames[selectedStyle]}
                  />
                </div>
                
                {/* Shop This Look */}
                <ShopThisLook styleName={styleNames[selectedStyle]} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              RoomRevive © 2024
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <p className="text-sm text-muted-foreground">
              Powered by AI • Transform any space instantly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
