import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Every member gets their own referral code, which gives whoever uses it
 * the £50 rate instead of £75. The code is generated on first view and
 * mirrored into Stripe, so it discounts at checkout.
 */
export function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);
  const [timesUsed, setTimesUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-referral-promo');
        if (!cancelled && !error && data?.code) {
          setCode(data.code);
          setTimesUsed(data.timesUsed ?? 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast({ title: 'Code copied', description: 'Send it to whoever you like.' });
    } catch {
      toast({ title: "Couldn't copy", description: code, variant: 'destructive' });
    }
  };

  if (loading || !code) return null;

  return (
    <Card className="p-5 bg-card border-primary/30">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-display text-sm tracking-wider text-foreground">YOUR REFERRAL CODE</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Anyone who joins with your code pays{' '}
        <span className="text-primary font-semibold">£50</span> instead of{' '}
        <span className="line-through">£75</span> — for as long as they stay.
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-center">
          <span className="font-display tracking-[0.2em] text-lg text-primary">{code}</span>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy referral code">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {timesUsed === 0
          ? 'Not used yet — share it and get people showing up.'
          : `Used by ${timesUsed} ${timesUsed === 1 ? 'person' : 'people'}.`}
      </p>
    </Card>
  );
}
