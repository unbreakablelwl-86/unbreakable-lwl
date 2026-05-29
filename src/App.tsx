import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PlayerContext, usePlayerProvider } from "@/hooks/useUnTunes";
import { UniversityAdminProvider } from "@/hooks/useUniversityAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SplashScreen } from "@/components/SplashScreen";
import AppLayout from "@/layouts/AppLayout";
import { FloatingMiniPlayer } from "@/components/untunes/FloatingMiniPlayer";
import { FloatingSessionTracker } from "@/components/tracker/FloatingSessionTracker";
import { FloatingZoneTimer } from "@/components/timer/FloatingZoneTimer";
import Index from "./pages/Index";
import Social from "./pages/Social";
import Calculators from "./pages/Calculators";
import Tracker from "./pages/Tracker";
import Mindset from "./pages/Mindset";
import MindsetBreathing from "./pages/MindsetBreathing";
import MindsetGames from "./pages/MindsetGames";
import Zone from "./pages/Zone";
import Programming from "./pages/Programming";
import Fuel from "./pages/Fuel";
import Help from "./pages/Help";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import University from "./pages/University";
import UniversityLevel from "./pages/UniversityLevel";
import UniversityChapter from "./pages/UniversityChapter";
import UniversityAssessment from "./pages/UniversityAssessment";
import UniversityChapterQuiz from "./pages/UniversityChapterQuiz";
import UniversityCertificate from "./pages/UniversityCertificate";

// New modular sub-pages
import Profile from "./pages/Profile";
import ProgrammingLogs from "./pages/ProgrammingLogs";
import ProgrammingMyProgrammes from "./pages/ProgrammingMyProgrammes";
import ProgrammingCreate from "./pages/ProgrammingCreate";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import FuelHistory from "./pages/FuelHistory";
import FuelRecipes from "./pages/FuelRecipes";
import FuelPlanning from "./pages/FuelPlanning";
import FuelFoods from "./pages/FuelFoods";
import FuelMyFuel from "./pages/FuelMyFuel";
import TrackerMyProgrammes from "./pages/TrackerMyProgrammes";
import TrackerCreate from "./pages/TrackerCreate";
import UserProfile from "./pages/UserProfile";
import Onboarding from "./pages/Onboarding";
import Habits from "./pages/Habits";
import CoachDashboard from "./pages/CoachDashboard";
import MyCoaching from "./pages/MyCoaching";
import CoachProfileEdit from "./pages/CoachProfileEdit";
import CoachProfile from "./pages/CoachProfile";
import Coaches from "./pages/Coaches";
import CoachCommandCentre from "./pages/CoachCommandCentre";
// Plans removed — /plans redirects inline to /ai-tokens
import Founder from "./pages/Founder";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Explore from "./pages/Explore";
import AITokens from "./pages/AITokens";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unbreakable86 from "./pages/Unbreakable86";
import UnTunes from "./pages/UnTunes";
import UnTunesTerms from "./pages/UnTunesTerms";
import AchievementsPage from "./pages/AchievementsPage";
// import SpotifyCallback from "./pages/SpotifyCallback"; // parked

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
                {/* <Route path="/callback/spotify" element={<SpotifyCallback />} /> */}
                
                {/* Coach Dashboard - role-protected + subscribed */}
                <Route path="/coach" element={
                  <ProtectedRoute><RouteErrorBoundary section="Coach"><CoachDashboard /></RouteErrorBoundary></ProtectedRoute>
                } />
                
                {/* Athlete coaching page */}
                <Route path="/my-coaching" element={
                  <MyCoaching />
                } />
                <Route path="/coach-profile-edit" element={
                  <ProtectedRoute><CoachProfileEdit /></ProtectedRoute>
                } />
                <Route path="/coach/:userId" element={
                  <CoachProfile />
                } />
                <Route path="/coaches" element={
                  <Coaches />
                } />
                <Route path="/command-centre" element={
                  <ProtectedRoute><CoachCommandCentre /></ProtectedRoute>
                } />
                
                {/* Admin Dashboard - Hidden, role-protected */}
                <Route path="/admin" element={<Admin />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
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
