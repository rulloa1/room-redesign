import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Home, ArrowRight, FolderOpen, LayoutDashboard, Hammer, ExternalLink, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { StyleSelector } from "@/components/StyleSelector";
import { BeforeAfter } from "@/components/BeforeAfter";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ShopThisLook } from "@/components/ShopThisLook";
import { PostRedesignCustomization } from "@/components/PostRedesignCustomization";
import { RoomCustomizationOptions } from "@/components/RoomCustomizations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionErrorMessage } from "@/lib/getEdgeFunctionErrorMessage";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useRedesignHistory } from "@/hooks/useRedesignHistory";
import { downloadImage, generateFilename } from "@/lib/downloadImage";
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
  const { saveRedesign, updateFavorite } = useRedesignHistory();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [redesignedImage, setRedesignedImage] = useState<string | null>(null);
  const [currentRedesignId, setCurrentRedesignId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
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
    setCurrentRedesignId(null);
    setIsFavorite(false);
  }, []);

  const handlePremiumStyleClick = (styleName: string) => {
    setPremiumFeatureName(styleName);
    setUpgradeReason("premium-style");
    setUpgradeModalOpen(true);
  };

  const performRedesign = async (
    image: string,
    style: string,
    customizations?: RoomCustomizationOptions
  ) => {
    const { data, error, response } = await supabase.functions.invoke("redesign-room", {
      body: {
        image,
        style,
        customizations,
      },
    });

    if (error) {
      console.error("Error calling redesign function:", error);
      const parsed = await getEdgeFunctionErrorMessage(error, response);
      throw new Error(parsed.message || "Failed to redesign room");
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    if (!data.redesignedImage) {
      throw new Error("No image was returned");
    }

    return data.redesignedImage;
  };

  const handleRedesign = useCallback(async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!user) {
      toast.error("Please sign in to use redesign credits");
      navigate("/auth");
      return;
    }

    if (credits && credits.tier !== "pro" && credits.creditsRemaining <= 0) {
      setUpgradeReason("no-credits");
      setUpgradeModalOpen(true);
      return;
    }

    const canProceed = await useCredit();
    if (!canProceed) {
      setUpgradeReason("no-credits");
      setUpgradeModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const redesignedImageUrl = await performRedesign(selectedImage, selectedStyle);
      setRedesignedImage(redesignedImageUrl);
      toast.success(`Your ${styleNames[selectedStyle]} redesign is ready!`);

      const redesignId = await saveRedesign(
        selectedImage,
        redesignedImageUrl,
        selectedStyle,
        {},
        false
      );
      setCurrentRedesignId(redesignId);
      setIsFavorite(false);

      await refreshCredits();
    } catch (error) {
      console.error("Redesign error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to redesign. Please try again.");
      await refreshCredits();
    } finally {
      setIsLoading(false);
    }
  }, [selectedImage, selectedStyle, user, credits, useCredit, refreshCredits, navigate, saveRedesign]);

  const handleRefine = useCallback(
    async (customizations: RoomCustomizationOptions) => {
      if (!selectedImage || !redesignedImage) return;

      if (!user) {
        toast.error("Please sign in to refine your redesign");
        navigate("/auth");
        return;
      }

      if (credits && credits.tier !== "pro" && credits.creditsRemaining <= 0) {
        setUpgradeReason("no-credits");
        setUpgradeModalOpen(true);
        return;
      }

      const canProceed = await useCredit();
      if (!canProceed) {
        setUpgradeReason("no-credits");
        setUpgradeModalOpen(true);
        return;
      }

      setIsRefining(true);

      try {
        const refinedImageUrl = await performRedesign(
          selectedImage,
          selectedStyle,
          customizations
        );
        setRedesignedImage(refinedImageUrl);
        toast.success("Your customizations have been applied!");

        const redesignId = await saveRedesign(
          selectedImage,
          refinedImageUrl,
          selectedStyle,
          customizations as unknown as Record<string, unknown>,
          isFavorite
        );
        setCurrentRedesignId(redesignId);

        await refreshCredits();
      } catch (error) {
        console.error("Refinement error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to apply customizations. Please try again."
        );
        await refreshCredits();
      } finally {
        setIsRefining(false);
      }
    },
    [selectedImage, redesignedImage, selectedStyle, user, credits, useCredit, refreshCredits, navigate, saveRedesign, isFavorite]
  );

  const handleDownload = useCallback(async () => {
    if (!redesignedImage) return;
    try {
      await downloadImage(redesignedImage, generateFilename(styleNames[selectedStyle], "redesign"));
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  }, [redesignedImage, selectedStyle]);

  const handleSaveFavorite = useCallback(
    async (favorite: boolean) => {
      if (!currentRedesignId) return;
      setIsFavorite(favorite);
      await updateFavorite(currentRedesignId, favorite);
    },
    [currentRedesignId, updateFavorite]
  );

  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <LoadingOverlay
        isVisible={isLoading || isRefining}
        title={isRefining ? "Applying Your Customizations" : "Reimagining Your Space"}
        description={
          isRefining
            ? "Refining the design with your wall colors and trim preferences..."
            : "Our AI is working its magic to transform your room..."
        }
      />
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        reason={upgradeReason}
        featureName={premiumFeatureName}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between" aria-label="Main navigation">
          <a href="/" className="flex items-center gap-2" aria-label="RoomRevive Home">
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-lg font-display font-semibold text-foreground">
              RoomRevive
            </span>
          </a>
          <div className="flex items-center gap-3">
            {user && <CreditsDisplay />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(user ? "/portfolio" : "/auth")}
              aria-label="View portfolio"
            >
              <FolderOpen className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Portfolio</span>
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const historySection = document.getElementById("history-section");
                  if (historySection) {
                    historySection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                aria-label="View redesign history"
              >
                <History className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                aria-label="Go to dashboard"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} aria-label="Sign in to your account">
                Sign In
              </Button>
            )}
            <Button variant="hero" size="sm" onClick={scrollToUpload} aria-label="Start designing your room">
              Start Designing
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
      <article itemScope itemType="https://schema.org/WebPage">
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

                {/* Post-Redesign Customization */}
                <PostRedesignCustomization
                  originalImage={selectedImage}
                  redesignedImage={redesignedImage}
                  styleName={styleNames[selectedStyle]}
                  onRefine={handleRefine}
                  onDownload={handleDownload}
                  onSave={handleSaveFavorite}
                  isRefining={isRefining}
                  isFavorite={isFavorite}
                />

                {/* Shop This Look */}
                <ShopThisLook styleName={styleNames[selectedStyle]} />

                {/* Make It Real CTA */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 shadow-soft">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0 p-4 rounded-full bg-primary/10">
                      <Hammer className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                        Love This Design? Make It Real!
                      </h3>
                      <p className="text-muted-foreground">
                        Connect with our professional design partner to bring your AI-generated vision to life.
                        Get expert guidance on materials, furniture, and execution.
                      </p>
                    </div>
                    <a
                      href="https://www.mcdesign.bio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button variant="hero" size="lg" className="group">
                        Contact Designer
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      </article>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              RoomRevive © 2024
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <a 
              href="https://www.mcdesign.bio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Hire a Designer
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-sm text-muted-foreground">
              Powered by AI
            </p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
};

export default Index;
