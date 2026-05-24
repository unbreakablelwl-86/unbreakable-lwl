import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useMealPlans } from '@/hooks/useMealPlans';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { NutritionHistoryView } from './NutritionHistoryView';
import { 
  Target, 
  TrendingUp,
  Calendar,
  Flame,
  Award,
  Settings,
  ChevronRight,
  History,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function MyFuel() {
  const { user } = useAuth();
  const { goals, saveGoals } = useNutritionGoals();
  const { activePlans } = useMealPlans();
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editedGoals, setEditedGoals] = useState({
    daily_calories: goals?.daily_calories || 2000,
    daily_protein_g: goals?.daily_protein_g || 150,
    daily_carbs_g: goals?.daily_carbs_g || 200,
    daily_fat_g: goals?.daily_fat_g || 70,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['food-logs-streak', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from('food_logs')
        .select('logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { streak, goalsHitThisWeek } = useMemo(() => {
    if (!recentLogs?.length || !goals?.daily_calories) {
      return { streak: 0, goalsHitThisWeek: 0 };
    }
    const logsByDate = new Map<string, number>();
    recentLogs.forEach(log => {
      const date = format(new Date(log.logged_at), 'yyyy-MM-dd');
      logsByDate.set(date, (logsByDate.get(date) || 0) + 1);
    });
    let currentStreak = 0;
    let checkDate = new Date();
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    if (!logsByDate.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (logsByDate.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    const weekDays = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    let goalsHit = 0;
    weekDays.forEach(day => {
      if (logsByDate.has(format(day, 'yyyy-MM-dd'))) goalsHit++;
    });
    return { streak: currentStreak, goalsHitThisWeek: goalsHit };
  }, [recentLogs, goals]);

  const handleSaveGoals = async () => {
    await saveGoals.mutateAsync(editedGoals);
    setShowGoalsModal(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="dashboard" className="font-display tracking-wide text-xs">
            <Target className="w-4 h-4 mr-1.5" />
            DASHBOARD
          </TabsTrigger>
          <TabsTrigger value="history" className="font-display tracking-wide text-xs">
            <History className="w-4 h-4 mr-1.5" />
            HISTORY
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          {/* Nutrition Goals Card */}
          <Card className="border-2 border-primary/30 border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display tracking-wide flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  DAILY GOALS
                </div>
                <Dialog open={showGoalsModal} onOpenChange={setShowGoalsModal}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display tracking-wide">SET NUTRITION GOALS</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Daily Calories</Label>
                        <Input type="number" min={1000} max={10000} value={editedGoals.daily_calories} onChange={(e) => setEditedGoals({ ...editedGoals, daily_calories: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Protein (g)</Label>
                          <Input type="number" min={0} value={editedGoals.daily_protein_g} onChange={(e) => setEditedGoals({ ...editedGoals, daily_protein_g: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label>Carbs (g)</Label>
                          <Input type="number" min={0} value={editedGoals.daily_carbs_g} onChange={(e) => setEditedGoals({ ...editedGoals, daily_carbs_g: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label>Fat (g)</Label>
                          <Input type="number" min={0} value={editedGoals.daily_fat_g} onChange={(e) => setEditedGoals({ ...editedGoals, daily_fat_g: parseInt(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <Button className="w-full font-display tracking-wide" onClick={handleSaveGoals} disabled={saveGoals.isPending}>
                        SAVE GOALS
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goals ? (
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-display text-2xl text-primary">{goals.daily_calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-display text-2xl text-primary">{goals.daily_protein_g}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-display text-2xl text-primary">{goals.daily_carbs_g}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-display text-2xl text-primary">{goals.daily_fat_g}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No goals set yet</p>
                  <Button variant="outline" className="font-display tracking-wide" onClick={() => setShowGoalsModal(true)}>
                    SET YOUR GOALS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Flame className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl text-primary mb-1">{streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl text-primary mb-1">{activePlans?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Plans</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl text-primary mb-1">{goalsHitThisWeek}</p>
                <p className="text-sm text-muted-foreground">Days Logged This Week</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Meal Plans */}
          {activePlans && activePlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display tracking-wide flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  ACTIVE MEAL PLANS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activePlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/20 text-primary">
                        <Flame className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display tracking-wide flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                WEEKLY PROGRESS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day) => (
                  <div key={day.toISOString()} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{format(day, 'EEE')}</p>
                    <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                      <span className="text-xs text-muted-foreground">{format(day, 'd')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">Log food daily to track your progress</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <NutritionHistoryView />
        </TabsContent>
      </Tabs>
    </div>
  );
}