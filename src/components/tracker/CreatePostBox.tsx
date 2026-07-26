import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, X, Loader2, Globe, Users, Lock, Send, CheckCircle2, Music } from 'lucide-react';
import { TrackPicker, type TrackClip } from './TrackPicker';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useHashtagPrediction } from '@/hooks/useHashtagPrediction';
import { MentionTextarea } from '@/components/ui/mention-textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { validateVideoDuration, uploadMediaFile, type MediaUploadItem } from '@/lib/mediaUpload';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_HASHTAGS = '\n\n#Unbreakable #LiveWithoutLimits #KeepShowingUp';
const MAX_MEDIA = 5;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

interface CreatePostBoxProps {
  onPostCreated?: () => void;
}

export function CreatePostBox({ onPostCreated }: CreatePostBoxProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createPost, refetch: refetchPosts } = usePosts();
  const { extractAndSaveHashtags } = useHashtagPrediction();

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mediaItems, setMediaItems] = useState<MediaUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachedTrack, setAttachedTrack] = useState<TrackClip | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    if (value) setIsExpanded(true);
  }, []);

  if (!user) return null;

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_MEDIA - mediaItems.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_MEDIA} media items allowed`);
      return;
    }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.info(`Only ${remaining} more item${remaining > 1 ? 's' : ''} can be added`);
    }

    const newItems: MediaUploadItem[] = [];

    for (const file of toAdd) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        toast.error(`${file.name} is not a supported format`);
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toast.error(`${file.name} exceeds 500MB limit`);
        continue;
      }

      if (isVideo) {
        const { valid, duration } = await validateVideoDuration(file);
        if (!valid) {
          toast.error(`${file.name} exceeds 90 second limit (${Math.round(duration)}s)`);
          continue;
        }
      }

      newItems.push({
        file,
        type: isVideo ? 'video' : 'image',
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      });
    }

    if (newItems.length) {
      setMediaItems((prev) => [...prev, ...newItems]);
      setIsExpanded(true);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMediaItem = (index: number) => {
    setMediaItems((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsSubmitting(true);
    setOverallProgress(0);

    try {
      // Upload all media
      const totalItems = mediaItems.length;
      const uploadedMedia: Array<{
        type: 'image' | 'video';
        url: string;
        thumbnailUrl: string | null;
        width: number;
        height: number;
        duration: number | null;
        fileSize: number;
        sortOrder: number;
      }> = [];

      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        const itemLabel = `${item.type === 'image' ? 'Image' : 'Video'} ${i + 1}/${totalItems}`;

        setMediaItems((prev) =>
          prev.map((m, idx) => (idx === i ? { ...m, status: 'uploading' as const } : m))
        );

        const result = await uploadMediaFile(
          user.id,
          item.file,
          item.type,
          (pct, stage) => {
            const baseProgress = (i / totalItems) * 100;
            const itemProgress = (pct / 100) * (100 / totalItems);
            setOverallProgress(Math.round(baseProgress + itemProgress));
            setProgressLabel(`${itemLabel}: ${stage}`);
            setMediaItems((prev) =>
              prev.map((m, idx) => (idx === i ? { ...m, progress: pct } : m))
            );
          }
        );

        if (result.error) {
          toast.error(`Failed to upload ${item.file.name}`);
          setMediaItems((prev) =>
            prev.map((m, idx) => (idx === i ? { ...m, status: 'error' as const } : m))
          );
          setIsSubmitting(false);
          setOverallProgress(0);
          setProgressLabel('');
          return;
        }

        setMediaItems((prev) =>
          prev.map((m, idx) =>
            idx === i ? { ...m, status: 'done' as const, progress: 100, uploadedUrl: result.url, thumbnailUrl: result.thumbnailUrl || undefined } : m
          )
        );

        uploadedMedia.push({
          type: item.type,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          duration: result.duration,
          fileSize: item.file.size,
          sortOrder: i,
        });
      }

      setProgressLabel('Publishing post...');
      setOverallProgress(95);

      if (content.trim()) {
        extractAndSaveHashtags(content);
      }

      // Create the post (use first image/video for backward compat)
      const firstImage = uploadedMedia.find((m) => m.type === 'image');
      const firstVideo = uploadedMedia.find((m) => m.type === 'video');

      // Append default hashtags if not already present
      const trimmed = content.trim();
      const hasDefaultTags = trimmed.includes('#Unbreakable') && trimmed.includes('#LiveWithoutLimits');
      const finalContent = trimmed ? (hasDefaultTags ? trimmed : trimmed + DEFAULT_HASHTAGS) : undefined;

      const { error, data: postData } = await createPost({
        content: finalContent || (uploadedMedia.length > 0 ? '' : undefined),
        image_url: firstImage?.url || undefined,
        video_url: firstVideo?.url || undefined,
        visibility,
      });

      if (error || !postData) {
        console.error('[CreatePostBox] Post creation failed:', error?.message || 'No data returned', { error, hasContent: !!finalContent, hasVideo: !!firstVideo, hasImage: !!firstImage });
        toast.error(error?.message || 'Failed to create post — please try again');
        setIsSubmitting(false);
        setOverallProgress(0);
        setProgressLabel('');
        return;
      }

      // Insert media items into post_media table
      const allMediaRows: any[] = uploadedMedia.map((m) => ({
        post_id: postData.id,
        user_id: user.id,
        media_type: m.type,
        media_url: m.url,
        thumbnail_url: m.thumbnailUrl,
        sort_order: m.sortOrder,
        width: m.width || null,
        height: m.height || null,
        duration_seconds: m.duration || null,
        file_size_bytes: m.fileSize || null,
      }));

      // Add attached Un-Tunes track as audio media (with clip bounds)
      // Clip start/end stored via width/height (seconds × 1000) since audio has no dimensions
      if (attachedTrack) {
        const clipDuration = attachedTrack.clipEnd - attachedTrack.clipStart;
        allMediaRows.push({
          post_id: postData.id,
          user_id: user.id,
          media_type: 'audio',
          media_url: `${attachedTrack.audio_url}#t=${attachedTrack.clipStart},${attachedTrack.clipEnd}`,
          thumbnail_url: attachedTrack.cover_url,
          sort_order: allMediaRows.length,
          duration_seconds: clipDuration || attachedTrack.duration_seconds || null,
          width: Math.round(attachedTrack.clipStart * 1000),
          height: Math.round(attachedTrack.clipEnd * 1000),
        });
      }

      if (allMediaRows.length > 0) {
        await supabase.from('post_media').insert(allMediaRows);
        await refetchPosts();
      }

      setOverallProgress(100);
      setProgressLabel('');

      // Show success state
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setContent('');
        setMediaItems([]);
        setAttachedTrack(null);
        setIsExpanded(false);
        setIsSubmitting(false);
        setOverallProgress(0);
        onPostCreated?.();
      }, 2000);
    } catch (err) {
      console.error('Post creation error:', err);
      toast.error('Something went wrong');
      setIsSubmitting(false);
      setOverallProgress(0);
      setProgressLabel('');
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'friends': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-card border-border p-4 relative overflow-hidden">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-card flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>
            <p className="text-foreground font-heading tracking-wide text-lg">Post is live!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground font-heading">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3 relative">
          <MentionTextarea
            value={content}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            className={`bg-muted/50 border-0 transition-all ${isExpanded ? 'min-h-[100px]' : 'min-h-[44px]'}`}
            onFocus={() => setIsExpanded(true)}
            enableHashtags={true}
            enableMentions={true}
          />

          {/* Media Previews */}
          <AnimatePresence>
            {mediaItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {mediaItems.map((item, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    {item.type === 'image' ? (
                      <img loading="lazy" src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Progress overlay */}
                    {item.status === 'uploading' && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                      </div>
                    )}
                    {item.status === 'done' && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                        <X className="w-5 h-5 text-destructive" />
                      </div>
                    )}

                    {!isSubmitting && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0.5 right-0.5 h-5 w-5 p-0 rounded-full"
                        onClick={() => removeMediaItem(idx)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add more button */}
                {mediaItems.length < MAX_MEDIA && !isSubmitting && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="text-2xl font-light">+</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attached Un-Tunes track preview — compact inline */}
          <AnimatePresence>
            {attachedTrack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-primary/30 bg-primary/5"
              >
                <Music className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground truncate flex-1">
                  {attachedTrack.title} · {Math.round(attachedTrack.clipEnd - attachedTrack.clipStart)}s clip
                </p>
                {!isSubmitting && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => setAttachedTrack(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress */}
          <AnimatePresence>
            {isSubmitting && overallProgress > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <Progress value={overallProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progressLabel || `${overallProgress}%`}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 pt-2 border-t border-border"
              >
                {/* Row 1: Media + Music */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFilesSelect}
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground"
                    disabled={isSubmitting || mediaItems.length >= MAX_MEDIA}
                  >
                    <Image className="w-5 h-5 mr-1" />
                    Media
                    {mediaItems.length > 0 && (
                      <span className="ml-1 text-xs text-primary">{mediaItems.length}/{MAX_MEDIA}</span>
                    )}
                  </Button>

                  <TrackPicker
                    onSelect={setAttachedTrack}
                    selectedTrack={attachedTrack}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={attachedTrack ? 'text-primary' : 'text-muted-foreground'}
                      disabled={isSubmitting}
                    >
                      <Music className="w-5 h-5 mr-1" />
                      Music
                    </Button>
                  </TrackPicker>
                </div>

                {/* Row 2: Visibility + Post */}
                <div className="flex items-center justify-between">
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="w-auto h-8 border-0 bg-transparent">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getVisibilityIcon()}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4" />Public</div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" />Friends Only</div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4" />Only Me</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!content.trim() && mediaItems.length === 0 && !attachedTrack)}
                    className="font-heading tracking-wide"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
