import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useNavigate } from 'react-router-dom';

export function RequestCoachCard() {
  const navigate = useNavigate();
  const { myCoach } = useCoachingAssignments();

  // Only show if user has an active coach
  if (!myCoach) return null;

  return (
    <Card className="border-primary/30 border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={myCoach.coach_profile?.avatar_url || undefined} />
            <AvatarFallback className="font-display">
              {(myCoach.coach_profile?.display_name || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">YOUR COACH</p>
            <p className="font-display text-sm tracking-wide text-foreground">
              {myCoach.coach_profile?.display_name || 'Unknown'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/inbox?compose=1&to=${myCoach.coach_id}`)}
            className="font-display text-xs"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            MESSAGE
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
