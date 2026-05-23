import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

interface NutritionCoachCTAProps {
  context?: {
    type: 'food_log' | 'recipe' | 'meal_plan' | 'daily_summary' | 'barcode';
    itemId?: string;
    itemName?: string;
    data?: Record<string, any>;
  };
  variant?: 'button' | 'banner' | 'inline';
  label?: string;
}

export function NutritionCoachCTA({ 
  context, 
  variant = 'button',
  label = 'Ask Coach'
}: NutritionCoachCTAProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (context) {
      sessionStorage.setItem('coach_context', JSON.stringify({
        ...context,
        source: 'fuel',
      }));
    }
    navigate('/help');
  };

  if (variant === 'banner') {
    return (
      <Card className="border-2 border-primary/40 bg-primary/5 p-4 cursor-pointer hover:bg-primary/10 transition-all border-gray-800 bg-[#111]"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg tracking-wide text-foreground">
                {label}
              </p>
              <p className="text-sm text-muted-foreground">
                Get personalized nutrition guidance
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
      >
        <MessageSquare className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="gap-2 border-primary/50 hover:bg-primary/10"
    >
      <Sparkles className="w-4 h-4 text-primary" />
      {label}
    </Button>
  );
}

export function MealPlanCTA({ variant = 'button' }: { variant?: 'button' | 'banner' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    sessionStorage.setItem('coach_context', JSON.stringify({
      type: 'meal_plan_request',
      source: 'fuel',
    }));
    navigate('/help');
  };

  if (variant === 'banner') {
    return (
      <Card className="border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 p-4 cursor-pointer hover:from-primary/15 hover:to-primary/10 transition-all border-gray-800 bg-[#111]"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg tracking-wide text-foreground">
                BUILD WITH YOUR COACH
              </p>
              <p className="text-sm text-muted-foreground">
                Ask your coach to build a bespoke meal plan
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className="gap-2 font-display tracking-wide"
    >
      <Sparkles className="w-4 h-4" />
      BUILD WITH COACH
    </Button>
  );
}
