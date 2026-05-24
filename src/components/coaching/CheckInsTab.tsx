import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckIn, useCheckIns } from '@/hooks/useCheckIns';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { CheckInReview } from './CheckInReview';
import { formatDistanceToNow, format, addDays } from 'date-fns';
import {
  ClipboardCheck, Plus, Loader2, Clock, Check, Eye,
  Send, Calendar, MoreHorizontal, Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CheckInsTab() {
  const { checkIns, loading, createCheckIn, reviewCheckIn, deleteCheckIn } = useCheckIns();
  const { myAthletes } = useCoachingAssignments();
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedAthleteAssignment, setSelectedAthleteAssignment] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all');

  if (selectedCheckIn) {
    return (
      <CheckInReview
        checkIn={selectedCheckIn}
        onReview={async (id, response) => {
          await reviewCheckIn(id, response);
          setSelectedCheckIn(null);
        }}
        onBack={() => setSelectedCheckIn(null)}
      />
    );
  }

  const handleCreate = async () => {
    if (!selectedAthleteAssignment) return;
    const assignment = myAthletes.find(a => a.id === selectedAthleteAssignment);
    if (!assignment) return;

    setCreating(true);
    const dueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    await createCheckIn(assignment.id, assignment.coach_id, assignment.athlete_id, dueDate);
    setCreating(false);
    setSelectedAthleteAssignment('');
  };

  const filtered = filter === 'all' ? checkIns : checkIns.filter(c => c.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5 text-[#FF5500]" />;
      case 'submitted': return <Send className="w-3.5 h-3.5 text-[#FF5500]" />;
      case 'reviewed': return <Check className="w-3.5 h-3.5 text-[#FF5500]" />;
      default: return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: string) => {
    const styles = {
      pending: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
      submitted: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
      reviewed: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
      skipped: 'text-muted-foreground bg-muted border-border',
    }[status] || '';
    return <Badge className={`font-display text-[9px] tracking-wider border ${styles}`}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Create check-in */}
      {myAthletes.length > 0 && (
        <Card className="border-border border-border bg-card">
          <CardContent className="p-3">
            <p className="font-display text-xs tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-primary" /> SEND CHECK-IN
            </p>
            <div className="flex gap-2">
              <Select value={selectedAthleteAssignment} onValueChange={setSelectedAthleteAssignment}>
                <SelectTrigger className="flex-1 text-xs">
                  <SelectValue placeholder="Select athlete..." />
                </SelectTrigger>
                <SelectContent>
                  {myAthletes.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.athlete_profile?.display_name || a.athlete_profile?.username || 'Athlete'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleCreate}
                disabled={!selectedAthleteAssignment || creating}
                className="font-display text-xs tracking-wide shrink-0"
                size="sm"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                SEND
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-1.5">
        {(['all', 'submitted', 'pending', 'reviewed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded text-[10px] font-display tracking-wider transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'ALL' : f.toUpperCase()}
            {f !== 'all' && (
              <span className="ml-1">({checkIns.filter(c => c.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Check-in list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border border-border bg-card">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No check-ins yet</p>
            <p className="text-xs text-muted-foreground mt-1">Send a check-in to one of your athletes above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(checkIn => (
            <Card
              key={checkIn.id}
              className="border-border hover:border-primary/20 transition-colors cursor-pointer"
              onClick={() => setSelectedCheckIn(checkIn)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={checkIn.athlete_profile?.avatar_url || undefined} />
                        <AvatarFallback className="font-display text-sm">
                          {(checkIn.athlete_profile?.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {statusIcon(checkIn.status)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm tracking-wide text-foreground truncate">
                          {checkIn.athlete_profile?.display_name || 'Athlete'}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-display">
                          #{checkIn.check_in_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {checkIn.submitted_at
                          ? `Submitted ${formatDistanceToNow(new Date(checkIn.submitted_at), { addSuffix: true })}`
                          : checkIn.due_date
                          ? `Due ${format(new Date(checkIn.due_date), 'MMM d')}`
                          : `Created ${formatDistanceToNow(new Date(checkIn.created_at), { addSuffix: true })}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusBadge(checkIn.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedCheckIn(checkIn); }}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); deleteCheckIn(checkIn.id); }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
