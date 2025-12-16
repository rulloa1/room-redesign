import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for trying out RoomRevive",
    icon: Sparkles,
    iconColor: "text-muted-foreground",
    features: [
      { name: "3 redesigns (one-time)", included: true },
      { name: "Watermarked images", included: true },
      { name: "Standard styles", included: true },
      { name: "HD images", included: false },
      { name: "Premium styles", included: false },
      { name: "Priority processing", included: false },
    ],
    cta: "Current Plan",
    highlight: false,
    disabled: true,
  },
  {
    id: "basic",
    name: "Basic",
    price: "$14.99",
    period: "/month",
    description: "Great for home enthusiasts",
    icon: Zap,
    iconColor: "text-blue-400",
    features: [
      { name: "20 redesigns/month", included: true },
      { name: "No watermark", included: true },
      { name: "All design styles", included: true },
      { name: "HD images", included: true },
      { name: "Email support", included: true },
      { name: "Priority processing", included: false },
    ],
    cta: "Subscribe Now",
    highlight: false,
    disabled: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$24.99",
    period: "/month",
    description: "For professionals and power users",
    icon: Crown,
    iconColor: "text-amber-400",
    features: [
      { name: "Unlimited redesigns", included: true },
      { name: "No watermark", included: true },
      { name: "All design styles", included: true },
      { name: "HD images", included: true },
      { name: "Priority processing", included: true },
      { name: "Save & compare designs", included: true },
      { name: "Commercial use license", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Subscribe Now",
    highlight: true,
    disabled: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handleSubscribe = (plan: typeof plans[0]) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Integration Coming Soon",
      description: "Stripe payment will be connected shortly. Your subscription will be activated then.",
    });
    setCheckoutOpen(false);
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
          {user && (
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your living spaces with AI-powered redesigns. Pick the plan that fits your needs.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = credits?.tier === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 transition-all ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-xl scale-105"
                    : "border-border hover:border-primary/50 hover:shadow-lg"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className={`h-6 w-6 ${plan.iconColor}`} />
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/60"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={plan.disabled || isCurrentPlan}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isCurrentPlan ? "Current Plan" : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What happens to unused credits?</h3>
            <p className="text-muted-foreground">For the Basic plan, unused credits reset at the end of each billing cycle. Pro plan users have unlimited redesigns.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">We offer a 7-day money-back guarantee if you're not satisfied with your subscription.</p>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              {selectedPlan?.price}{selectedPlan?.period} - Enter your payment details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cardName">Name on Card</Label>
              <Input id="cardName" placeholder="John Doe" required />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="4242 4242 4242 4242" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" required />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" required />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Subscribe for {selectedPlan?.price}{selectedPlan?.period}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This is a placeholder. Stripe payment will be connected soon.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
