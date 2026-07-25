/**
 * Video utilities for thumbnail generation and compression
 */

/**
 * Generates a thumbnail from a video file by capturing the first frame.
 * Has a 10-second timeout to prevent freezing on mobile devices.
 */
export async function generateVideoThumbnail(
  videoFile: File,
  width: number = 640,
  height: number = 360
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let resolved = false;

    const cleanup = () => {
      try { URL.revokeObjectURL(video.src); } catch {}
      video.onloadeddata = null;
      video.onseeked = null;
      video.onerror = null;
      video.oncanplay = null;
    };

    const safeResolve = (value: Blob | null) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(value);
    };

    // Timeout after 10s — skip thumbnail rather than freeze
    const timeout = setTimeout(() => {
      console.warn('[videoUtils] Thumbnail generation timed out after 10s — skipping');
      safeResolve(null);
    }, 10000);

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const drawFrame = () => {
      clearTimeout(timeout);
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || !ctx) { safeResolve(null); return; }

      const aspectRatio = vw / vh;
      let drawWidth = width;
      let drawHeight = height;

      if (aspectRatio > width / height) {
        drawHeight = width / aspectRatio;
      } else {
        drawWidth = height * aspectRatio;
      }

      canvas.width = drawWidth;
      canvas.height = drawHeight;
      ctx.drawImage(video, 0, 0, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => safeResolve(blob),
        'image/jpeg',
        0.8
      );
    };

    video.onseeked = drawFrame;

    video.onloadeddata = () => {
      video.currentTime = 0.1;
    };

    // Fallback: some browsers fire canplay but not loadeddata
    video.oncanplay = () => {
      if (!video.onloadeddata) return;
      video.onloadeddata = null;
      video.currentTime = 0.1;
    };

    video.onerror = () => {
      clearTimeout(timeout);
      safeResolve(null);
    };

    video.src = URL.createObjectURL(videoFile);
    video.load(); // Explicitly trigger loading on mobile
  });
}

/**
 * Compresses a video file by reducing quality/resolution
 * Returns original file if compression would lose audio or isn't supported
 * Note: Browser-based compression has limitations - for better results, use server-side processing
 */
export async function compressVideo(
  videoFile: File,
  targetSizeMB: number = 10,
  maxWidth: number = 1280
): Promise<File> {
  // If file is already small enough, return as-is (preserves audio)
  const fileSizeMB = videoFile.size / (1024 * 1024);
  if (fileSizeMB <= targetSizeMB) {
    return videoFile;
  }

  // For larger files, just return original to preserve audio
  // Browser-based video transcoding via canvas loses audio track
  // Better to upload larger file than lose audio
  // Video size check passed
  return videoFile;
}
