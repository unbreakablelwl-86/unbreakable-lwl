/**
 * Generate a branded UNBREAKABLE social share card image (1080×1920)
 * Works for posts, stories, workouts — anything shareable to Instagram etc.
 */

interface ShareCardOptions {
  /** Main headline text */
  title: string;
  /** Subtitle / secondary text */
  subtitle?: string;
  /** Body text content */
  body?: string;
  /** Image URL to feature (post image, cover art, etc.) */
  imageUrl?: string;
  /** Card type label shown at top */
  label?: string;
  /** Stats to show (e.g. duration, sets, reps) */
  stats?: Array<{ label: string; value: string }>;
  /** Hashtags */
  hashtags?: string;
}

export async function generateSocialShareCard(opts: ShareCardOptions): Promise<Blob | null> {
  const {
    title,
    subtitle,
    body,
    imageUrl,
    label = 'UNBREAKABLE',
    stats,
    hashtags = '#Unbreakable #LiveWithoutLimits #KeepShowingUp',
  } = opts;

  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Dark gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0A0A0A');
  grad.addColorStop(0.4, '#111111');
  grad.addColorStop(1, '#0A0A0A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle orange radial glow at top
  const glow = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, 500);
  glow.addColorStop(0, 'rgba(255, 85, 0, 0.15)');
  glow.addColorStop(1, 'rgba(255, 85, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 700);

  let y = 120;

  // Label badge at top
  ctx.fillStyle = 'rgba(255, 85, 0, 0.15)';
  const labelText = label.toUpperCase();
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  const labelW = ctx.measureText(labelText).width + 40;
  ctx.beginPath();
  ctx.roundRect((W - labelW) / 2, y, labelW, 48, 24);
  ctx.fill();
  ctx.fillStyle = '#FF5500';
  ctx.textAlign = 'center';
  ctx.fillText(labelText, W / 2, y + 33);
  y += 90;

  // Featured image (if provided)
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const imgSize = 480;
      const ix = (W - imgSize) / 2;
      const iy = y;

      // Orange glow behind image
      ctx.shadowColor = 'rgba(255, 85, 0, 0.4)';
      ctx.shadowBlur = 60;
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(ix, iy, imgSize, imgSize, 24);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Clip and draw image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(ix, iy, imgSize, imgSize, 24);
      ctx.clip();
      ctx.drawImage(img, ix, iy, imgSize, imgSize);
      ctx.restore();

      y = iy + imgSize + 60;
    } catch {
      y += 20;
    }
  }

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
  const titleLines = wrapText(ctx, title, W - 120);
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += 68;
  }
  y += 10;

  // Subtitle
  if (subtitle) {
    ctx.fillStyle = '#FF5500';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(subtitle, W / 2, y);
    y += 50;
  }

  // Body text
  if (body) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    const bodyLines = wrapText(ctx, body, W - 160);
    for (const line of bodyLines.slice(0, 6)) {
      ctx.fillText(line, W / 2, y);
      y += 38;
    }
    y += 20;
  }

  // Stats row
  if (stats && stats.length > 0) {
    y += 10;
    const statW = Math.min(200, (W - 120) / stats.length);
    const startX = (W - statW * stats.length) / 2 + statW / 2;
    stats.forEach((stat, i) => {
      const sx = startX + i * statW;
      ctx.fillStyle = '#FF5500';
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat.value, sx, y);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '22px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat.label.toUpperCase(), sx, y + 30);
    });
    y += 70;
  }

  // Divider line
  y += 20;
  ctx.strokeStyle = 'rgba(255, 85, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, y);
  ctx.lineTo(W * 0.8, y);
  ctx.stroke();
  y += 40;

  // UNBREAKABLE branding
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillText('UNBREAKABLE', W / 2, y);
  y += 32;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '22px system-ui, -apple-system, sans-serif';
  ctx.fillText('LIVE WITHOUT LIMITS', W / 2, y);
  y += 50;

  // Hashtags
  if (hashtags) {
    ctx.fillStyle = 'rgba(255, 85, 0, 0.6)';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    const hashLines = wrapText(ctx, hashtags, W - 120);
    for (const line of hashLines.slice(0, 2)) {
      ctx.fillText(line, W / 2, y);
      y += 30;
    }
  }

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/** Share a generated card to Instagram / socials via Web Share API or download */
export async function shareSocialCard(blob: Blob, filename = 'unbreakable-share.png') {
  const file = new File([blob], filename, { type: 'image/png' });

  // Try Web Share API with files (works on mobile Safari/Chrome)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (e: any) {
      if (e.name === 'AbortError') return false;
    }
  }

  // Fallback: download the image
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
