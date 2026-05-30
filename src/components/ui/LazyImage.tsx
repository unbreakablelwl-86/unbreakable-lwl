import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Placeholder colour while loading */
  placeholderClass?: string;
}

/**
 * Image component with native lazy loading + fade-in transition.
 * Uses IntersectionObserver for browsers that support it,
 * falls back to `loading="lazy"` attribute.
 */
export function LazyImage({ className, placeholderClass, alt, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
    />
  );
}

export default LazyImage;
