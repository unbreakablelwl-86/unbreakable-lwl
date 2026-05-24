import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, UserCheck, Clock, Eye, MessageSquare,
  Check, X, Loader2, UserPlus, UserCog,
  Dumbbell, Footprints, Utensils, Brain, MoreHorizontal,
  UserMinus, RotateCcw, Trash2, ArrowLeft, ChevronRight
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type Tab = 'athletes' | 'checkins' | 'clients' | 'requests';

const CoachDashboard = ({ embedded = false }: { embedded?: boolean }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { myAthletes, endedAthletes, pendingRequests, loading, updateStatus, removeAssignment } = useCoachingAssignments();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('athletes');
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

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

  const tabItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'athletes', label: 'ATHLETES', icon: UserCheck },
    { id: 'checkins', label: 'CHECK-INS', icon: Check },
    { id: 'clients', label: 'USERS', icon: UserPlus },
    { id: 'requests', label: 'REQUESTS', icon: Clock, badge: pendingRequests.length },
  ];

  const confirmDialog = (
    <AlertDialog open={!!confirmRemoveId} onOpenChange={() => setConfirmRemoveId(null)}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-white">Remove Athlete</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will remove the athlete from your coaching hub. Their account and data remain intact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-gray-300">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => { if (confirmRemoveId) { removeAssignment(confirmRemoveId); setConfirmRemoveId(null); } }}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const content = (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl border border-[#FF5500]/15 bg-card p-3 text-center">
          <p className="font-display text-2xl text-[#FF5500]">{myAthletes.length}</p>
          <p className="text-[10px] font-display tracking-wider text-gray-500 mt-0.5">ATHLETES</p>
        </div>
        <div className="rounded-xl border border-[#FF5500]/15 bg-card p-3 text-center">
          <p className="font-display text-2xl text-[#FF5500]">{pendingRequests.length}</p>
          <p className="text-[10px] font-display tracking-wider text-gray-500 mt-0.5">PENDING</p>
        </div>
        <Link to="/coach-profile-edit" className="rounded-xl border border-[#FF5500]/15 bg-card p-3 text-center hover:border-[#FF5500]/40 transition-colors">
          <UserCog className="w-6 h-6 text-[#FF5500] mx-auto" />
          <p className="text-[10px] font-display tracking-wider text-gray-500 mt-0.5">MY PROFILE</p>
        </Link>
      </div>

      {/* Command Centre CTA */}
      <Link to="/command-centre" className="block mb-4">
        <div className="rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 p-3 flex items-center justify-between hover:border-[#FF5500]/40 transition-colors">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#FF5500]" />
            <div>
              <p className="font-display text-xs tracking-wider text-white">COMMAND CENTRE</p>
              <p className="text-[10px] text-gray-500">Discord-style client messaging hub</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#FF5500]" />
        </div>
      </Link>

      {/* Build Plan Dropdown */}
      <div className="flex justify-center mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#FF5500]/20 bg-[#FF5500]/5 text-[#FF5500] font-display text-xs tracking-wider hover:border-[#FF5500]/40 transition-all">
              <Dumbbell className="w-4 h-4" />
              BUILD PROGRAMME
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-card border-border">
            {buildPlanOptions.map(opt => (
              <DropdownMenuItem key={opt.path} onClick={() => navigate(opt.path)} className="text-gray-300 hover:text-white focus:bg-[#FF5500]/10">
                <opt.icon className="w-4 h-4 mr-2 text-[#FF5500]" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {tabItems.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-display tracking-wider whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-[#FF5500] text-white'
                : 'border border-[#FF5500]/30 text-gray-400 hover:border-[#FF5500]/60'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge && t.badge > 0 ? (
              <span className="ml-1 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'athletes' && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5500]" />
            </div>
          ) : myAthletes.length === 0 && !showDeactivated ? (
            <div className="rounded-xl border border-border bg-card py-12 text-center">
              <Users className="w-10 h-10 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No athletes assigned yet</p>
              <p className="text-xs text-gray-600 mt-1">Use the USERS tab to search and add athletes</p>
            </div>
          ) : (
            <>
              {myAthletes.map(a => (
                <div key={a.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between hover:border-[#FF5500]/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0 border border-[#FF5500]/20">
                      <AvatarImage src={a.athlete_profile?.avatar_url || undefined} />
                      <AvatarFallback className="font-display text-sm bg-[#FF5500]/10 text-[#FF5500]">
                        {(a.athlete_profile?.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-display text-sm tracking-wide text-white truncate">
                        {a.athlete_profile?.display_name || 'Unknown'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        @{a.athlete_profile?.username || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                      onClick={() => setSelectedAthleteId(a.athlete_id)}
                      title="View athlete data"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => navigate(`/inbox?compose=1&to=${a.athlete_id}`)} className="text-gray-300 focus:bg-[#FF5500]/10">
                          <MessageSquare className="w-4 h-4 mr-2 text-[#FF5500]" /> Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/user/${a.athlete_id}`)} className="text-gray-300 focus:bg-[#FF5500]/10">
                          <Eye className="w-4 h-4 mr-2 text-[#FF5500]" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem onClick={() => updateStatus(a.id, 'ended')} className="text-gray-300 focus:bg-[#FF5500]/10">
                          <UserMinus className="w-4 h-4 mr-2" /> Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirmRemoveId(a.id)} className="text-[#FF5500] focus:bg-[#FF5500]/10">
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {endedAthletes.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-display tracking-wide">SHOW DEACTIVATED ({endedAthletes.length})</span>
                  <Switch checked={showDeactivated} onCheckedChange={setShowDeactivated} />
                </div>
              )}

              {showDeactivated && endedAthletes.map(a => (
                <div key={a.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={a.athlete_profile?.avatar_url || undefined} />
                      <AvatarFallback className="font-display text-sm">{(a.athlete_profile?.display_name || '?')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-display text-sm tracking-wide text-white truncate">{a.athlete_profile?.display_name || 'Unknown'}</p>
                      <span className="text-[9px] font-display tracking-wider text-gray-600 border border-border rounded px-1.5 py-0.5">DEACTIVATED</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateStatus(a.id, 'active')} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <RotateCcw className="w-3 h-3" /> Reactivate
                    </button>
                    <button onClick={() => setConfirmRemoveId(a.id)} className="p-1.5 rounded hover:bg-[#FF5500]/10 text-[#FF5500] transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'checkins' && <CheckInsTab />}
      {activeTab === 'clients' && <ClientSearchPanel />}

      {activeTab === 'requests' && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5500]" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-12 text-center">
              <Clock className="w-10 h-10 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No pending requests</p>
            </div>
          ) : (
            pendingRequests.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0 border border-[#FF5500]/20">
                    <AvatarImage src={r.athlete_profile?.avatar_url || undefined} />
                    <AvatarFallback className="font-display text-sm bg-[#FF5500]/10 text-[#FF5500]">
                      {(r.athlete_profile?.display_name || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-display text-sm tracking-wide text-white truncate">{r.athlete_profile?.display_name || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-500">Coaching request</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateStatus(r.id, 'active')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF5500] text-white font-display text-[11px] tracking-wider hover:bg-[#FF5500]/80 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> ACCEPT
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'declined')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-gray-400 font-display text-[11px] tracking-wider hover:border-gray-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> DECLINE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );

  if (embedded) return <>{content}{confirmDialog}</>;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
      </div>

      {/* Compact Hero */}
      <div className="relative px-4 pt-3 pb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,85,0,0.08), transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="font-display text-2xl tracking-wider text-center">
            <span className="text-[#FF5500]" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>121</span>
            <span className="text-white"> COACHING</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1 font-display tracking-wide">
            MANAGE ATHLETES & BUILD PROGRAMMES
          </p>
        </div>
      </div>

      <div className="px-4">
        {content}
      </div>
      {confirmDialog}
    </div>
  );
};

export default CoachDashboard;
