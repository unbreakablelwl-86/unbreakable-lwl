import { useState } from 'react';
import { useUniversityAdmin } from '@/hooks/useUniversityAdmin';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteConfirmModal } from '@/components/tracker/DeleteConfirmModal';
import { Settings, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

export function AdminControlPanel() {
  const {
    adminMode, unlockAll, showAnswers, studentPreview, canAccessAdmin,
    setAdminMode, setUnlockAll, setShowAnswers, setStudentPreview,
    resetProgress, isResetting,
  } = useUniversityAdmin();

  const [expanded, setExpanded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!canAccessAdmin) return null;

  // Collapsed state — small icon button
  if (!expanded) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setExpanded(true)}
          className="rounded-full w-10 h-10 border-primary/30 bg-card shadow-lg"
        >
          <Settings className="w-4 h-4 text-primary" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 w-72">
        <Card className="p-4 border-primary/30 shadow-xl border-gray-800 bg-[#111]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xs tracking-wider text-primary">ADMIN CONTROLS</h3>
            <Button size="icon" variant="ghost" onClick={() => setExpanded(false)} className="h-6 w-6">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Admin Mode */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Admin Mode</span>
              <Switch checked={adminMode} onCheckedChange={setAdminMode} />
            </div>

            {/* Unlock All */}
            <div className={`flex items-center justify-between ${!adminMode ? 'opacity-40' : ''}`}>
              <span className="text-xs text-foreground">Unlock All</span>
              <Switch checked={unlockAll} onCheckedChange={setUnlockAll} disabled={!adminMode} />
            </div>

            {/* Show Answers */}
            <div className={`flex items-center justify-between ${!adminMode ? 'opacity-40' : ''}`}>
              <span className="text-xs text-foreground">Show Answers</span>
              <Switch checked={showAnswers} onCheckedChange={setShowAnswers} disabled={!adminMode} />
            </div>

            <div className="border-t border-primary/10 pt-3 space-y-2">
              {/* Student Preview */}
              <Button
                variant={studentPreview ? 'default' : 'outline'}
                size="sm"
                className="w-full text-xs gap-2"
                disabled={!adminMode}
                onClick={() => setStudentPreview(!studentPreview)}
              >
                {studentPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {studentPreview ? 'Exit Student Preview' : 'Preview as Student'}
              </Button>

              {/* Reset Progress */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setConfirmReset(true)}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset Course Progress'}
              </Button>
            </div>

            {studentPreview && (
              <p className="text-[10px] text-primary/60 text-center">Viewing as student — all overrides disabled</p>
            )}
          </div>
        </Card>
      </div>

      <DeleteConfirmModal
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          await resetProgress();
          setConfirmReset(false);
        }}
        title="Reset Course Progress"
        description="This will clear all completed chapters, quiz results, and assessment scores. This cannot be undone."
        confirmText="Reset Everything"
        loading={isResetting}
      />
    </>
  );
}
