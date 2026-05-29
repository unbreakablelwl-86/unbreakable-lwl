import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, UserCheck, Clock, Eye, MessageSquare,
  Check, X, Loader2, UserPlus, UserCog,
  Dumbbell, Footprints, Utensils, Brain, MoreHorizontal,
  UserMinus, RotateCcw, Trash2, ArrowLeft, ChevronRight, Flame, Sparkles,
  Calendar, ChevronLeft, Plus, Zap
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
import { CoachStripeConnect } from '@/components/coaching/CoachStripeConnect';
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
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday as checkIsToday, getDay } from 'date-fns';

type Tab = 'athletes' | 'checkins' | 'calendar' | 'clients' | 'requests';

const CoachDashboard = ({ embedded = false }: { embedded?: boolean }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const { myAthletes, endedAthletes, pendingRequests, loading, updateStatus, removeAssignment } = useCoachingAssignments();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('athletes');
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  /* ── Calendar state ── */
  const [calMonth, setCalMonth] = useState(new Date());
  const [calBookings, setCalBookings] = useState<any[]>([]);
  const [calHabits, setCalHabits] = useState<any[]>([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calSelectedDay, setCalSelectedDay] = useState<Date | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);

  // Fetch calendar data when tab switches to calendar
  useEffect(() => {
    if (activeTab === 'calendar' && user) fetchCalendar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user, calMonth]);

  const fetchCalendar = async () => {
    if (!user) return;
    setCalLoading(true);
    const start = format(startOfMonth(calMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(calMonth), 'yyyy-MM-dd');
    try {
      const { data, error } = await (supabase as any).rpc('get_coach_calendar', {
        _coach_id: user.id, _start: start, _end: end
      });
      if (data && !error) {
        setCalBookings(data.bookings || []);
        setCalHabits(data.habits || []);
      }
    } catch (e) { console.error('Calendar fetch error:', e); }
    setCalLoading(false);
  };

  // Re-fetch when month changes (useEffect above handles it)
  const changeMonth = (dir: 'prev' | 'next') => {
    const newMonth = dir === 'prev' ? subMonths(calMonth, 1) : addMonths(calMonth, 1);
    setCalMonth(newMonth);
    setCalSelectedDay(null);
  };

  const handleAutoFillHabits = async () => {
    if (!user) return;
    setAutoFilling(true);
    try {
      const { data, error } = await (supabase as any).rpc('auto_fill_daily_habits', { _user_id: user.id });
      if (data?.success) {
        (await import('sonner')).toast.success('Daily habits auto-filled ✓');
        fetchCalendar();
      } else {
        (await import('sonner')).toast.error(data?.reason || 'Could not auto-fill');
      }
    } catch (e) { (await import('sonner')).toast.error('Auto-fill failed'); }
    setAutoFilling(false);
  };

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
    { id: 'calendar', label: 'CALENDAR', icon: Calendar },
    { id: 'clients', label: 'USERS', icon: UserPlus },
    { id: 'requests', label: 'REQUESTS', icon: Clock, badge: pendingRequests.length },
  ];

  const confirmDialog = (
    <AlertDialog open={!!confirmRemoveId} onOpenChange={() => setConfirmRemoveId(null)}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-foreground">Remove Athlete</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will remove the athlete from your coaching hub. Their account and data remain intact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-muted-foreground">Cancel</AlertDialogCancel>
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
      {/* Quick Stats — glowing cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card p-3.5 text-center"
          style={{ boxShadow: '0 0 20px rgba(255,85,0,0.06)' }}
        >
          <p className="font-display text-2xl text-primary" style={{ textShadow: '0 0 12px rgba(255,85,0,0.3)' }}>{myAthletes.length}</p>
          <p className="text-[10px] font-display tracking-wider text-muted-foreground mt-0.5">ATHLETES</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card p-3.5 text-center"
          style={{ boxShadow: '0 0 20px rgba(255,85,0,0.06)' }}
        >
          <p className="font-display text-2xl text-primary" style={{ textShadow: '0 0 12px rgba(255,85,0,0.3)' }}>{pendingRequests.length}</p>
          <p className="text-[10px] font-display tracking-wider text-muted-foreground mt-0.5">PENDING</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to="/coach-profile-edit" className="block rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card p-3.5 text-center hover:border-primary/40 transition-all" style={{ boxShadow: '0 0 20px rgba(255,85,0,0.06)' }}>
            <UserCog className="w-6 h-6 text-primary mx-auto" />
            <p className="text-[10px] font-display tracking-wider text-muted-foreground mt-0.5">MY PROFILE</p>
          </Link>
        </motion.div>
      </div>

      {/* Command Centre + Build Programme — side by side */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Link to="/command-centre" className="block">
            <div className="rounded-xl border border-primary/20 bg-card p-3.5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[11px] tracking-wider text-foreground">COMMAND</p>
                  <p className="font-display text-[11px] tracking-wider text-foreground">CENTRE</p>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">Discord-style client messaging</p>
            </div>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full text-left rounded-xl border border-primary/20 bg-card p-3.5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[11px] tracking-wider text-foreground">BUILD</p>
                    <p className="font-display text-[11px] tracking-wider text-foreground">PROGRAMME</p>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">Power · Movement · Fuel · Mind</p>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="bg-card border-border">
              {buildPlanOptions.map(opt => (
                <DropdownMenuItem key={opt.path} onClick={() => navigate(opt.path)} className="text-muted-foreground hover:text-white focus:bg-primary/10">
                  <opt.icon className="w-4 h-4 mr-2 text-primary" />
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>

      {/* Tab bar — animated pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {tabItems.map((t, i) => {
          const isActive = activeTab === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-display tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary/15 border border-primary/40 text-primary'
                  : 'border border-border bg-card/50 text-muted-foreground hover:border-primary/20'
              }`}
              style={isActive ? { boxShadow: '0 0 12px rgba(255,85,0,0.12)' } : undefined}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.badge && t.badge > 0 ? (
                <span className="ml-0.5 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {t.badge}
                </span>
              ) : null}
              {isActive && (
                <motion.div
                  layoutId="coachTabDot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content — animated transitions */}
      <AnimatePresence mode="wait">
        {activeTab === 'athletes' && (
          <motion.div key="athletes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : myAthletes.length === 0 && !showDeactivated ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card py-12 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm font-display tracking-wide">NO ATHLETES YET</p>
                <p className="text-xs text-muted-foreground mt-1">Use the USERS tab to search and add athletes</p>
              </motion.div>
            ) : (
              <>
                {myAthletes.map((a, idx) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="rounded-xl border border-border bg-card p-3 flex items-center justify-between hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarImage src={a.athlete_profile?.avatar_url || undefined} />
                        <AvatarFallback className="font-display text-sm bg-primary/10 text-primary">
                          {(a.athlete_profile?.display_name || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-display text-sm tracking-wide text-foreground truncate">
                          {a.athlete_profile?.display_name || 'Unknown'}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{a.athlete_profile?.username || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setSelectedAthleteId(a.athlete_id)}
                        title="View athlete data"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => navigate(`/inbox?compose=1&to=${a.athlete_id}`)} className="text-muted-foreground focus:bg-primary/10">
                            <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/user/${a.athlete_id}`)} className="text-muted-foreground focus:bg-primary/10">
                            <Eye className="w-4 h-4 mr-2 text-primary" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-card" />
                          <DropdownMenuItem onClick={() => updateStatus(a.id, 'ended')} className="text-muted-foreground focus:bg-primary/10">
                            <UserMinus className="w-4 h-4 mr-2" /> Deactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmRemoveId(a.id)} className="text-primary focus:bg-primary/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}

                {endedAthletes.length > 0 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground font-display tracking-wide">SHOW DEACTIVATED ({endedAthletes.length})</span>
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
                        <p className="font-display text-sm tracking-wide text-foreground truncate">{a.athlete_profile?.display_name || 'Unknown'}</p>
                        <span className="text-[9px] font-display tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">DEACTIVATED</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateStatus(a.id, 'active')} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        <RotateCcw className="w-3 h-3" /> Reactivate
                      </button>
                      <button onClick={() => setConfirmRemoveId(a.id)} className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'checkins' && (
          <motion.div key="checkins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CheckInsTab />
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Month Header */}
            <div className="flex items-center justify-between">
              <button onClick={() => changeMonth('prev')} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display text-lg tracking-wider text-foreground">{format(calMonth, 'MMMM yyyy').toUpperCase()}</h3>
              <button onClick={() => changeMonth('next')} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-display tracking-wider text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            {calLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const monthStart = startOfMonth(calMonth);
                  const monthEnd = endOfMonth(calMonth);
                  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  // Monday-first: getDay returns 0=Sun, we want Mon=0
                  const startDow = (getDay(monthStart) + 6) % 7;
                  const cells: React.ReactNode[] = [];
                  
                  // Empty cells for days before month start
                  for (let i = 0; i < startDow; i++) {
                    cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                  }

                  days.forEach(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayBookings = calBookings.filter(b => b.session_date === dayStr);
                    const dayHabit = calHabits.find((h: any) => h.habit_date === dayStr);
                    const isSelected = calSelectedDay && isSameDay(day, calSelectedDay);
                    const isCurrentDay = checkIsToday(day);
                    const habitCount = dayHabit ? [dayHabit.train, dayHabit.learn_daily, dayHabit.water, dayHabit.hit_your_numbers, dayHabit.sauna, dayHabit.cold_shower, dayHabit.breathwork_done].filter(Boolean).length : 0;
                    
                    cells.push(
                      <button
                        key={dayStr}
                        onClick={() => { setCalSelectedDay(day); if (calBookings.length === 0 && calHabits.length === 0) fetchCalendar(); }}
                        className={`aspect-square rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 text-xs ${
                          isSelected 
                            ? 'border-primary bg-primary/15 text-primary' 
                            : isCurrentDay 
                              ? 'border-primary/40 bg-primary/5 text-foreground'
                              : 'border-transparent hover:border-border hover:bg-card/50 text-foreground'
                        }`}
                      >
                        <span className={`font-display text-sm ${isCurrentDay ? 'text-primary font-bold' : ''}`}>{format(day, 'd')}</span>
                        <div className="flex gap-0.5">
                          {dayBookings.length > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                          )}
                          {habitCount >= 7 ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          ) : habitCount > 0 ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          ) : null}
                        </div>
                      </button>
                    );
                  });
                  return cells;
                })()}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground justify-center">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Sessions</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Habits Done</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Partial</span>
            </div>

            {/* Auto-fill habits button */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-sm tracking-wider text-foreground">AUTO-FILL TODAY</p>
                      <p className="text-[10px] text-muted-foreground">Mark all 7 habits as complete</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary text-white font-display tracking-wider text-xs" 
                    onClick={handleAutoFillHabits}
                    disabled={autoFilling}
                  >
                    {autoFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'FILL'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Selected day detail */}
            {calSelectedDay && (() => {
              const dayStr = format(calSelectedDay, 'yyyy-MM-dd');
              const dayBookings = calBookings.filter(b => b.session_date === dayStr);
              const dayHabit = calHabits.find((h: any) => h.habit_date === dayStr);
              
              return (
                <div className="space-y-3">
                  <h4 className="font-display text-sm tracking-wider text-foreground">{format(calSelectedDay, 'EEEE d MMMM').toUpperCase()}</h4>
                  
                  {/* Bookings for this day */}
                  {dayBookings.length > 0 ? dayBookings.map((b: any) => (
                    <Card key={b.id} className="border-violet-500/30 bg-violet-500/5">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-xs tracking-wider text-foreground">{b.session_type?.toUpperCase() || 'SESSION'}</p>
                          <p className="text-[10px] text-muted-foreground">{b.start_time?.slice(0,5)} — {b.end_time?.slice(0,5)} {b.athlete_name ? `• ${b.athlete_name}` : ''}</p>
                          {b.location && <p className="text-[10px] text-muted-foreground mt-0.5">📍 {b.location}</p>}
                        </div>
                        <Badge variant="outline" className="text-[9px] font-display">{b.status?.toUpperCase() || 'BOOKED'}</Badge>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
                      <p className="text-xs text-muted-foreground font-display tracking-wide">NO SESSIONS</p>
                    </div>
                  )}
                  
                  {/* Habits for this day */}
                  {dayHabit ? (
                    <Card className="border-primary/20">
                      <CardContent className="p-3">
                        <p className="font-display text-xs tracking-wider text-foreground mb-2">DAILY HABITS</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { key: 'train', label: 'TRAIN', icon: '🏋️' },
                            { key: 'learn_daily', label: 'LEARN', icon: '📖' },
                            { key: 'water', label: 'HYDRATE', icon: '💧' },
                            { key: 'hit_your_numbers', label: 'NUMBERS', icon: '🎯' },
                            { key: 'sauna', label: 'SAUNA', icon: '🔥' },
                            { key: 'cold_shower', label: 'COLD', icon: '❄️' },
                            { key: 'breathwork_done', label: 'BREATHE', icon: '🌬️' },
                          ].map(h => (
                            <div key={h.key} className={`text-center rounded-lg p-1.5 text-[9px] font-display tracking-wider ${
                              (dayHabit as any)[h.key] ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-zinc-800/50 text-zinc-600'
                            }`}>
                              <span className="text-sm">{h.icon}</span>
                              <p className="mt-0.5">{h.label}</p>
                            </div>
                          ))}
                          {dayHabit.has_journal && (
                            <div className="text-center rounded-lg p-1.5 text-[9px] font-display tracking-wider bg-primary/10 text-primary border border-primary/20">
                              <span className="text-sm">✍️</span>
                              <p className="mt-0.5">JOURNAL</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-border/30">
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground font-display tracking-wide">NO HABITS LOGGED</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}

        {activeTab === 'clients' && (
          <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ClientSearchPanel />
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card py-12 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm font-display tracking-wide">NO PENDING REQUESTS</p>
                <p className="text-xs text-muted-foreground mt-1">New requests will appear here</p>
              </motion.div>
            ) : (
              pendingRequests.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-primary/20 bg-card p-3.5 flex items-center justify-between"
                  style={{ boxShadow: '0 0 15px rgba(255,85,0,0.06)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0 border border-primary/20">
                      <AvatarImage src={r.athlete_profile?.avatar_url || undefined} />
                      <AvatarFallback className="font-display text-sm bg-primary/10 text-primary">
                        {(r.athlete_profile?.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-display text-sm tracking-wide text-foreground truncate">{r.athlete_profile?.display_name || 'Unknown'}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" /> Coaching request
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(r.id, 'active')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white font-display text-[11px] tracking-wider hover:bg-primary/80 transition-colors"
                      style={{ boxShadow: '0 0 10px rgba(255,85,0,0.2)' }}
                    >
                      <Check className="w-3.5 h-3.5" /> ACCEPT
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'declined')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground font-display text-[11px] tracking-wider hover:border-gray-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> DECLINE
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (embedded) return <>{content}{confirmDialog}</>;

  return (
    <div className="min-h-screen pb-24">
      {/* Back nav */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
      </div>

      {/* Hero */}
      <div className="relative px-4 pt-5 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl tracking-wider text-center">
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(255,85,0,0.4)' }}>121</span>
            <span className="text-foreground"> COACHING</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-1.5 font-display tracking-wide">
            MANAGE ATHLETES · BUILD PROGRAMMES
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-4">
        {/* Stripe Connect for coaches */}
        <CoachStripeConnect
          stripeAccountId={(profile as any)?.stripe_connect_id}
          stripeOnboarded={(profile as any)?.stripe_onboarded}
        />
        {content}
      </div>
      {confirmDialog}
    </div>
  );
};

export default CoachDashboard;
