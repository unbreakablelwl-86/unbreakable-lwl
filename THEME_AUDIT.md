# Theme Consistency Audit — 2026-05-23

## Gold Standard: Mindset Tab (confirmed by user screenshots)
- Dark `#080808` background
- Cards: `bg-[#111]`, `border-gray-800`, `rounded-xl`
- Icons: `#FF5500` with `drop-shadow(0 0 6px rgba(255,85,0,0.5))`
- Text: white headings, `text-gray-400`/`text-gray-500` secondary
- Section headers: `text-xs font-display tracking-wider text-gray-400`
- Hero: centered, radial gradient glow, `text-2xl tracking-wider`
- Tab bar: pill-shaped, `rounded-full`, `border-[#FF5500]/30` active
- NO white/cream backgrounds, NO `neon-border-subtle`, NO `bg-card`

## Hub Pages — ✅ DONE (matching Mindset)
- [x] Mindset.tsx
- [x] Programming.tsx (Power hub)
- [x] Fuel.tsx (Fuel hub)
- [x] Tracker.tsx (Movement hub)
- [x] HomeDashboard (Home)
- [x] AppLayout (bottom nav, theme toggle)
- [x] SplashScreen (auth prompt)

## Sub-Components — ❌ STILL OLD 1.0 THEME (need rework)

### Fuel Sub-Components
- [ ] `components/fuel/FoodTracker.tsx` (591 lines) — white Card, `neon-border-subtle`, `text-primary`
- [ ] `components/fuel/FoodLibrary.tsx` — likely old theme
- [ ] `components/fuel/SnapTrack.tsx` — likely old theme
- [ ] `components/fuel/BarcodeScanner.tsx`
- [ ] `components/fuel/NutritionCoachCTA.tsx`
- [ ] `components/fuel/MealPlanBuilder.tsx`
- [ ] `components/fuel/RecipeLibrary.tsx`
- [ ] `components/fuel/StoreCupboard.tsx`

### Power Sub-Components
- [ ] `components/programming/ProgrammeBuilder.tsx` — old create flow
- [ ] `components/programming/ManualProgramBuilder.tsx`
- [ ] `components/programming/ExerciseLibraryModal.tsx`
- [ ] `components/programming/AddExerciseSheet.tsx`
- [ ] `components/programming/ActiveWorkoutModal.tsx`
- [ ] `components/programming/SessionLoggingView.tsx`
- [ ] `components/programming/InlineExerciseLibrary.tsx`
- [ ] `components/programming/InlineProgramEditor.tsx`
- [ ] `components/programming/ProgrammeExecutionView.tsx`
- [ ] `components/programming/ScrollableExerciseLibrary.tsx`

### Shared / Settings
- [ ] `components/settings/SettingsPanel.tsx`
- [ ] `components/NavigationDrawer.tsx` — More menu (this looks OK per screenshot)
- [ ] `components/ai/AICoachChat.tsx` — may need dark treatment
- [ ] `components/landing/LandingPage.tsx` — guest landing

### Movement Sub-Components
- [ ] `components/tracker/CardioTrackerModal.tsx` — popup selector needs neon rework
- [ ] `components/tracker/AuthModal.tsx`

## Approach
1. Find all files using old patterns: `neon-border-subtle`, `bg-card`, unstyled `<Card>`, `text-primary`
2. Replace with Mindset standard: `bg-[#111] border-gray-800`, `text-[#FF5500]`
3. Test build after each batch
4. Priority: Fuel tracker, Power builder, then remaining
