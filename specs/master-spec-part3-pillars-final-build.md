# UNBREAKABLE MASTER SPEC — PART 3 OF 4
## ALL PILLARS: FINAL BUILD STATE
*Everything in this section = what the pillar looks like when it's fully complete. Not MVP. Final.*

---

## POWER — FINAL BUILD
**Currently:** Exercise library live with GIFs ✅ · Session logging ✅ · Floating session pill ✅
**Still needed (16h):**
- PB detection on every set log → PBCardModal fires (from Part 1)
- Programme adherence score: (sessions completed / planned) × 100 shown on home card
- Volume tracking dashboard: 1RM trend charts, weekly volume bar chart, muscle group heatmap
- Rest timer: 90s countdown after each set, pre-seeded coaching tip for next set (no tokens)
- Session Flow Mode: nav dims, Un-Tunes auto-starts Power playlist, next exercise previewed
- Exercise swap suggestions: user marks exercise unavailable → 3 alternatives from `exercise_alternatives` table (pre-computed, no AI call)
- Post-session coach feedback: structured review in AI Chat (not just notification) — volume, PBs, RPE avg, coach note

---

## FUEL — FINAL BUILD
**Currently:** Food diary partially built · AI Snap exists · Water tracker noted
**Still needed (12h):**
- MacroRing SVG component surfaced as Fuel page hero (already built in specs above)
- Auto-nutrition calc targets surfaced as persistent card (targets from onboarding visible at all times)
- Natural language quick-log: "2 eggs, toast, coffee" → `analyse-food-nlp` → macros → 1 tap to log
- Meal templates: 12 saved meal bundles, 1-tap re-log
- Barcode scanner: Quagga2 integration → Open Food Facts lookup
- Food search: USDA + Open Food Facts stacked APIs with debounce + caching
- AI Snap → LOG THIS MEAL creates `food_logs` record (confirm this works end to end)
- Water tracker: 10-glass tracker with 2pm push if behind
- Meal timing intelligence: "You train at 6pm — eat by 4:30pm" (pure calculation, no AI)
- Weekly nutrition score trend: 7-day line chart

---

## MOVEMENT — FINAL BUILD
**Currently:** Cardio tracker with floating pill ✅ · Wake Lock ✅
**Still needed (10h):**
- Cardio history tab on the Movement page
- Weekly cardio summary: total km / time / calories
- Pace per km split tracking for runs
- Pace zone display during live session (colour-coded zones, Web Speech API audio cue)
- Coach feedback on cardio session completion (same as gym sessions)
- Kudos system on Social activity posts (tap to kudos, push notification)

---

## MINDSET — FINAL BUILD
**Currently:** Games ✅ · Breathwork exists · Habits exist
**Still needed (10h):**
- Daily check-in sliders: mood / energy / sleep quality (10-emoji + sliders)
- Auto-fill ALL habit types on logged activity — not just Train (Fuel on meal log, Sleep on sleep log, Water on water tracker)
- Breathwork library as hero section, not buried — Unbreakable Power Breathing as featured
- Habit perfect day celebration: confetti + "PERFECT DAY 🧱" full screen + social share prompt
- 30-day mood heatmap calendar with AI pattern detection after 7+ days
- Journal streak counter + AI private insight after 7 consecutive entries
- Sleep score feeding into next morning's home greeting
- Mindset Guide 04 upsell tab (guide is built, purchase flow not wired)
- `generate-affirmation` — confirm it's cached per day in `daily_checkins`, not re-firing on every page load

---

## GAMES — FINAL BUILD
**Currently:** All 9 games built ✅ · Leaderboards built ✅ · Stage progressions slowed ✅
**Still needed (8h):**
- Run pending Supabase migration (game score tables) — 5 minutes, blocking leaderboards
- ZONE streak → Supabase (from localStorage)
- Full theme reworks 1×1: Unbreakable neon + 90s/00s arcade aesthetic (each game a full rework)
- Daily challenge system: new challenge per game each midnight, push at 9am
- XP system: score/10 base + challenge bonus + PB bonus + login streak → user level 1–100
- Focus Score: RECALL + LOCK IN + SOLVE composite → shown on Mindset page

---

## UN-TUNES — FINAL BUILD
**Currently:** Player ✅ · Artist upload ✅ · Lock screen controls ✅ · Floating pill ✅
**Still needed (20h):**
- Queue / Up Next with drag-reorder
- Playback speed control (0.75x / 1x / 1.25x / 1.5x)
- Sleep timer (15/30/45/60 min) — critical for Mindset/sleep use case
- Artist Analytics Dashboard (plays, likes, followers, track performance)
- Smart Playlist generator: auto-playlist by BPM/genre on session type start
- Recently Played tab in Library
- Session-synced music: gym session start → Un-Tunes auto-detects session type → auto-starts BPM-matched playlist → fades out 60s after session ends
- Story multi-item share bug: each post item → own story page (still open)
- Branded image as default external share (not separate button)
- OG image for Un-Tunes track URLs (Vercel dynamic image endpoint)
- Podcast system: shows + episodes + show notes + playback speed + subscribe
- `tracks` table needs `bpm` column if missing (required for smart playlists)
- Artist monetisation: 0.01 tokens per stream credited to artist account

