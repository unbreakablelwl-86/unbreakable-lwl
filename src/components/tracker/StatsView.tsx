import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useUserRuns } from '@/hooks/useRuns';
import { useAuth } from '@/hooks/useAuth';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Zap, 
  Target, 
  Award, 
  Activity 
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function StatsView() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { runs, loading } = useUserRuns(user?.id);

  const stats = useMemo(() => {
    if (!runs.length) return null;

    const totalDistance = runs.reduce((sum, r) => sum + Number(r.distance_km), 0);
    const totalTime = runs.reduce((sum, r) => sum + r.duration_seconds, 0);
    const totalRuns = runs.length;
    const avgPace = runs.reduce((sum, r) => sum + (r.pace_per_km_seconds || 0), 0) / totalRuns;
    const longestRun = Math.max(...runs.map((r) => Number(r.distance_km)));
    const fastestPace = Math.min(...runs.filter((r) => r.pace_per_km_seconds).map((r) => r.pace_per_km_seconds!));

    // Weekly data for chart
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 3 - i));
      const weekEnd = endOfWeek(weekStart);
      const weekRuns = runs.filter((r) => {
        const date = parseISO(r.started_at);
        return date >= weekStart && date <= weekEnd;
      });
      return {
        week: format(weekStart, 'MMM d'),
        distance: weekRuns.reduce((sum, r) => sum + Number(r.distance_km), 0),
        runs: weekRuns.length,
      };
    });

    // Daily activity for this week
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const daysOfWeek = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
    const dailyData = daysOfWeek.map((day) => {
      const dayRuns = runs.filter((r) => {
        const runDate = parseISO(r.started_at);
        return format(runDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return {
        day: format(day, 'EEE'),
        distance: dayRuns.reduce((sum, r) => sum + Number(r.distance_km), 0),
      };
    });

    return {
      totalDistance,
      totalTime,
      totalRuns,
      avgPace,
      longestRun,
      fastestPace,
      weeklyData: last4Weeks,
      dailyData,
    };
  }, [runs]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatPace = (paceSeconds: number) => {
    if (!paceSeconds || !isFinite(paceSeconds)) return '--:--';
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.round(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className=" border-border p-8 text-center border-gray-800 bg-[#111]">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2 tracking-wide">
          NO RUNS YET
        </h3>
        <p className="text-muted-foreground">
          Record your first run to see your stats here!
        </p>
      </Card>
    );
  }

  const statCards = [
    {
      icon: TrendingUp,
      label: 'Total Distance',
      value: `${stats.totalDistance.toFixed(1)} km`,
      color: 'text-primary',
    },
    {
      icon: Calendar,
      label: 'Total Runs',
      value: stats.totalRuns.toString(),
      color: 'text-green-500',
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: formatDuration(stats.totalTime),
      color: 'text-blue-500',
    },
    {
      icon: Zap,
      label: 'Avg Pace',
      value: `${formatPace(stats.avgPace)} /km`,
      color: 'text-yellow-500',
    },
    {
      icon: Target,
      label: 'Longest Run',
      value: `${stats.longestRun.toFixed(1)} km`,
      color: 'text-purple-500',
    },
    {
      icon: Award,
      label: 'Fastest Pace',
      value: `${formatPace(stats.fastestPace)} /km`,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wide">
          YOUR <span className="text-primary">STATS</span>
        </h2>
        <p className="text-muted-foreground mt-2">Track your progress and crush your goals</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className=" border-border p-4 border-gray-800 bg-[#111]">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                {stat.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Distance Chart */}
      <Card className=" border-border p-6 border-gray-800 bg-[#111]">
        <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
          WEEKLY DISTANCE
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.weeklyData}>
              <defs>
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis
                dataKey="week"
                stroke="hsl(0, 0%, 60%)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(0, 0%, 60%)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `${v}km`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 10%)',
                  border: '1px solid hsl(0, 0%, 20%)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(0, 0%, 98%)' }}
                formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
              />
              <Area
                type="monotone"
                dataKey="distance"
                stroke="hsl(24, 100%, 50%)"
                strokeWidth={2}
                fill="url(#colorDistance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* This Week's Activity */}
      <Card className=" border-border p-6 border-gray-800 bg-[#111]">
        <h3 className="font-display text-xl text-foreground mb-4 tracking-wide">
          THIS WEEK
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis
                dataKey="day"
                stroke="hsl(0, 0%, 60%)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(0, 0%, 60%)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 10%)',
                  border: '1px solid hsl(0, 0%, 20%)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(0, 0%, 98%)' }}
                formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
              />
              <Bar
                dataKey="distance"
                fill="hsl(24, 100%, 50%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
