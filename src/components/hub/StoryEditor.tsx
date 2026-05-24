import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Type, Trash2, X, Check, Image, Video, Palette,
  AlignLeft, AlignCenter, AlignRight, Bold, Loader2,
  Globe, Users, Lock, Undo2, Square, Minus, Plus,
  Move, Maximize2,
} from 'lucide-react';
import { TextOverlayData, DEFAULT_OVERLAY, StoryTextOverlay, FONT_OPTIONS } from './StoryTextOverlay';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { uploadMediaFile, validateVideoDuration, type MediaUploadItem } from '@/lib/mediaUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaTransform {
  scale: number;
  x: number; // % offset from center
  y: number; // % offset from center
}


const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#1C1C1E', '#0A0A0A', '#1A1A2E', '#16213E', '#0F3460',
  '#533483', '#2C061F', '#374045', '#2C3333',
];

const MAX_MEDIA = 5;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export interface StoryMediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string | null;
}

interface StoryEditorProps {
  onPublish: (data: {
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    visibility: string;
    text_overlays: TextOverlayData[];
    background_color: string | null;
    media_items: StoryMediaItem[];
  }) => Promise<void>;
  onClose: () => void;
  preFill?: {
    content?: string;
    image_url?: string;
    video_url?: string;
    background_color?: string;
  };
}

