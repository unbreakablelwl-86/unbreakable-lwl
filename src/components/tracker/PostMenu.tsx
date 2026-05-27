import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, MessageSquareOff, MessageSquare, Pencil, BookImage, Flag, EyeOff, Eye } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ReportUserButton } from '@/components/ReportUserButton';
import { AnimatePresence, motion } from 'framer-motion';

interface PostMenuProps {
  isOwner: boolean;
  commentsEnabled: boolean;
  onDelete: () => void;
  onToggleComments: () => void;
  onEdit: () => void;
  onShareToStory: () => void;
  onHideFromFeed?: () => void;
  isHidden?: boolean;
  itemType?: 'post' | 'run' | 'workout';
  /** User ID of the post author — needed for non-owner report */
  authorUserId?: string;
  /** Post/item ID for the report */
  itemId?: string;
}

export function PostMenu({
  isOwner,
  commentsEnabled,
  onDelete,
  onToggleComments,
  onEdit,
  onShareToStory,
  onHideFromFeed,
  isHidden = false,
  itemType = 'post',
  authorUserId,
  itemId,
}: PostMenuProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getEditLabel = () => {
    switch (itemType) {
      case 'run': return 'Edit Run';
      case 'workout': return 'Edit Workout';
      default: return 'Edit Post';
    }
  };

  const getDeleteLabel = () => {
    switch (itemType) {
      case 'run': return 'Delete Run';
      case 'workout': return 'Delete Workout';
      default: return 'Delete Post';
    }
  };

  const getDeleteDescription = () => {
    switch (itemType) {
      case 'run': return 'Are you sure you want to delete this run? All kudos and comments will also be removed.';
      case 'workout': return 'Are you sure you want to delete this workout? All kudos and comments will also be removed.';
      default: return 'Are you sure you want to delete this post? All likes and comments will also be removed.';
    }
  };

  // Owner actions
  const ownerItems = [
    { icon: Pencil, label: getEditLabel(), action: () => { onEdit(); setShowMenu(false); } },
    { icon: BookImage, label: 'Share to Story', action: () => { onShareToStory(); setShowMenu(false); } },
    ...(onHideFromFeed ? [{
      icon: isHidden ? Eye : EyeOff,
      label: isHidden ? 'Show on Feed' : 'Hide from Feed',
      action: () => { onHideFromFeed(); setShowMenu(false); },
    }] : []),
    {
      icon: commentsEnabled ? MessageSquareOff : MessageSquare,
      label: commentsEnabled ? 'Disable Comments' : 'Enable Comments',
      action: () => { onToggleComments(); setShowMenu(false); },
    },
    {
      icon: Trash2,
      label: getDeleteLabel(),
      action: () => { setShowDeleteModal(true); setShowMenu(false); },
      destructive: true,
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setShowMenu(true)}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {/* Instagram-style bottom sheet menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/50 z-[70]"
              onClick={() => setShowMenu(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[71] bg-card rounded-t-2xl pb-[env(safe-area-inset-bottom,16px)]"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-4 pb-4 space-y-1">
                {isOwner ? (
                  ownerItems.map((item, idx) => (
                    <button
                      key={idx}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors active:bg-muted/50 ${
                        item.destructive ? 'text-destructive' : 'text-foreground'
                      }`}
                      onClick={item.action}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="font-display tracking-wide text-sm">{item.label}</span>
                    </button>
                  ))
                ) : (
                  /* Non-owner: Report button that opens the report dialog */
                  authorUserId && (
                    <ReportUserButton
                      reportedUserId={authorUserId}
                      contentType={itemType}
                      contentId={itemId}
                      variant="menu"
                    />
                  )
                )}
              </div>
              <div className="px-4 pb-2">
                <button
                  className="w-full py-3 rounded-xl bg-muted/50 text-muted-foreground font-display tracking-wide text-sm"
                  onClick={() => setShowMenu(false)}
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isOwner && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          title={getDeleteLabel()}
          description={getDeleteDescription()}
        />
      )}
    </>
  );
}
