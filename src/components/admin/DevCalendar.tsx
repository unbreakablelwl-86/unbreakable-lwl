import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Facebook, Instagram, Clock, Zap, Eye, Heart,
  MessageSquare, Share2, CheckCircle2,
} from 'lucide-react';

/* ── Types ── */
interface CalendarPost {
  id: string;
  platform: string;
  content_type: string;
  tone: string | null;
  content: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  meta_status: string | null;
  published_at: string | null;
  likes?: number;
  comments_count?: number;
  shares?: number;
  reach?: number;
  engagement_rate?: number;
  image_url?: string | null;
  custom_image_url?: string | null;
}

/* ── Helpers ── */
const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  tiktok: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  x: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-3 h-3" />,
  facebook: <Facebook className="w-3 h-3" />,
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-primary/20 text-primary',
  published: 'bg-green-500/20 text-green-400',
};

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Adjust for Monday start (0=Mon ... 6=Sun)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  // Pad to fill last row
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

/* ── Component ── */
export function DevCalendar({ onCreatePost }: { onCreatePost?: () => void }) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  /* Fetch posts for visible month range */
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const start = new Date(currentYear, currentMonth, 1).toISOString();
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

      const { data } = await supabase
        .from('social_posts')
        .select('*')
        .or(`scheduled_at.gte.${start},created_at.gte.${start}`)
        .or(`scheduled_at.lte.${end},created_at.lte.${end}`)
        .order('scheduled_at', { ascending: true });

      if (data) setPosts(data as CalendarPost[]);
      setLoading(false);
    })();
  }, [user, currentMonth, currentYear]);

  /* Group posts by date */
  const postsByDate = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {};
    posts.forEach(p => {
      const d = p.scheduled_at || p.published_at || p.created_at;
      if (!d) return;
      const key = d.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [posts]);

  const days = getMonthDays(currentYear, currentMonth);

  /* Stats for the month */
  const monthStats = useMemo(() => {
    const scheduled = posts.filter(p => p.status === 'scheduled').length;
    const published = posts.filter(p => p.meta_status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const totalEngagement = posts.reduce((s, p) => s + (p.likes || 0) + (p.comments_count || 0) + (p.shares || 0), 0);
    return { scheduled, published, drafts, totalEngagement, total: posts.length };
  }, [posts]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const selectedPosts = selectedDate ? (postsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarIcon className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wider">CONTENT CALENDAR</h2>
          <p className="text-[10px] text-muted-foreground tracking-widest">PLAN • SCHEDULE • TRACK</p>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card><CardContent className="py-3 px-2 text-center">
          <p className="text-lg font-black text-primary">{monthStats.total}</p>
          <p className="text-[9px] text-muted-foreground tracking-wider">TOTAL</p>
        </CardContent></Card>
        <Card><CardContent className="py-3 px-2 text-center">
          <p className="text-lg font-black text-muted-foreground">{monthStats.drafts}</p>
          <p className="text-[9px] text-muted-foreground tracking-wider">DRAFTS</p>
        </CardContent></Card>
        <Card><CardContent className="py-3 px-2 text-center">
          <p className="text-lg font-black text-primary">{monthStats.scheduled}</p>
          <p className="text-[9px] text-muted-foreground tracking-wider">SCHEDULED</p>
        </CardContent></Card>
        <Card><CardContent className="py-3 px-2 text-center">
          <p className="text-lg font-black text-green-400">{monthStats.published}</p>
          <p className="text-[9px] text-muted-foreground tracking-wider">PUBLISHED</p>
        </CardContent></Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <div className="text-center">
              <h3 className="font-display text-base tracking-wider text-foreground">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <button onClick={goToday} className="text-[9px] text-primary font-display tracking-wider hover:underline">
                TODAY
              </button>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[9px] font-display tracking-wider text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-16" />;

              const key = dateKey(currentYear, currentMonth, day);
              const dayPosts = postsByDate[key] || [];
              const today = isToday(currentYear, currentMonth, day);
              const selected = selectedDate === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(selected ? null : key)}
                  className={`h-16 rounded-lg border transition-all flex flex-col items-center justify-start pt-1 gap-0.5 relative ${
                    selected
                      ? 'border-primary bg-primary/10 shadow-[0_0_10px_hsl(24_100%_50%/0.3)]'
                      : today
                        ? 'border-primary/50 bg-primary/5'
                        : dayPosts.length > 0
                          ? 'border-primary/20 bg-card hover:border-primary/40'
                          : 'border-border bg-card/50 hover:border-primary/20'
                  }`}
                >
                  <span className={`text-[11px] font-display ${
                    today ? 'text-primary font-black' : selected ? 'text-primary' : 'text-foreground'
                  }`}>
                    {day}
                  </span>

                  {/* Post indicators */}
                  {dayPosts.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 px-0.5">
                      {dayPosts.slice(0, 4).map((p, j) => (
                        <div
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.meta_status === 'published'
                              ? 'bg-green-400'
                              : p.status === 'scheduled'
                                ? 'bg-primary'
                                : 'bg-muted-foreground/50'
                          }`}
                        />
                      ))}
                      {dayPosts.length > 4 && (
                        <span className="text-[7px] text-muted-foreground">+{dayPosts.length - 4}</span>
                      )}
                    </div>
                  )}

                  {today && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Detail */}
      {selectedDate && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-primary font-display tracking-widest">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  }).toUpperCase()}
                </p>
                <p className="text-[9px] text-muted-foreground tracking-wider mt-0.5">
                  {selectedPosts.length} POST{selectedPosts.length !== 1 ? 'S' : ''}
                </p>
              </div>
              {onCreatePost && (
                <Button size="sm" onClick={onCreatePost} className="text-[10px] font-display gap-1.5">
                  <Plus className="w-3 h-3" /> NEW POST
                </Button>
              )}
            </div>

            {selectedPosts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No content planned for this date</p>
                {onCreatePost && (
                  <Button variant="outline" size="sm" onClick={onCreatePost} className="mt-3 text-[10px] font-display gap-1.5">
                    <Plus className="w-3 h-3" /> PLAN CONTENT
                  </Button>
                )}
              </div>
            ) : (
              selectedPosts.map(post => (
                <div key={post.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className={`font-display text-[9px] ${PLATFORM_COLORS[post.platform] || ''}`}>
                        {PLATFORM_ICONS[post.platform] || null}
                        <span className="ml-1">{post.platform.toUpperCase()}</span>
                      </Badge>
                      <Badge variant="outline" className="font-display text-[9px]">
                        {post.content_type.toUpperCase()}
                      </Badge>
                    </div>
                    <Badge className={`font-display text-[8px] ${STATUS_STYLES[post.meta_status === 'published' ? 'published' : post.status] || ''}`}>
                      {post.meta_status === 'published' ? (
                        <><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> LIVE</>
                      ) : post.status === 'scheduled' ? (
                        <><Clock className="w-2.5 h-2.5 mr-0.5" /> SCHEDULED</>
                      ) : 'DRAFT'}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>

                  {(post.custom_image_url || post.image_url) && (
                    <img
                      src={post.custom_image_url || post.image_url || ''}
                      alt=""
                      className="w-full rounded-lg max-h-32 object-cover"
                    />
                  )}

                  {post.scheduled_at && (
                    <p className="text-[9px] text-primary font-display tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  {/* Engagement stats if published */}
                  {post.meta_status === 'published' && (post.likes || post.shares || post.comments_count) ? (
                    <div className="flex gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-primary" />{post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-primary" />{post.comments_count || 0}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-primary" />{post.shares || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-primary" />{post.reach || 0}</span>
                      {post.engagement_rate ? (
                        <Badge variant="outline" className="text-[8px] font-display">{post.engagement_rate}% ER</Badge>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Strategy Legend */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <p className="text-[10px] text-primary font-display tracking-widest">📅 POSTING GUIDE</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Published &amp; Live</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
              <span>Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>4-7 posts/week = optimal</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              <strong className="text-primary">Best times:</strong> 6-8am (early birds) • 12-1pm (lunch scroll) • 6-9pm (post-work).
              Rotate between pillars — Power, Movement, Fuel, Mindset, Un-Tunes, Real Talk.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
