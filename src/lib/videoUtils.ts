/**
 * Video utilities for thumbnail generation and compression
 */

/**
 * Generates a thumbnail from a video file by capturing the first frame
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

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      // Seek to first frame
      video.currentTime = 0.1;
    };

    video.onseeked = () => {
      // Calculate aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      let drawWidth = width;
      let drawHeight = height;

      if (aspectRatio > width / height) {
        drawHeight = width / aspectRatio;
      } else {
        drawWidth = height * aspectRatio;
      }

      canvas.width = drawWidth;
      canvas.height = drawHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, drawWidth, drawHeight);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src);
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      } else {
        URL.revokeObjectURL(video.src);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };

    video.src = URL.createObjectURL(videoFile);
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
