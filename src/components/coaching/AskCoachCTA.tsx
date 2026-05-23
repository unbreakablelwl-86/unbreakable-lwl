import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageSquare, ChevronRight } from 'lucide-react';

interface AskCoachCTAProps {
  /** Context to pass to the coach */
  context?: {
    type: 'session' | 'programme' | 'exercise' | 'progress';
    id?: string;
    name?: string;
    data?: Record<string, unknown>;
  };
  /** CTA text override */
  label?: string;
  /** Variant style */
  variant?: 'button' | 'card' | 'inline';
  /** Additional classes */
  className?: string;
}

export function AskCoachCTA({ 
  context, 
  label,
  variant = 'button',
  className = ''
}: AskCoachCTAProps) {
  const navigate = useNavigate();

  const getDefaultLabel = () => {
    switch (context?.type) {
      case 'session':
        return 'Get Feedback';
      case 'programme':
        return 'Ask Coach';
      case 'exercise':
        return 'Review with Coach';
      case 'progress':
        return 'Analyse Progress';
      default:
        return 'Ask Your Coach';
    }
  };

  const handleClick = () => {
    // Store context in sessionStorage for the coach to pick up
    if (context) {
      sessionStorage.setItem('coach_context', JSON.stringify(context));
    }
    navigate('/help');
  };

  if (variant === 'card') {
    return (
      <Card 
        className={`p-4 border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display text-foreground">{label || getDefaultLabel()}</h4>
              <p className="text-xs text-muted-foreground">
                {context?.name ? `About: ${context.name}` : 'Get expert coaching insights'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary" />
        </div>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors ${className}`}
      >
        <MessageSquare className="w-4 h-4" />
        {label || getDefaultLabel()}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`gap-2 border-primary/30 hover:bg-primary/10 ${className}`}
    >
      <Sparkles className="w-4 h-4 text-primary" />
      {label || getDefaultLabel()}
    </Button>
  );
}
