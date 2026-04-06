

# Dumbbell Like Button with Floating Animation

## What's changing

### 1. Replace Heart with Dumbbell icon on all feed like buttons
All three card types currently use `Heart` — swap to `Dumbbell` from lucide-react. Remove all text labels ("Kudos", "Likes") — the button shows only the dumbbell icon + count number.

### 2. Floating dumbbell animation on like
When a user taps the like button, spawn 3-5 small dumbbell icons that float upward from the button area with a smooth arc, slight horizontal drift, rotation, and fade-out. Uses framer-motion `AnimatePresence`. Each dumbbell gets a randomized x-offset and rotation for organic feel. Animation lasts ~1s, much cleaner than the previous heart burst.

## Files to edit

| File | Changes |
|------|---------|
| `src/components/tracker/ActivityCard.tsx` | Replace `Heart` import with `Dumbbell`. Change like button to icon-only + count (no "Kudos" text). Add floating dumbbell animation on click. |
| `src/components/tracker/StatusCard.tsx` | Same — replace `Heart` with `Dumbbell`, icon-only + count, add floating animation. |
| `src/components/hub/WorkoutCard.tsx` | Same — `Heart` to `Dumbbell` in kudos button, icon-only + count, add floating animation. |

## Animation design
- On like: 4 tiny dumbbell icons spawn at button position
- Each floats upward with `y: -80` to `y: -160`, random `x` drift (-30 to +30), `rotate` 0-360
- Opacity fades from 1 to 0
- Duration: 0.8s with staggered delays (0, 0.1, 0.2, 0.3)
- Uses `AnimatePresence` + absolute positioning relative to the card
- Icons use primary orange color
- Auto-cleanup after animation completes

## Button layout (all cards)
```
[🏋️ 12]  [💬 3]  [↗ Share]
```
Dumbbell icon + count only, no word labels. Filled orange when liked.

