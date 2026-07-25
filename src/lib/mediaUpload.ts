import { supabase } from '@/integrations/supabase/client';
import { generateVideoThumbnail } from './videoUtils';

const MAX_VIDEO_DURATION_SECONDS = 90;
const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.85;

export interface MediaUploadItem {
  file: File;
  type: 'image' | 'video';
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  uploadedUrl?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Validate video duration (max 90 seconds)
 */
export function validateVideoDuration(file: File): Promise<{ valid: boolean; duration: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(video.src);
      resolve({ valid: duration <= MAX_VIDEO_DURATION_SECONDS, duration });
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve({ valid: false, duration: 0 });
    };
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimise image: resize to max dimension and compress as WebP/JPEG.
 * Has a 15-second timeout — returns original file if optimisation stalls.
 */
export async function optimiseImage(file: File): Promise<File> {
  const { width, height } = await getImageDimensions(file);

  // Skip if already small enough
  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION && file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (f: File) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve(f);
    };

    // Timeout: return original rather than freeze
    const timeout = setTimeout(() => {
      console.warn('[mediaUpload] Image optimisation timed out — using original');
      safeResolve(file);
    }, 15000);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
        const ratio = Math.min(MAX_IMAGE_DIMENSION / w, MAX_IMAGE_DIMENSION / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { safeResolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);

      // Try WebP first, fallback JPEG
      const tryFormat = (format: string, quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = format === 'image/webp' ? 'webp' : 'jpg';
              safeResolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: format }));
            } else if (format === 'image/webp') {
              tryFormat('image/jpeg', IMAGE_QUALITY);
            } else {
              safeResolve(file);
            }
          },
          format,
          quality
        );
      };

      tryFormat('image/webp', IMAGE_QUALITY);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      safeResolve(file);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload a single media item to storage
 */
export async function uploadMediaFile(
  userId: string,
  file: File,
  type: 'image' | 'video',
  onProgress?: (pct: number, stage: string) => void
): Promise<{ url: string; thumbnailUrl: string | null; width: number; height: number; duration: number | null; error: Error | null }> {
  try {
    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);

    if (type === 'image') {
      onProgress?.(10, 'Optimising image...');
      const optimised = await optimiseImage(file);
      const { width, height } = await getImageDimensions(optimised);

      onProgress?.(40, 'Uploading image...');
      const ext = optimised.name.split('.').pop() || 'jpg';
      const path = `${userId}/${timestamp}_${rand}.${ext}`;
      const { error } = await supabase.storage.from('post-images').upload(path, optimised);
      if (error) throw error;

      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      onProgress?.(100, 'Done');
      return { url: data.publicUrl, thumbnailUrl: null, width, height, duration: null, error: null };
    }

    // Video
    onProgress?.(5, 'Processing video...');
    const thumbnail = await generateVideoThumbnail(file);

    onProgress?.(20, 'Uploading video...');
    const ext = file.name.split('.').pop() || 'mp4';
    const videoPath = `${userId}/${timestamp}_${rand}.${ext}`;
    const { error: vidErr } = await supabase.storage.from('post-videos').upload(videoPath, file);
    if (vidErr) throw vidErr;

    const { data: vidData } = supabase.storage.from('post-videos').getPublicUrl(videoPath);

    let thumbUrl: string | null = null;
    if (thumbnail) {
      onProgress?.(80, 'Uploading thumbnail...');
      const thumbPath = `${userId}/${timestamp}_${rand}_thumb.jpg`;
      const { error: tErr } = await supabase.storage.from('post-images').upload(thumbPath, thumbnail);
      if (!tErr) {
        const { data: td } = supabase.storage.from('post-images').getPublicUrl(thumbPath);
        thumbUrl = td.publicUrl;
      }
    }

    // Get video dimensions/duration
    const meta = await getVideoMeta(file);
    onProgress?.(100, 'Done');
    return { url: vidData.publicUrl, thumbnailUrl: thumbUrl, width: meta.width, height: meta.height, duration: meta.duration, error: null };
  } catch (err) {
    return { url: '', thumbnailUrl: null, width: 0, height: 0, duration: null, error: err as Error };
  }
}

function getVideoMeta(file: File): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration });
      URL.revokeObjectURL(v.src);
    };
    v.onerror = () => {
      resolve({ width: 0, height: 0, duration: 0 });
      URL.revokeObjectURL(v.src);
    };
    v.src = URL.createObjectURL(file);
  });
}
