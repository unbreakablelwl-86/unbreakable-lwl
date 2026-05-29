import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, ExternalLink, Check, Loader2, AlertCircle, PoundSterling, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  stripeAccountId?: string | null;
  stripeOnboarded?: boolean;
}

export function CoachStripeConnect({ stripeAccountId, stripeOnboarded }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coach-stripe-connect', {
        body: { action: 'create_account' },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (err) {
      console.error('Stripe Connect error:', err);
      toast.error('Failed to start Stripe setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coach-stripe-connect', {
        body: { action: 'dashboard_link' },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to open Stripe dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (stripeOnboarded) {
    return (
      <Card className="border-emerald-500/20 bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm tracking-wide text-foreground">STRIPE CONNECTED</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Payments go directly to your account. 100% of coaching earnings are yours.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDashboard} disabled={loading} className="shrink-0 gap-1 text-xs">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stripeAccountId && !stripeOnboarded) {
    return (
      <Card className="border-amber-500/20 bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm tracking-wide text-foreground">STRIPE SETUP INCOMPLETE</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete your Stripe onboarding to start receiving payments.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={loading} className="shrink-0 bg-primary hover:bg-primary/80 gap-1 text-xs font-display tracking-wider">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
              Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardContent className="p-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
            <PoundSterling className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-display text-lg tracking-wide mb-1">CONNECT YOUR STRIPE</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
            Link your Stripe account to receive coaching payments directly. You keep 100% of your PT earnings, all payments in £. Unbreakable never touches your coaching fees.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-[9px] font-display tracking-wide border-emerald-500/20 text-emerald-500 gap-1">
              <Shield className="w-3 h-3" /> 100% YOUR EARNINGS
            </Badge>
            <Badge variant="outline" className="text-[9px] font-display tracking-wide border-primary/20 text-primary gap-1">
              <PoundSterling className="w-3 h-3" /> GBP PAYMENTS
            </Badge>
            <Badge variant="outline" className="text-[9px] font-display tracking-wide border-primary/20 text-primary gap-1">
              <CreditCard className="w-3 h-3" /> INSTANT PAYOUTS
            </Badge>
          </div>
          <Button onClick={handleConnect} disabled={loading} className="bg-primary hover:bg-primary/80 font-display tracking-wider gap-2 px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            CONNECT STRIPE ACCOUNT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
