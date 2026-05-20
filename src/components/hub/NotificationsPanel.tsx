import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Dumbbell,
  Check,
  Trash2,
  ChevronRight,
  Brain,
} from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getNotificationLink(notification: Notification): string | null {
  const t = notification.type;
  const d = notification.data || {};

  // Coaching & feedback
  if (t === 'coaching_feedback' || t === 'feedback_response' || t === 'programme_updated') return '/my-coaching';
  if (t === 'coaching_request' || t === 'tier2_signup') return '/coach';

  // Session / workout completions — coaches see athlete data on their dashboard
  if (t === 'athlete_completed_session') return '/coach';
  if (t === 'athlete_skipped_session' || t === 'adherence_alert') return '/coach';

  // Athlete's own workout / programme notifications
  if (t === 'workout_like' || t === 'workout') return '/programming/my-programmes';
  if (t === 'ai_coaching_callout') return '/programming/my-programmes';

  // Plan updates from coach
  if (t === 'plan_update') return '/my-coaching';

  // Social — follow
  if (t === 'follow' && d.follower_id) return `/user/${d.follower_id}`;

  // Social — friend
  if (t === 'friend_request' || t === 'friend_accepted') return d.user_id ? `/user/${d.user_id}` : '/';

  // Social — post interactions
  if ((t === 'post_like' || t === 'post_comment') && d.post_user_id) return `/user/${d.post_user_id}`;
  if (t === 'post_like' || t === 'post_comment') return '/';

  // Social — mentions
  if (t === 'mention' && d.content_type === 'post' && d.author_id) return `/user/${d.author_id}`;
  if (t === 'mention') return '/';

  // Tracker / running
  if (t === 'run_like') return '/tracker';
  if (t === 'milestone' || t === 'trophy') return '/tracker';

  // Mindset
  if (t === 'mindset_activity_complete') return '/coach';

  // Fuel
  if (t === 'meal_plan_updated') return '/fuel/planning';

  // Fallback — if there's any data with a path hint, use it
  if (d.link) return String(d.link);

  return null;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'follow':
    case 'friend_request':
    case 'friend_accepted':
      return <UserPlus className="w-4 h-4" />;
    case 'post_like':
    case 'workout_like':
    case 'run_like':
      return <Heart className="w-4 h-4" />;
    case 'post_comment':
      return <MessageCircle className="w-4 h-4" />;
    case 'milestone':
    case 'trophy':
      return <Trophy className="w-4 h-4" />;
    case 'workout':
    case 'programme_updated':
      return <Dumbbell className="w-4 h-4" />;
    case 'coaching_feedback':
    case 'coaching_request':
    case 'feedback_response':
      return <UserPlus className="w-4 h-4" />;
    case 'mindset_activity_complete':
      return <Brain className="w-4 h-4" />;
    case 'adherence_alert':
    case 'athlete_skipped_session':
      return <Dumbbell className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (path: string) => void;
}) {
  const link = getNotificationLink(notification);
  const isDragging = React.useRef(false);

  const handleTap = () => {
    if (isDragging.current) return;
    if (!notification.read) onMarkRead(notification.id);
    if (link && onNavigate) onNavigate(link);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -80, right: 0 }}
      dragElastic={0.1}
      dragSnapToOrigin
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={(_: any, info: PanInfo) => {
        if (info.offset.x < -60) onDelete(notification.id);
        setTimeout(() => { isDragging.current = false; }, 100);
      }}
      className="relative"
    >
      {/* Delete indicator behind */}
      <div className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center rounded-r-lg">
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </div>

      <div
        onClick={handleTap}
        className={`p-4 border-b border-border hover:bg-muted/50 transition-colors bg-card relative ${
          !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
        } ${link ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              notification.read ? 'bg-muted' : 'bg-primary/20 text-primary'
            }`}
          >
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {notification.body}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
              {link && (
                <span className="text-primary text-xs flex items-center gap-0.5 font-display tracking-wide">
                  VIEW <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                className="h-8 w-8 p-0"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } =
    useNotifications();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header — Instagram Activity style */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-lg tracking-widest">Activity</h2>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-primary text-xs font-display tracking-wide">
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteAllNotifications}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-display tracking-wide text-lg">Activity</p>
                  <p className="text-sm text-muted-foreground mt-1">When people interact with you, you'll see it here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
