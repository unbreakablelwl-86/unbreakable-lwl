import { useEffect } from 'react';
import { Activity, User, Shield, Settings, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminActivityLogs } from '@/hooks/useAdminActivityLogs';
import { format } from 'date-fns';

export function AdminActivityPanel() {
  const { logs, loading, fetchLogs, getActionLabel } = useAdminActivityLogs();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'suspend_user':
      case 'lift_suspension':
      case 'global_block':
        return <Shield className="w-4 h-4" />;
      case 'assign_role':
        return <User className="w-4 h-4" />;
      case 'update_report':
        return <Flag className="w-4 h-4" />;
      case 'update_setting':
        return <Settings className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'suspend_user':
      case 'global_block':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'lift_suspension':
        return 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30';
      case 'assign_role':
        return 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30';
      case 'update_report':
        return 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30';
      case 'update_setting':
        return 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDetails = (details: Record<string, unknown>) => {
    const entries = Object.entries(details);
    if (entries.length === 0) return null;
    
    return entries.map(([key, value]) => (
      <span key={key} className="text-xs text-muted-foreground">
        {key.replace(/_/g, ' ')}: <span className="text-foreground">{String(value)}</span>
      </span>
    ));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          ACTIVITY LOGS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs yet
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(log.action_type)}`}>
                  {getActionIcon(log.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {log.admin_profile?.display_name || log.admin_profile?.username || 'Unknown Admin'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getActionLabel(log.action_type)}
                    </Badge>
                  </div>
                  {log.target_type && (
                    <div className="text-sm text-muted-foreground">
                      Target: {log.target_type}
                    </div>
                  )}
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formatDetails(log.details)}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
