import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, UserCheck, Clock, Eye, MessageSquare,
  Check, X, Loader2, UserPlus, UserCog,
  Dumbbell, Footprints, Utensils, Brain, MoreHorizontal,
  UserMinus, RotateCcw, Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useCoachingAssignments } from '@/hooks/useCoachingAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate, Link } from 'react-router-dom';
import { AthleteDataViewer } from '@/components/coaching/AthleteDataViewer';
import { ClientSearchPanel } from '@/components/coaching/ClientSearchPanel';
import { CheckInsTab } from '@/components/coaching/CheckInsTab';
import { CoachProfileEditor } from '@/components/coaching/CoachProfileEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const CoachDashboard = ({ embedded = false }: { embedded?: boolean }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { myAthletes, endedAthletes, pendingRequests, loading, updateStatus, removeAssignment } = useCoachingAssignments();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('athletes');
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const dashboardLabel = '121 COACHING';

  if (selectedAthleteId) {
    return (
      <AthleteDataViewer
        athleteId={selectedAthleteId}
        onBack={() => setSelectedAthleteId(null)}
      />
    );
  }

  const buildPlanOptions = [
    { label: 'Power Programme', icon: Dumbbell, path: '/programming/create' },
    { label: 'Movement Programme', icon: Footprints, path: '/tracker/create' },
    { label: 'Meal Plan', icon: Utensils, path: '/fuel/planning' },
    { label: 'Mindset Programme', icon: Brain, path: '/mindset' },
  ];

  const content = (
    <div className={embedded ? 'space-y-5' : 'container mx-auto px-4 py-6 max-w-3xl space-y-5'}>
      {!embedded && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-display text-xl tracking-wide text-foreground">
              {dashboardLabel} DASHBOARD
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage athletes and provide feedback
            </p>
          </div>
          <Badge variant="outline" className="font-display text-[10px] tracking-wider border-primary/30 text-primary">
            {role?.toUpperCase()}
          </Badge>
        </div>
      )}

      {/* Quick Actions Row */}
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-auto py-3 px-6 flex flex-col items-center gap-1.5 border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
              <Dumbbell className="w-5 h-5 text-primary" />
              <span className="font-display text-[11px] tracking-wide">BUILD MY OWN</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {buildPlanOptions.map(opt => (
              <DropdownMenuItem key={opt.path} onClick={() => navigate(opt.path)}>
                <opt.icon className="w-4 h-4 mr-2" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 text-center">
          <p className="font-display text-2xl text-primary">{myAthletes.length}</p>
          <p className="text-[10px] font-display tracking-wide text-muted-foreground mt-0.5">ATHLETES</p>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 text-center">
          <p className="font-display text-2xl text-primary">{pendingRequests.length}</p>
          <p className="text-[10px] font-display tracking-wide text-muted-foreground mt-0.5">PENDING</p>
        </div>
        <Link to="/coach-profile-edit" className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 text-center hover:border-primary/30 transition-colors">
          <UserCog className="w-6 h-6 text-primary mx-auto" />
          <p className="text-[10px] font-display tracking-wide text-muted-foreground mt-0.5">MY PROFILE</p>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="athletes" className="font-display text-xs tracking-wide">
            <UserCheck className="w-4 h-4 mr-1" />
            ATHLETES
          </TabsTrigger>
          <TabsTrigger value="checkins" className="font-display text-xs tracking-wide">
            <Check className="w-4 h-4 mr-1" />
            CHECK-INS
          </TabsTrigger>
          <TabsTrigger value="clients" className="font-display text-xs tracking-wide">
            <UserPlus className="w-4 h-4 mr-1" />
            USERS
          </TabsTrigger>
          <TabsTrigger value="requests" className="font-display text-xs tracking-wide">
            <Clock className="w-4 h-4 mr-1" />
            REQUESTS
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="athletes" className="space-y-2 mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : myAthletes.length === 0 && !showDeactivated ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No athletes assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">Use the USERS tab to search and add athletes</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {myAthletes.map(assignment => (
                <Card key={assignment.id} className="border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={assignment.athlete_profile?.avatar_url || undefined} />
                          <AvatarFallback className="font-display text-sm">
                            {(assignment.athlete_profile?.display_name || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-display text-sm tracking-wide text-foreground truncate">
                            {assignment.athlete_profile?.display_name || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            @{assignment.athlete_profile?.username || 'unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedAthleteId(assignment.athlete_id)}
                          title="View athlete data"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/inbox?compose=1&to=${assignment.athlete_id}`)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/user/${assignment.athlete_id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateStatus(assignment.id, 'ended')}>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmRemoveId(assignment.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Show deactivated toggle */}
              {endedAthletes.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground font-display tracking-wide">SHOW DEACTIVATED ({endedAthletes.length})</span>
                  <Switch checked={showDeactivated} onCheckedChange={setShowDeactivated} />
                </div>
              )}

              {showDeactivated && endedAthletes.map(assignment => (
                <Card key={assignment.id} className="border-border opacity-60">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={assignment.athlete_profile?.avatar_url || undefined} />
                          <AvatarFallback className="font-display text-sm">
                            {(assignment.athlete_profile?.display_name || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-display text-sm tracking-wide text-foreground truncate">
                            {assignment.athlete_profile?.display_name || 'Unknown'}
                          </p>
                          <Badge variant="outline" className="text-[9px]">DEACTIVATED</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateStatus(assignment.id, 'active')}>
                          <RotateCcw className="w-3 h-3 mr-1" /> Reactivate
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmRemoveId(assignment.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="checkins" className="mt-4">
          <CheckInsTab />
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <ClientSearchPanel />
        </TabsContent>

        <TabsContent value="requests" className="space-y-2 mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(request => (
              <Card key={request.id} className="border-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={request.athlete_profile?.avatar_url || undefined} />
                        <AvatarFallback className="font-display text-sm">
                          {(request.athlete_profile?.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-display text-sm tracking-wide text-foreground truncate">
                          {request.athlete_profile?.display_name || 'Unknown'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Coaching request</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(request.id, 'active')}
                        className="font-display text-[11px] h-8 px-3"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        ACCEPT
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(request.id, 'declined')}
                        className="font-display text-[11px] h-8 px-3 text-muted-foreground"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        DECLINE
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (embedded) return (
    <>
      {content}
      <AlertDialog open={!!confirmRemoveId} onOpenChange={() => setConfirmRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove Athlete</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the athlete from your coaching hub. Their account and data remain intact — they simply won't appear in your athlete list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmRemoveId) { removeAssignment(confirmRemoveId); setConfirmRemoveId(null); } }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader sectionLabel="121 COACHING" />
      <main>{content}</main>
      <AlertDialog open={!!confirmRemoveId} onOpenChange={() => setConfirmRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove Athlete</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the athlete from your coaching hub. Their account and data remain intact — they simply won't appear in your athlete list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmRemoveId) { removeAssignment(confirmRemoveId); setConfirmRemoveId(null); } }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CoachDashboard;
