import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAdminReports, UserReport } from '@/hooks/useAdminReports';
import { format } from 'date-fns';

export function AdminReportsPanel() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const { reports, loading, fetchReports, updateReportStatus } = useAdminReports();

  useEffect(() => {
    fetchReports(statusFilter);
  }, [fetchReports, statusFilter]);

  const handleResolve = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport) return;
    await updateReportStatus(selectedReport.id, status, resolutionNotes);
    setResolveDialogOpen(false);
    setResolutionNotes('');
    setSelectedReport(null);
    fetchReports(statusFilter);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30"><Eye className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'resolved':
        return <Badge className="bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/30"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          USER REPORTS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Filter */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="pending" className="font-display text-xs">PENDING</TabsTrigger>
            <TabsTrigger value="reviewed" className="font-display text-xs">REVIEWED</TabsTrigger>
            <TabsTrigger value="resolved" className="font-display text-xs">RESOLVED</TabsTrigger>
            <TabsTrigger value="dismissed" className="font-display text-xs">DISMISSED</TabsTrigger>
            <TabsTrigger value="all" className="font-display text-xs">ALL</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Reports List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-lg border border-border bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-destructive/30">
                      <AvatarImage src={report.reported_user_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-destructive/10 text-destructive">
                        {getInitials(report.reported_user_profile?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        Report against {report.reported_user_profile?.display_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{report.reported_user_profile?.username || 'unknown'}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Reason: {report.reason}
                  </div>
                  {report.description && (
                    <div className="text-sm text-muted-foreground">
                      {report.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Reported by {report.reporter_profile?.display_name || 'Unknown'} • {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Mark Reviewed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setResolveDialogOpen(true);
                        }}
                      >
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>

                {report.resolution_notes && (
                  <div className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <span className="font-medium">Resolution:</span> {report.resolution_notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">RESOLVE REPORT</DialogTitle>
            <DialogDescription>
              Take action on this report. Add notes about your resolution.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Resolution notes (optional)..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleResolve('dismissed')}>
              <XCircle className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
            <Button onClick={() => handleResolve('resolved')}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