---

## UNIVERSITY — FINAL BUILD
**Currently:** Courses exist ✅ · Stripe price IDs wired ✅ · 10 guides v8 complete ✅
**Still needed (14h):**
- 621MB images → Supabase Storage CDN (critical — in Performance fixes above)
- PDF guide upsell tabs inside each course — Stripe checkout wired → purchase → PDF accessible in profile
- Guide tasting: first 3 pages preview, blurred-bottom, unlock CTA
- Course progress tracking: % complete per user, visible on course card
- Completion certificate: PDF generated → email via Resend
- L2→L3→L4 certification journey map visual on University home
- Quiz retry with targeted practice: fail → AI identifies weak topics → 3 targeted practice questions before full quiz unlocks
- Community discussion thread per course (SKOOL-style)
- 35 remaining guides to be built (Nutrition/Training/Sport/Mindset/PT Business)

---

## AI CHAT — FINAL BUILD
**Currently:** Chat works but starts cold · No token meter · No delete · Poor layout
**Still needed (12h):**
- Chat 2.0 full redesign: dark Unbreakable theme, pillar category tabs, coach name in header
- Delete chat button confirmed live per nav item
- Token counter visible inside chat UI — coloured bar, low-token warning at 5
- Coaching profile context loaded at every session start (currently unconfirmed)
- Quick-prompt suggestions per pillar for new users
- Voice-to-chat: microphone button → Web Speech API transcription → sent as text
- `ai_interactions` tracking table: log every AI call (function name, tokens, pillar, user_id)
- Proactive coach messages: after 3 days no training / after PB / after lowest mood / Monday briefing

---

## SOCIAL — FINAL BUILD
**Currently:** Feed ✅ · Stories ✅ · Timeline exists
**Still needed (10h):**
- Multi-item story share: each post item → own story page (still open)
- Meta Business API wired: automated posting + audience insights
- OG image for timeline post URLs
- Discover/explore feed tab alongside following feed
- Hashtag support + content type filtering
- Post content pillar tagging (💪⛽🧠🏃🎓🧡)
- Auto-generated post template after key events (PB, session complete, habit streak)

---

## COACH PROFILE — FINAL BUILD
**Currently:** Pricing + availability calendar built ✅ · 1-to-1 session lengths ✅
**Still needed (8h):**
- Public coach profile (`/coach/:userId`) showing new pricing breakdown card + Book a Session CTA
- Session booking flow: calendar → Stripe checkout → calendar event → 30-min reminder push
- Automated PT weekly check-in: `pt-client-insight` fires Friday for all active clients → push to PT
- Coach rating system: 1–5 stars after each session → visible on public profile
- Coach Discovery marketplace tab in University
- JJ's L3/L4 certs visible on his public profile
- Client dashboard: adherence %, last session, mood score, streak, 5-day no-login alert

---

## HOME DASHBOARD — FINAL BUILD
**Currently:** Basic hub · Trial banner missing · No daily snapshot
**Still needed (6h):**
- Trial countdown banner surfaced (isTrialing tracked but never shown)
- Adaptive daily hero message (time + streak + habit state)
- Pillar progress rings on each pillar card
- Weekly summary card every Monday morning
- Streak-at-risk warning after 8pm if 7+ day streak and nothing logged
- Progressive profile completion % shown + deep links to incomplete fields

---

## SETTINGS — FINAL BUILD
**Still needed (3h):**
- Spotify OAuth section removed
- GDPR: data export + account deletion
- Notification preferences UI (categories on/off)
- Referral link generator
- Trial status in subscription view

---

## LEGAL — FINAL BUILD (before any paying users) (4h)
- `/privacy` page — UK GDPR compliant, health data special category basis stated
- `/terms` page — subscription terms, AI disclaimer, age requirement
- `/cookies` page — what fires and when
- Cookie consent banner before any analytics (Sentry, Vercel Analytics) fire
- Age confirmation at signup (confirm 16+/18+)
- Explicit consent checkbox for health data at signup

---

## HOUR ESTIMATES SUMMARY
| Pillar         | Hours |
|---------------|-------|
| Power          | 16    |
| Fuel           | 12    |
| Movement       | 10    |
| Mindset        | 10    |
| Games          | 8     |
| Un-Tunes       | 20    |
| University     | 14    |
| AI Chat        | 12    |
| Social         | 10    |
| Coach Profile  | 8     |
| Home Dashboard | 6     |
| Settings       | 3     |
| Legal          | 4     |
| **TOTAL**      | **133** |

---
*⚡ LIVE WITHOUT LIMITS™ ©UNBREAKABLE LTD — Master Spec Part 3 of 4*
