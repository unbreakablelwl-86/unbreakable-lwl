/**
 * University course routing helpers.
 *
 * University courses are no longer sold individually with tokens — access
 * is subscription-only (see useCourseAccess.tsx, "post-paywall removal").
 * The old per-course/bundle token pricing (including Level 1 and Level 4
 * and sport-specific courses, none of which are live/sellable) has been
 * removed along with CoursePurchaseGate.tsx, which rendered it.
 *
 * Training Guides (PDF downloads) are a separate, still-live token
 * purchase — see guideData.ts / GuideCard.tsx / purchase-course-with-coins.
 */

/**
 * Convert route params (courseType + levelNum) → course key.
 * Examples:
 *   ('gym', 2)         → 'gym_l2'
 *   ('nutrition', 3)   → 'nutrition_l3'
 *   ('sport-football')  → 'sport_football'   (level ignored for sport)
 */
export function toCourseKey(courseType: string, levelNum?: number): string {
  if (courseType.startsWith('sport-')) {
    return courseType.replace('-', '_');
  }
  return `${courseType}_l${levelNum ?? 2}`;
}