export function StoryEditor({ onPublish, onClose, preFill }: StoryEditorProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media items state (up to 5)
  const [mediaItems, setMediaItems] = useState<MediaUploadItem[]>(() => {
    const items: MediaUploadItem[] = [];
    if (preFill?.image_url) {
      items.push({
        file: new File([], 'prefill.jpg'),
        type: 'image',
        previewUrl: preFill.image_url,
        progress: 100,
        status: 'done',
        uploadedUrl: preFill.image_url,
      });
    }
    if (preFill?.video_url) {
      items.push({
        file: new File([], 'prefill.mp4'),
        type: 'video',
        previewUrl: preFill.video_url,
        progress: 100,
        status: 'done',
        uploadedUrl: preFill.video_url,
      });
    }
    return items;
  });
  const [activeMediaIndex, setActiveMediaIndexRaw] = useState(0);

  const [bgColor, setBgColor] = useState(preFill?.background_color || '#1C1C1E');

  // Per-slide overlays: key = media index (0 = background-only / first slide)
  const [overlaysBySlide, setOverlaysBySlide] = useState<Record<number, TextOverlayData[]>>(() => {
    if (preFill?.content) {
      const id = crypto.randomUUID();
      return { 0: [{ ...DEFAULT_OVERLAY, id, text: preFill.content, x: 50, y: 50, fontSize: 24 }] };
    }
    return {};
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived: current slide's overlays
  const overlays = overlaysBySlide[activeMediaIndex] || [];
  const setOverlays = useCallback((updater: (prev: TextOverlayData[]) => TextOverlayData[]) => {
    setOverlaysBySlide(prev => ({
      ...prev,
      [activeMediaIndex]: updater(prev[activeMediaIndex] || []),
    }));
  }, [activeMediaIndex]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorTarget, setColorTarget] = useState<'text' | 'bg' | 'overlay-bg' | 'border'>('bg');
  const [undoStack, setUndoStack] = useState<TextOverlayData[][]>([]);
  const [showTextTools, setShowTextTools] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; overlayX: number; overlayY: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [initialAngle, setInitialAngle] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);

  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const setActiveMediaIndex = useCallback((idx: number | ((prev: number) => number)) => {
    setActiveMediaIndexRaw(idx);
    setSelectedId(null);
    setShowTextTools(false);
    setShowColorPicker(false);
    setUndoStack([]);
  }, []);

  const selectedOverlay = overlays.find(o => o.id === selectedId);
  const hasMedia = mediaItems.length > 0;
  const currentMedia = mediaItems[activeMediaIndex];

  // Per-media transform state (resize/reposition)
  const [mediaTransforms, setMediaTransforms] = useState<Record<number, MediaTransform>>({});
  const [mediaEditMode, setMediaEditMode] = useState<'none' | 'move'>('none');
  const mediaDragRef = useRef<{ startX: number; startY: number; startTX: number; startTY: number } | null>(null);
  const mediaPinchRef = useRef<{ dist: number; scale: number } | null>(null);
  

  const getMediaTransform = (idx: number): MediaTransform => mediaTransforms[idx] || { scale: 1, x: 0, y: 0 };
  

  const updateMediaTransform = useCallback((idx: number, updates: Partial<MediaTransform>) => {
    setMediaTransforms(prev => ({ ...prev, [idx]: { ...prev[idx] || { scale: 1, x: 0, y: 0 }, ...updates } }));
  }, []);


  const cycleVisibility = () => {
    setVisibility(v => v === 'public' ? 'friends' : v === 'friends' ? 'private' : 'public');
  };
  const visIcon = visibility === 'public' ? <Globe className="w-4 h-4" /> : visibility === 'friends' ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />;

  const pushUndo = () => {
    setUndoStack(prev => [...prev.slice(-20), overlays.map(o => ({ ...o }))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setOverlays(() => last);
    setSelectedId(null);
  };

  const addTextOverlay = () => {
    pushUndo();
    const id = `txt_${Date.now()}`;
    const newOverlay: TextOverlayData = { ...DEFAULT_OVERLAY, id };
    setOverlays(prev => [...prev, newOverlay]);
    setSelectedId(id);
    setEditingTextId(id);
    setEditText(DEFAULT_OVERLAY.text);
    setShowColorPicker(false);
    setShowTextTools(true);
  };

  const updateOverlay = useCallback((id: string, updates: Partial<TextOverlayData>) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, [setOverlays]);

  const deleteSelected = () => {
    if (!selectedId) return;
    pushUndo();
    setOverlays(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
    setShowTextTools(false);
  };

  const commitTextEdit = () => {
    if (editingTextId && editText.trim()) {
      updateOverlay(editingTextId, { text: editText.trim() });
    }
    setEditingTextId(null);
  };

  const toggleBorder = () => {
    if (!selectedOverlay) return;
    pushUndo();
    if (selectedOverlay.showBorder) {
      updateOverlay(selectedOverlay.id, { showBorder: false, borderWidth: 0 });
    } else {
      updateOverlay(selectedOverlay.id, { showBorder: true, borderWidth: 2, borderColor: '#FFFFFF' });
    }
  };

  const toggleOverlayBg = () => {
    if (!selectedOverlay) return;
    pushUndo();
    if (selectedOverlay.backgroundColor) {
      updateOverlay(selectedOverlay.id, { backgroundColor: null });
    } else {
      updateOverlay(selectedOverlay.id, { backgroundColor: 'rgba(0,0,0,0.6)' });
    }
  };

  // Check if pointer is over delete zone
  const checkDeleteZone = useCallback((clientY: number) => {
    const threshold = window.innerHeight - 100;
    setIsOverDeleteZone(clientY > threshold);
  }, []);

  // Overlay drag
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !selectedId || !dragStartRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    const newX = Math.max(5, Math.min(95, dragStartRef.current.overlayX + deltaX));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.overlayY + deltaY));
    updateOverlay(selectedId, { x: newX, y: newY });
    checkDeleteZone(e.clientY);
  }, [isDragging, selectedId, updateOverlay, checkDeleteZone]);

  const handlePointerUp = useCallback(() => {
    if (isDragging && isOverDeleteZone && selectedId) {
      // Drop on delete zone — remove the overlay
      pushUndo();
      setOverlays(prev => prev.filter(o => o.id !== selectedId));
      setSelectedId(null);
      setShowTextTools(false);
    }
    setIsDragging(false);
    setShowDeleteZone(false);
    setIsOverDeleteZone(false);
    dragStartRef.current = null;
  }, [isDragging, isOverDeleteZone, selectedId]);

  const getTouchAngle = (t1: React.Touch, t2: React.Touch) =>
    Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedId) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      const overlay = overlays.find(o => o.id === selectedId);
      setInitialPinchDistance(dist);
      setInitialScale(overlay?.scale || 1);
      setInitialAngle(angle);
      setInitialRotation(overlay?.rotation || 0);
    }
  }, [selectedId, overlays]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedId && initialPinchDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
      const newScale = Math.max(0.3, Math.min(3, initialScale * (currentDist / initialPinchDistance)));
      const angleDelta = currentAngle - initialAngle;
      const newRotation = Math.round(initialRotation + angleDelta);
      updateOverlay(selectedId, { scale: newScale, rotation: newRotation });
    }
  }, [selectedId, initialPinchDistance, initialScale, initialAngle, initialRotation, updateOverlay]);

  const handleTouchEnd = useCallback(() => {
    setInitialPinchDistance(null);
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-overlay]')) return;
    setSelectedId(null);
    setShowColorPicker(false);
    setShowTextTools(false);
  };

  // Media file selection - supports multiple
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
      setMediaItems(prev => [...prev, ...newItems]);
      setActiveMediaIndex(mediaItems.length);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMediaItem = (index: number) => {
    setMediaItems(prev => {
      const item = prev[index];
      if (item && !item.uploadedUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    // Re-index overlays: remove this slide's overlays and shift higher indices down
    setOverlaysBySlide(prev => {
      const next: Record<number, TextOverlayData[]> = {};
      for (const [key, val] of Object.entries(prev)) {
        const k = Number(key);
        if (k < index) next[k] = val;
        else if (k > index) next[k - 1] = val;
        // k === index is dropped
      }
      return next;
    });
    setActiveMediaIndexRaw(prev => Math.max(0, Math.min(prev, mediaItems.length - 2)));
  };

  // Publish
  const handlePublish = async () => {
    if (Object.values(overlaysBySlide).flat().length === 0 && mediaItems.length === 0 && !bgColor) {
      toast.error('Add some content to your story');
      return;
    }
    if (!user) return;

    setPublishing(true);
    setOverallProgress(0);

    try {
      const uploadedMedia: StoryMediaItem[] = [];
      const totalItems = mediaItems.length;

      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];

        if (item.status === 'done' && item.uploadedUrl) {
          uploadedMedia.push({
            type: item.type,
            url: item.uploadedUrl,
            thumbnail_url: item.thumbnailUrl || null,
          });
          continue;
        }

        const itemLabel = `${item.type === 'image' ? 'Image' : 'Video'} ${i + 1}/${totalItems}`;

        setMediaItems(prev =>
          prev.map((m, idx) => idx === i ? { ...m, status: 'uploading' as const } : m)
        );

        const result = await uploadMediaFile(
          user.id,
          item.file,
          item.type,
          (pct, stage) => {
            const baseProgress = (i / totalItems) * 100;
            const itemProgress = (pct / 100) * (100 / totalItems);
            setOverallProgress(Math.round(baseProgress + itemProgress));
            setUploadProgress(`${itemLabel}: ${stage}`);
            setMediaItems(prev =>
              prev.map((m, idx) => idx === i ? { ...m, progress: pct } : m)
            );
          }
        );

        if (result.error) {
          toast.error(`Failed to upload ${item.file.name}`);
          setMediaItems(prev =>
            prev.map((m, idx) => idx === i ? { ...m, status: 'error' as const } : m)
          );
          setPublishing(false);
          setOverallProgress(0);
          setUploadProgress(null);
          return;
        }

        setMediaItems(prev =>
          prev.map((m, idx) =>
            idx === i ? { ...m, status: 'done' as const, progress: 100, uploadedUrl: result.url, thumbnailUrl: result.thumbnailUrl || undefined } : m
          )
        );

        uploadedMedia.push({
          type: item.type,
          url: result.url,
          thumbnail_url: result.thumbnailUrl,
        });
      }

      setUploadProgress('Publishing...');
      setOverallProgress(95);

      const firstImage = uploadedMedia.find(m => m.type === 'image');
      const firstVideo = uploadedMedia.find(m => m.type === 'video');

      // Tag each overlay with its slide index for per-slide rendering in viewer
      const allOverlays = Object.entries(overlaysBySlide).flatMap(([idx, ovs]) =>
        ovs.map(o => ({ ...o, slideIndex: Number(idx) }))
      );

      await onPublish({
        content: null,
        image_url: firstImage?.url || null,
        video_url: firstVideo?.url || null,
        visibility,
        text_overlays: allOverlays,
        background_color: bgColor,
        media_items: uploadedMedia,
      });
      toast.success('Story published!');
    } catch (err) {
      toast.error('Failed to publish story');
      console.error(err);
    } finally {
      setPublishing(false);
      setUploadProgress(null);
      setOverallProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      mediaItems.forEach(item => {
        if (!item.uploadedUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col" style={{ touchAction: 'none' }}>
      {/* Top bar - Instagram style */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-[env(safe-area-inset-top,12px)] py-3 z-30">
        <button
          className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {undoStack.length > 0 && (
            <button
              className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground"
              onClick={(e) => { e.stopPropagation(); handleUndo(); }}
            >
              <Undo2 className="w-5 h-5" />
            </button>
          )}
          <button
            className="w-10 h-10 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground"
            onClick={cycleVisibility}
          >
            {visIcon}
          </button>
        </div>
      </div>

      {/* Full-screen canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: bgColor }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleCanvasPointerDown}
      >
        {/* Current media display — interactive resize */}
        {hasMedia && currentMedia && (() => {
          const t = getMediaTransform(activeMediaIndex);
          const mediaStyle: React.CSSProperties = {
            transform: `translate(${t.x}%, ${t.y}%) scale(${t.scale})`,
            transition: mediaDragRef.current || mediaPinchRef.current ? 'none' : 'transform 0.15s ease',
            transformOrigin: 'center center',
          };
          return (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ cursor: mediaEditMode === 'move' ? 'grab' : 'default' }}
              onPointerDown={(e) => {
                if (mediaEditMode === 'move') {
                  e.stopPropagation();
                  mediaDragRef.current = { startX: e.clientX, startY: e.clientY, startTX: t.x, startTY: t.y };
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                }
              }}
              onPointerMove={(e) => {
                if (mediaDragRef.current && canvasRef.current) {
                  e.stopPropagation();
                  const rect = canvasRef.current.getBoundingClientRect();
                  const dx = ((e.clientX - mediaDragRef.current.startX) / rect.width) * 100;
                  const dy = ((e.clientY - mediaDragRef.current.startY) / rect.height) * 100;
                  updateMediaTransform(activeMediaIndex, {
                    x: mediaDragRef.current.startTX + dx,
                    y: mediaDragRef.current.startTY + dy,
                  });
                }
              }}
              onPointerUp={() => { mediaDragRef.current = null; }}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  e.stopPropagation();
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  mediaPinchRef.current = { dist: Math.sqrt(dx * dx + dy * dy), scale: t.scale };
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && mediaPinchRef.current) {
                  e.stopPropagation();
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const newScale = Math.max(0.3, Math.min(5, mediaPinchRef.current.scale * (dist / mediaPinchRef.current.dist)));
                  updateMediaTransform(activeMediaIndex, { scale: newScale });
                }
              }}
              onTouchEnd={() => { mediaPinchRef.current = null; }}
            >
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.uploadedUrl || currentMedia.previewUrl}
                  alt="Story media"
                  className="max-w-full max-h-full object-contain select-none pointer-events-none"
                  style={mediaStyle}
                  draggable={false}
                />
              ) : (
                <video
                  src={currentMedia.uploadedUrl || currentMedia.previewUrl}
                  autoPlay loop muted playsInline
                  className="max-w-full max-h-full object-contain select-none pointer-events-none"
                  style={mediaStyle}
                />
              )}

            </div>
          );
        })()}

        {/* Media dot indicators */}
        {mediaItems.length > 1 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {mediaItems.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeMediaIndex ? 'bg-white scale-125' : 'bg-white/40'
                }`}
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
              />
            ))}
          </div>
        )}

        {/* Text overlays on canvas */}
        {overlays.map(overlay => (
          <div
            key={overlay.id}
            data-overlay
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedId(overlay.id);
              setShowColorPicker(false);
              setShowTextTools(true);
              pushUndo();
              const ov = overlays.find(o => o.id === overlay.id);
              if (ov) {
                setIsDragging(true);
                setShowDeleteZone(true);
                dragStartRef.current = { x: e.clientX, y: e.clientY, overlayX: ov.x, overlayY: ov.y };
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingTextId(overlay.id);
              setEditText(overlay.text);
            }}
            style={{ touchAction: 'none' }}
          >
            <StoryTextOverlay
              overlay={overlay}
              isEditing={true}
              isSelected={selectedId === overlay.id}
              onSelect={() => { setSelectedId(overlay.id); setShowColorPicker(false); setShowTextTools(true); }}
            />
          </div>
        ))}

        {/* Drag-to-delete zone — appears at bottom when dragging */}
        <AnimatePresence>
          {(isDragging && showDeleteZone) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.15 }}
              className={`absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-center py-8 transition-colors duration-150 ${
                isOverDeleteZone
                  ? 'bg-primary/40'
                  : 'bg-gradient-to-t from-black/60 to-transparent'
              }`}
            >
              <motion.div
                animate={isOverDeleteZone ? { scale: 1.3 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Trash2 className={`w-8 h-8 transition-colors ${isOverDeleteZone ? 'text-primary' : 'text-foreground/60'}`} />
              </motion.div>
              <span className={`text-xs mt-1 font-display tracking-wider transition-colors ${isOverDeleteZone ? 'text-primary' : 'text-foreground/40'}`}>
                {isOverDeleteZone ? 'RELEASE TO DELETE' : 'DRAG HERE TO DELETE'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Media thumbnails strip */}
      {mediaItems.length > 0 && !isDragging && (
        <div className="absolute bottom-28 left-0 right-0 z-30 px-4">
          <div className="flex items-center gap-2 justify-center">
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === activeMediaIndex ? 'border-primary scale-110' : 'border-border/60'
                }`}
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(idx); }}
              >
                {item.type === 'image' ? (
                  <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <Video className="w-4 h-4 text-foreground/70" />
                  </div>
                )}

                {item.status === 'uploading' && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                  </div>
                )}

                {!publishing && (
                  <button
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); removeMediaItem(idx); }}
                  >
                    <X className="w-3 h-3 text-foreground" />
                  </button>
                )}
              </div>
            ))}

            {mediaItems.length < MAX_MEDIA && !publishing && (
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="w-12 h-12 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-foreground/50"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload progress bar */}
      {publishing && overallProgress > 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-30 space-y-1">
          <Progress value={overallProgress} className="h-1.5" />
          <p className="text-center text-foreground/60 text-[10px]">{uploadProgress || `${overallProgress}%`}</p>
        </div>
      )}

      {/* Text editing overlay */}
      {editingTextId && (
        <div className="absolute inset-0 z-40 bg-background/80 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-4">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-transparent border-0 text-foreground text-center text-2xl font-display tracking-wide min-h-32 resize-none outline-none placeholder:text-foreground/30"
              placeholder="Type your text..."
              autoFocus
              maxLength={150}
            />
            <div className="flex gap-3 justify-center">
              <button className="text-foreground/50 text-sm font-display" onClick={() => setEditingTextId(null)}>Cancel</button>
              <button className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-display" onClick={commitTextEdit}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal colour slider */}
      {showColorPicker && !editingTextId && (
        <div className="absolute bottom-20 left-0 right-0 z-30 px-4 animate-in slide-in-from-bottom-2 duration-150">
          {colorTarget === 'border' && selectedOverlay && (
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1 mx-auto w-fit mb-1">
              <button className="text-foreground/70" onClick={() => { if (!selectedOverlay) return; updateOverlay(selectedOverlay.id, { borderWidth: Math.max(1, (selectedOverlay.borderWidth || 2) - 1) }); }}>
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-foreground text-[10px] font-display w-4 text-center">{selectedOverlay.borderWidth || 2}</span>
              <button className="text-foreground/70" onClick={() => { if (!selectedOverlay) return; updateOverlay(selectedOverlay.id, { borderWidth: Math.min(8, (selectedOverlay.borderWidth || 2) + 1) }); }}>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                className={`w-7 h-7 rounded-full shrink-0 border-2 transition-all ${
                  (colorTarget === 'bg' ? bgColor :
                   colorTarget === 'border' ? selectedOverlay?.borderColor :
                   colorTarget === 'overlay-bg' ? selectedOverlay?.backgroundColor :
                   selectedOverlay?.color) === c
                    ? 'border-white scale-125'
                    : 'border-border/60'
                }`}
                style={{ backgroundColor: c }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (colorTarget === 'bg') setBgColor(c);
                  else if (colorTarget === 'border' && selectedId) updateOverlay(selectedId, { borderColor: c });
                  else if (colorTarget === 'overlay-bg' && selectedId) updateOverlay(selectedId, { backgroundColor: c });
                  else if (selectedId) updateOverlay(selectedId, { color: c });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected overlay text tools — compact Instagram-style */}
      <AnimatePresence>
        {selectedOverlay && showTextTools && !editingTextId && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute left-2 right-2 z-31 space-y-1.5 ${showColorPicker || hasMedia ? 'bottom-40' : 'bottom-20'}`}
          >
            {/* Font size + font family in one row */}
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md rounded-full px-3 py-1.5">
              <span className="text-foreground/50 text-[10px] shrink-0">Aa</span>
              <Slider
                value={[selectedOverlay.fontSize]}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { fontSize: v })}
                min={12} max={72} step={1}
                className="flex-1"
              />
              <span className="text-foreground text-[10px] font-display w-5 text-center shrink-0">{selectedOverlay.fontSize}</span>
            </div>
            {/* Font family */}
            <div className="flex items-center gap-1 overflow-x-auto bg-background/60 backdrop-blur-md rounded-full px-2 py-1 scrollbar-hide">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                    (selectedOverlay.fontFamily || "'Bebas Neue', sans-serif") === f.value
                      ? 'bg-white/25 text-foreground' : 'text-foreground/50'
                  }`}
                  style={{ fontFamily: f.value }}
                  onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { fontFamily: f.value }); }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Formatting + colour controls — single compact row */}
            <div className="flex items-center gap-0.5 bg-background/60 backdrop-blur-md rounded-full px-1.5 py-1 justify-center">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${selectedOverlay.textAlign === align ? 'bg-white/20' : ''} text-foreground`}
                  onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { textAlign: align }); }}
                >
                  {align === 'left' ? <AlignLeft className="w-3 h-3" /> : align === 'center' ? <AlignCenter className="w-3 h-3" /> : <AlignRight className="w-3 h-3" />}
                </button>
              ))}
              <button
                className={`w-7 h-7 rounded-full flex items-center justify-center ${selectedOverlay.fontWeight === 'bold' ? 'bg-white/20' : ''} text-foreground`}
                onClick={(e) => { e.stopPropagation(); updateOverlay(selectedOverlay.id, { fontWeight: selectedOverlay.fontWeight === 'bold' ? 'normal' : 'bold' }); }}
              >
                <Bold className="w-3 h-3" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-0.5" />
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-foreground"
                onClick={(e) => { e.stopPropagation(); setColorTarget('text'); setShowColorPicker(true); }}
              >
                <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: selectedOverlay.color }} />
              </button>
              <button
                className={`w-7 h-7 rounded-full flex items-center justify-center text-foreground ${selectedOverlay.backgroundColor ? 'bg-white/20' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleOverlayBg(); }}
              >
                <Square className="w-3 h-3" />
              </button>
              {selectedOverlay.backgroundColor && (
                <button
                  className="w-7 h-7 rounded-full flex items-center justify-center text-foreground"
                  onClick={(e) => { e.stopPropagation(); setColorTarget('overlay-bg'); setShowColorPicker(true); }}
                >
                  <div className="w-4 h-4 rounded border border-border0" style={{ backgroundColor: selectedOverlay.backgroundColor }} />
                </button>
              )}
              <button
                className={`w-7 h-7 rounded-full flex items-center justify-center text-foreground ${selectedOverlay.showBorder ? 'bg-white/20' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleBorder(); }}
              >
                <span className="text-[9px] font-bold border border-white/60 px-0.5 rounded">B</span>
              </button>
              {selectedOverlay.showBorder && (
                <button
                  className="w-7 h-7 rounded-full flex items-center justify-center text-foreground"
                  onClick={(e) => { e.stopPropagation(); setColorTarget('border'); setShowColorPicker(true); }}
                >
                  <div className="w-4 h-4 rounded border-2" style={{ borderColor: selectedOverlay.borderColor || '#FFF', backgroundColor: 'transparent' }} />
                </button>
              )}
              <div className="w-px h-5 bg-white/20 mx-0.5" />
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-foreground"
                onClick={(e) => { e.stopPropagation(); setEditingTextId(selectedOverlay.id); setEditText(selectedOverlay.text); }}
              >
                <Type className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media edit mode toolbar — shows when media is present */}
      {hasMedia && !isDragging && mediaEditMode !== 'none' && (
        <div className="absolute bottom-16 left-0 right-0 z-30 px-4 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md rounded-full px-3 py-2 justify-center">
            {mediaEditMode === 'move' && (
              <>
                <span className="text-foreground/50 text-[10px] shrink-0">Scale</span>
                <Slider
                  value={[getMediaTransform(activeMediaIndex).scale * 100]}
                  onValueChange={([v]) => updateMediaTransform(activeMediaIndex, { scale: v / 100 })}
                  min={30} max={500} step={5}
                  className="flex-1 max-w-[200px]"
                />
                <span className="text-foreground text-[10px] font-display w-8 text-center shrink-0">{Math.round(getMediaTransform(activeMediaIndex).scale * 100)}%</span>
              </>
            )}
            <button
              className="ml-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-display"
              onClick={() => {
                setMediaEditMode('none');
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Bottom toolbar — clean Instagram-style */}
      {!isDragging && (
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom,8px)]">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side tools */}
            <div className="flex items-center gap-2">
              <button
                className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-foreground active:scale-90 transition-transform"
                onClick={(e) => { e.stopPropagation(); addTextOverlay(); }}
              >
                <Type className="w-5 h-5" />
              </button>
              <button
                className={`w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-foreground active:scale-90 transition-transform ${mediaItems.length >= MAX_MEDIA ? 'opacity-30' : ''}`}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={mediaItems.length >= MAX_MEDIA}
              >
                <Image className="w-5 h-5" />
              </button>
              <button
                className={`w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center text-foreground active:scale-90 transition-transform ${showColorPicker ? 'bg-white/25' : 'bg-white/10'}`}
                onClick={(e) => { e.stopPropagation(); setColorTarget('bg'); setShowColorPicker(!showColorPicker); }}
              >
                <Palette className="w-5 h-5" />
              </button>
              {/* Move/resize media button */}
              {hasMedia && (
                <button
                  className={`w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center text-foreground active:scale-90 transition-transform ${mediaEditMode === 'move' ? 'bg-white/25' : 'bg-white/10'}`}
                  onClick={(e) => { e.stopPropagation(); setMediaEditMode(mediaEditMode === 'move' ? 'none' : 'move'); }}
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Share button — right side */}
            <button
              className="h-11 px-6 rounded-full bg-primary text-primary-foreground font-display tracking-wider text-sm flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">{uploadProgress || 'POSTING'}</span></>
              ) : 'SHARE'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFilesSelect}
        multiple
      />
    </div>
  );
}
