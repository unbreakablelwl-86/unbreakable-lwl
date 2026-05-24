/**
 * ReportUserButton — allows any authenticated user to report another user or content.
 * Shows a dialog with reason selection and optional description.
 * Reports land in the Admin > Reports tab for dev/coach review.
 */

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAdminReports } from '@/hooks/useAdminReports';

const REPORT_REASONS = [
  'Inappropriate content',
  'Harassment or bullying',
  'Spam or self-promotion',
  'Impersonation',
  'Misleading information',
  'Other',
] as const;

interface ReportUserButtonProps {
  /** The user ID being reported */
  reportedUserId: string;
  /** Optional: type of content being reported (e.g. 'post', 'comment', 'profile') */
  contentType?: string;
  /** Optional: ID of the specific content */
  contentId?: string;
  /** Button variant */
  variant?: 'icon' | 'text' | 'menu';
  /** Additional class names */
  className?: string;
}

export function ReportUserButton({
  reportedUserId,
  contentType,
  contentId,
  variant = 'icon',
  className = '',
}: ReportUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createReport } = useAdminReports();

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      const result = await createReport(
        reportedUserId,
        reason,
        description || undefined,
        contentType,
        contentId,
      );
      if (!result.error) {
        setOpen(false);
        setReason('');
        setDescription('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const trigger = (() => {
    switch (variant) {
      case 'text':
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            className={`text-muted-foreground hover:text-destructive ${className}`}
          >
            <Flag className="w-4 h-4 mr-1.5" />
            Report
          </Button>
        );
      case 'menu':
        return (
          <button
            onClick={() => setOpen(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors ${className}`}
          >
            <Flag className="w-4 h-4" />
            Report User
          </button>
        );
      default:
        return (
          <button
            onClick={() => setOpen(true)}
            className={`p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ${className}`}
            title="Report"
          >
            <Flag className="w-4 h-4" />
          </button>
        );
    }
  })();

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">REPORT</DialogTitle>
            <DialogDescription>
              Help us keep the community safe. Select a reason and add details if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Reason selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Reason</p>
              <div className="grid grid-cols-1 gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      reason === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional description */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Details (optional)</p>
              <Textarea
                placeholder="Add any additional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="font-display tracking-wide bg-destructive hover:bg-destructive/90"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Flag className="w-4 h-4 mr-2" />
              )}
              SUBMIT REPORT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
