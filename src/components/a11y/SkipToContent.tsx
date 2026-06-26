/**
 * Invisible skip link — appears on Tab focus for keyboard/screen-reader users.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-display focus:tracking-wide focus:text-sm focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
