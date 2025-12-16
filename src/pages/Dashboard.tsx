import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Zap, Sparkles, TrendingUp, Image, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !credits) return null;

  const getTierIcon = () => {
    switch (credits.tier) {
      case "pro":
        return <Crown className="h-6 w-6 text-amber-400" />;
      case "basic":
        return <Zap className="h-6 w-6 text-blue-400" />;
      default:
        return <Sparkles className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getTierName = () => {
    switch (credits.tier) {
      case "pro":
        return "Pro";
      case "basic":
        return "Basic";
      default:
        return "Free";
    }
  };

  const getCreditsProgress = () => {
    if (credits.tier === "pro") return 100;
    return (credits.creditsRemaining / credits.creditsMonthlyLimit) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Plan */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Plan</CardDescription>
              <CardTitle className="flex items-center gap-2">
                {getTierIcon()}
                {getTierName()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {credits.tier === "free" ? (
                <Button asChild size="sm" className="w-full mt-2">
                  <Link to="/pricing">Upgrade Plan</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Manage Subscription
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Credits */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Credits Remaining</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {credits.tier === "pro" ? "Unlimited" : credits.creditsRemaining}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {credits.tier !== "pro" && (
                <>
                  <Progress value={getCreditsProgress()} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {credits.creditsRemaining} of {credits.creditsMonthlyLimit} credits
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Redesigns */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Redesigns</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-green-500" />
                {credits.totalRedesigns}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Member Since</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Welcome to RoomRevive!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump back into designing</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/">New Redesign</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portfolio">View Portfolio</Link>
            </Button>
            {credits.tier === "free" && (
              <Button asChild variant="outline" className="text-primary border-primary/30">
                <Link to="/pricing">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade for More
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
