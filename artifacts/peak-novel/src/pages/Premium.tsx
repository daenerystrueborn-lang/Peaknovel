import { useGetPremiumPlans, useCreateCheckout } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, CheckCircle2, Zap, BookOpen, EyeOff, Bell, Star } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const PERKS = [
  { icon: BookOpen, label: "Unlock all premium chapters" },
  { icon: EyeOff, label: "Ad-free reading experience" },
  { icon: Zap, label: "Early access to new releases" },
  { icon: Bell, label: "Author update notifications" },
  { icon: Star, label: "Exclusive reader badge" },
  { icon: Crown, label: "Support your favorite authors" },
];

export default function Premium() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: plans = [], isLoading } = useGetPremiumPlans();
  const checkoutMutation = useCreateCheckout();

  const handleCheckout = (planId: string) => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to upgrade to Premium." });
      return;
    }
    checkoutMutation.mutate(
      { data: { planId } },
      {
        onSuccess: (data) => {
          if (data.url) window.location.href = data.url;
          else toast({ title: "Demo mode", description: "Stripe is not configured. This would redirect to checkout.", variant: "default" });
        },
        onError: () => toast({ title: "Error", description: "Could not start checkout.", variant: "destructive" }),
      }
    );
  };

  if (user?.isPremium) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mx-auto">
          <Crown className="w-12 h-12 text-yellow-500" />
        </div>
        <div>
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 mb-3">Active Premium</Badge>
          <h1 className="text-3xl font-bold">You're Premium!</h1>
          <p className="text-muted-foreground mt-2">Enjoy unlimited access to all premium content on PeakNovel.</p>
        </div>
        <Link href="/browse"><Button className="w-full max-w-xs">Start Reading</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-14">
      <div className="text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
          <Crown className="w-4 h-4 mr-1.5 inline" /> PeakNovel Premium
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold">Read Without Limits</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get unlimited access to all premium chapters, ad-free reading, and exclusive features.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
        {PERKS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center p-4 rounded-xl bg-muted/30 border border-border/50">
            <Icon className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map(plan => {
            const isYearly = plan.interval === "year";
            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all ${isYearly ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"}`}
              >
                {isYearly && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3">Best Value</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">${plan.price.toFixed(2)}</span>
                    <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                  </div>
                  {isYearly && (
                    <p className="text-xs text-green-500 font-medium">Save 33% vs monthly</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {(plan.features || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={isYearly ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? "Loading..." : `Get ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Cancel anytime. Secure payment via Stripe.
        {!isAuthenticated && (
          <> <Link href="/register" className="text-primary hover:underline">Sign up</Link> to get started.</>
        )}
      </p>
    </div>
  );
}
