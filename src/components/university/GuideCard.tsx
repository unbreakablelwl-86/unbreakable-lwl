import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Coins, Lock, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import type { GuideInfo } from '@/lib/university/guideData';
import { getGuideDownloadUrl } from '@/lib/university/guideData';

interface GuideCardProps {
  guide: GuideInfo;
  owned: boolean;
  index: number;
  onPurchased: () => void;
}

export function GuideCard({ guide, owned, index, onPurchased }: GuideCardProps) {
  const [loading, setLoading] = useState(false);
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const { isDev, isCoach } = useUserRole();
  const navigate = useNavigate();

  const hasAccess = owned || isDev || isCoach;

  const handlePurchase = async () => {
    if (balance !== null && balance < guide.coinCost) {
      toast.error(`You need ${guide.coinCost} tokens but only have ${balance}. Top up first!`);
      navigate('/ai-tokens');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-course-with-coins', {
        body: {
          courseKeys: [guide.key],
          coinCost: guide.coinCost,
          label: `Guide: ${guide.title}`,
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error === 'Not enough coins') {
          toast.error(`Not enough tokens — you have ${data.balance}, need ${data.required}`);
          navigate('/ai-tokens');
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.success) {
        toast.success(`Unlocked! ${data.coinsSpent} tokens spent. Downloading...`);
        refreshBalance();
        onPurchased();
        // Auto-download
        window.open(getGuideDownloadUrl(guide.fileName), '_blank');
      }
    } catch (err: any) {
      console.error('Guide purchase error:', err);
      toast.error('Failed to purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(getGuideDownloadUrl(guide.fileName), '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <Card className={`relative overflow-hidden border transition-all group ${
        hasAccess
          ? 'border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
          : 'border-border hover:border-primary/20 hover:shadow-lg'
      }`}>
        {/* Top accent */}
        <div className={`h-1 w-full ${hasAccess ? 'bg-primary' : 'bg-muted/30'}`} />

        <div className="p-5 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                hasAccess ? 'bg-primary/10' : 'bg-muted/30'
              }`}>
                {guide.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground">
                    GUIDE {guide.num}
                  </span>
                  {hasAccess && (
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary px-1.5 py-0">
                      <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> OWNED
                    </Badge>
                  )}
                </div>
                <h3 className="font-display text-sm sm:text-base tracking-wider text-foreground leading-tight">
                  {guide.title.toUpperCase()}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
              <FileText className="w-3.5 h-3.5" />
              <span>{guide.pages} pages</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-primary/80 font-display tracking-wide">{guide.subtitle}</p>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {guide.description}
          </p>

          {/* Action */}
          <div className="pt-1">
            {hasAccess ? (
              <Button
                size="sm"
                onClick={handleDownload}
                className="w-full font-display tracking-wide"
              >
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD PDF
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  disabled={loading}
                  className="flex-1 font-display tracking-wide"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Coins className="w-4 h-4 mr-2" />
                  )}
                  {guide.coinCost} TOKENS
                </Button>
                {balance !== null && balance < guide.coinCost && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/ai-tokens')}
                    className="font-display tracking-wide border-primary/30 text-primary"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    GET
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
