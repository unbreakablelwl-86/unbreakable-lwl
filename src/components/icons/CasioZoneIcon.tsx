/**
 * Retro 90s Casio-style digital watch icon — UNBREAKABLE ZONE
 * Used as bottom-nav icon for the focus/switch-off timer.
 * Mimics the chunky G-Shock silhouette with a digital display.
 */
import { forwardRef, type SVGProps } from "react";

const CasioZoneIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Watch band top */}
      <path d="M8 2 v4" />
      <path d="M16 2 v4" />
      {/* Watch band bottom */}
      <path d="M8 18 v4" />
      <path d="M16 18 v4" />
      {/* Chunky outer case (G-Shock style rounded rectangle) */}
      <rect x="4" y="5" width="16" height="14" rx="3" ry="3" />
      {/* Inner bezel */}
      <rect x="6.5" y="7.5" width="11" height="9" rx="1.5" ry="1.5" strokeWidth="1" />
      {/* Digital display — time-like segments */}
      <text
        x="12"
        y="13.8"
        textAnchor="middle"
        fontSize="5"
        fontFamily="monospace"
        fontWeight="bold"
        fill="currentColor"
        stroke="none"
        letterSpacing="0.5"
      >
        ZONE
      </text>
      {/* Side buttons */}
      <line x1="3" y1="9" x2="4" y2="9" strokeWidth="2" />
      <line x1="3" y1="15" x2="4" y2="15" strokeWidth="2" />
      <line x1="20" y1="12" x2="21" y2="12" strokeWidth="2" />
    </svg>
  )
);

CasioZoneIcon.displayName = "CasioZoneIcon";
export default CasioZoneIcon;
