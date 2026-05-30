import { useState, useCallback, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PlayerContext, usePlayerProvider } from "@/hooks/useUnTunes";
import { UniversityAdminProvider } from "@/hooks/useUniversityAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SplashScreen } from "@/components/SplashScreen";
import AppLayout from "@/layouts/AppLayout";
import { FloatingMiniPlayer } from "@/components/untunes/FloatingMiniPlayer";
import { FloatingSessionTracker } from "@/components/tracker/FloatingSessionTracker";
import { FloatingZoneTimer } from "@/components/timer/FloatingZoneTimer";
import { usePresenceHeartbeat } from "@/hooks/usePresence";

/** Runs presence heartbeat inside BrowserRouter context */
function PresenceTracker() {
  usePresenceHeartbeat();
  return null;
}

/** Lazy-loading spinner shown while route chunks load */
function LazyFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Eagerly loaded (needed on first paint) ──────────────────────────
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

// ─── Lazy-loaded routes (code-split per chunk) ───────────────────────
const Social = lazy(() => import("./pages/Social"));
const Calculators = lazy(() => import("./pages/Calculators"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Mindset = lazy(() => import("./pages/Mindset"));
const MindsetBreathing = lazy(() => import("./pages/MindsetBreathing"));
const MindsetGames = lazy(() => import("./pages/MindsetGames"));
const Zone = lazy(() => import("./pages/Zone"));
const Programming = lazy(() => import("./pages/Programming"));
const Fuel = lazy(() => import("./pages/Fuel"));
const Help = lazy(() => import("./pages/Help"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Admin = lazy(() => import("./pages/Admin"));
const University = lazy(() => import("./pages/University"));
const UniversityLevel = lazy(() => import("./pages/UniversityLevel"));
const UniversityChapter = lazy(() => import("./pages/UniversityChapter"));
const UniversityAssessment = lazy(() => import("./pages/UniversityAssessment"));
const UniversityChapterQuiz = lazy(() => import("./pages/UniversityChapterQuiz"));
const UniversityCertificate = lazy(() => import("./pages/UniversityCertificate"));
const Profile = lazy(() => import("./pages/Profile"));
const ProgrammingLogs = lazy(() => import("./pages/ProgrammingLogs"));
const ProgrammingMyProgrammes = lazy(() => import("./pages/ProgrammingMyProgrammes"));
const ProgrammingCreate = lazy(() => import("./pages/ProgrammingCreate"));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary"));
const FuelHistory = lazy(() => import("./pages/FuelHistory"));
const FuelRecipes = lazy(() => import("./pages/FuelRecipes"));
const FuelPlanning = lazy(() => import("./pages/FuelPlanning"));
const FuelFoods = lazy(() => import("./pages/FuelFoods"));
const FuelMyFuel = lazy(() => import("./pages/FuelMyFuel"));
const TrackerMyProgrammes = lazy(() => import("./pages/TrackerMyProgrammes"));
const TrackerCreate = lazy(() => import("./pages/TrackerCreate"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Habits = lazy(() => import("./pages/Habits"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const MyCoaching = lazy(() => import("./pages/MyCoaching"));
const CoachProfileEdit = lazy(() => import("./pages/CoachProfileEdit"));
const CoachProfile = lazy(() => import("./pages/CoachProfile"));
const Coaches = lazy(() => import("./pages/Coaches"));
const CoachCommandCentre = lazy(() => import("./pages/CoachCommandCentre"));
const Founder = lazy(() => import("./pages/Founder"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Explore = lazy(() => import("./pages/Explore"));
const AITokens = lazy(() => import("./pages/AITokens"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Unbreakable86 = lazy(() => import("./pages/Unbreakable86"));
const UnTunes = lazy(() => import("./pages/UnTunes"));
const UnTunesTerms = lazy(() => import("./pages/UnTunesTerms"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));

const queryClient = new QueryClient();

function UnTunesPlayerProvider({ children }: { children: React.ReactNode }) {
  const player = usePlayerProvider();
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
}

const App = () => {
  const [splashDone, setSplashDone] = useState(() => {
    // Only show splash once per session
    try { return sessionStorage.getItem('splash_done') === '1'; } catch { return false; }
  });
  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
    try { sessionStorage.setItem('splash_done', '1'); } catch {}
  }, []);

  return (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UnTunesPlayerProvider>
      <UniversityAdminProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Sonner />
          <InstallPrompt />
          {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
          <BrowserRouter>
            <PresenceTracker />
            <Suspense fallback={<LazyFallback />}>
            <Routes>
              {/* Sign-in — standalone full-page (no bottom nav) */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Legacy /hub redirect (old PWA installs) */}
              <Route path="/hub" element={<Navigate to="/" replace />} />

              {/* All pages wrapped in AppLayout (provides bottom nav) */}
              <Route element={<AppLayout />}>
                {/* Index handles both logged-in hub and logged-out landing */}
                <Route path="/" element={<RouteErrorBoundary section="Home"><Index /></RouteErrorBoundary>} />
                <Route path="/social" element={
                  <ProtectedRoute><RouteErrorBoundary section="Social"><Social /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Founder page - pre-sign-in */}
                <Route path="/founder" element={<Founder />} />
                
                {/* Legal pages - public */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/explore" element={<Explore />} />
                
                {/* Onboarding wizard - mandatory for new users */}
                <Route path="/onboarding" element={<Onboarding />} />
                
                {/* Profile - free access (has membership tab) */}
                <Route path="/profile" element={
                  <ProtectedRoute><RouteErrorBoundary section="Profile"><Profile /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Unbreakable Tokens - token tier selection */}
                <Route path="/ai-tokens" element={
                  <ProtectedRoute><RouteErrorBoundary section="Tokens"><AITokens /></RouteErrorBoundary></ProtectedRoute>
                } />

                {/* Plans — legacy URL redirect */}
                <Route path="/plans" element={<Navigate to="/ai-tokens" replace />} />
                
                {/* Inbox - free (hub feature) */}
                <Route path="/inbox" element={
                  <ProtectedRoute><RouteErrorBoundary section="Inbox"><Inbox /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* User Profile - Public profile viewing */}
                <Route path="/user/:userId" element={<UserProfile />} />
                
                {/* ============ FREE TIER (logged in, no subscription) ============ */}
                
                {/* Calculators - free to drive engagement */}
                <Route path="/calculators" element={
                  <ProtectedRoute><RouteErrorBoundary section="Calculators"><Calculators /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* ============ SUBSCRIBED ROUTES (paid tier) ============ */}
                
                {/* Programming (Power) routes */}
                <Route path="/programming" element={
                  <ProtectedRoute><RouteErrorBoundary section="Power"><Programming /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/programming/create" element={
                  <ProtectedRoute><RouteErrorBoundary section="Power"><ProgrammingCreate /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/programming/my-programmes" element={
                  <ProtectedRoute><RouteErrorBoundary section="Power"><ProgrammingMyProgrammes /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/programming/logs" element={
                  <ProtectedRoute><RouteErrorBoundary section="Power"><ProgrammingLogs /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/programming/exercises" element={<RouteErrorBoundary section="Power"><ExerciseLibrary /></RouteErrorBoundary>} />
                
                {/* Tracker (Movement) routes */}
                <Route path="/tracker" element={
                  <ProtectedRoute><RouteErrorBoundary section="Movement"><Tracker /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/tracker/create" element={
                  <ProtectedRoute><RouteErrorBoundary section="Movement"><TrackerCreate /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/tracker/my-programmes" element={
                  <ProtectedRoute><RouteErrorBoundary section="Movement"><TrackerMyProgrammes /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Fuel routes */}
                <Route path="/fuel" element={
                  <ProtectedRoute><RouteErrorBoundary section="Fuel"><Fuel /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/fuel/history" element={
                  <ProtectedRoute><RouteErrorBoundary section="Fuel"><FuelHistory /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/fuel/recipes" element={
                  <ProtectedRoute><RouteErrorBoundary section="Fuel"><FuelRecipes /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/fuel/planning" element={
                  <ProtectedRoute><RouteErrorBoundary section="Fuel"><FuelPlanning /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/fuel/foods" element={
                  <ProtectedRoute><RouteErrorBoundary section="Fuel"><FuelFoods /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/fuel/my-fuel" element={
                  <ProtectedRoute><RouteErrorBoundary section="Fuel"><FuelMyFuel /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Mindset routes */}
                <Route path="/mindset" element={
                  <ProtectedRoute><RouteErrorBoundary section="Mindset"><Mindset /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/mindset/breathing" element={
                  <ProtectedRoute><RouteErrorBoundary section="Mindset"><MindsetBreathing /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/mindset/games" element={
                  <ProtectedRoute><RouteErrorBoundary section="Mindset"><MindsetGames /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/zone" element={
                  <ProtectedRoute><RouteErrorBoundary section="Mindset"><Zone /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Coaching (Help) — uses Unbreakable token system, not subscription */}
                <Route path="/help" element={
                  <ProtectedRoute><RouteErrorBoundary section="Coach"><Help /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* University */}
                <Route path="/university" element={
                  <ProtectedRoute><RouteErrorBoundary section="University"><University /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/university/:courseType/:level" element={
                  <ProtectedRoute><RouteErrorBoundary section="University"><UniversityLevel /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/university/:courseType/:level/:unit/:chapter" element={
                  <ProtectedRoute><RouteErrorBoundary section="University"><UniversityChapter /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/university/:courseType/:level/:unit/:chapter/quiz" element={
                  <ProtectedRoute><RouteErrorBoundary section="University"><UniversityChapterQuiz /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/university/:courseType/:level/:unit/assessment" element={
                  <ProtectedRoute><RouteErrorBoundary section="University"><UniversityAssessment /></RouteErrorBoundary></ProtectedRoute>
                } />
                <Route path="/university/:courseType/:level/certificate" element={
                  <ProtectedRoute><RouteErrorBoundary section="University"><UniversityCertificate /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Habits - free to build daily engagement */}
                <Route path="/habits" element={
                  <ProtectedRoute><RouteErrorBoundary section="Habits"><Habits /></RouteErrorBoundary></ProtectedRoute>
                } />

                <Route path="/unbreakable-86" element={
                  <ProtectedRoute><Unbreakable86 /></ProtectedRoute>
                } />

                {/* Un-Tunes — Music & Podcasts */}
                <Route path="/untunes" element={<RouteErrorBoundary section="Un-Tunes"><UnTunes /></RouteErrorBoundary>} />
                <Route path="/untunes/terms" element={<UnTunesTerms />} />
                <Route path="/achievements" element={<RouteErrorBoundary section="Achievements"><AchievementsPage /></RouteErrorBoundary>} />
                
                {/* Coach Dashboard - role-protected + subscribed */}
                <Route path="/coach" element={
                  <ProtectedRoute><RouteErrorBoundary section="Coach"><CoachDashboard /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Athlete coaching page */}
                <Route path="/my-coaching" element={<MyCoaching />} />
                <Route path="/coach-profile-edit" element={
                  <ProtectedRoute><CoachProfileEdit /></ProtectedRoute>
                } />
                <Route path="/coach/:userId" element={<CoachProfile />} />
                <Route path="/coaches" element={<Coaches />} />
                <Route path="/command-centre" element={
                  <ProtectedRoute><CoachCommandCentre /></ProtectedRoute>
                } />
                
                {/* Admin Dashboard - role-protected (dev only) */}
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
          <FloatingMiniPlayer />
          <FloatingSessionTracker />
          <FloatingZoneTimer />
        </div>
      </TooltipProvider>
      </UniversityAdminProvider>
      </UnTunesPlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
