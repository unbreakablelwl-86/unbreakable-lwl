import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UniversityAdminProvider } from "@/hooks/useUniversityAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Calculators from "./pages/Calculators";
import Tracker from "./pages/Tracker";
import Mindset from "./pages/Mindset";
import MindsetBreathing from "./pages/MindsetBreathing";
import MindsetGames from "./pages/MindsetGames";
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
import Plans from "./pages/Plans";
import Founder from "./pages/Founder";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AITokens from "./pages/AITokens";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UniversityAdminProvider>
      <TooltipProvider>
        <div className="brick-texture min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Index handles both logged-in hub and logged-out landing */}
              <Route path="/" element={<Index />} />
              
              {/* Founder page - pre-sign-in */}
              <Route path="/founder" element={<Founder />} />
              
              {/* Legal pages - public */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Onboarding wizard - mandatory for new users */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Profile - free access (has membership tab) */}
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              
              {/* Unbreakable Tokens - token tier selection */}
              <Route path="/ai-tokens" element={
                <ProtectedRoute><AITokens /></ProtectedRoute>
              } />

              {/* Plans - subscription selection */}
              <Route path="/plans" element={
                <ProtectedRoute><Plans /></ProtectedRoute>
              } />
              
              {/* Inbox - free (hub feature) */}
              <Route path="/inbox" element={
                <ProtectedRoute><Inbox /></ProtectedRoute>
              } />
              
              {/* User Profile - Public profile viewing */}
              <Route path="/user/:userId" element={<UserProfile />} />
              
              {/* ============ FREE TIER (logged in, no subscription) ============ */}
              
              {/* Calculators - free to drive engagement */}
              <Route path="/calculators" element={
                <ProtectedRoute><Calculators /></ProtectedRoute>
              } />
              
              {/* ============ SUBSCRIBED ROUTES (paid tier) ============ */}
              
              {/* Programming (Power) routes */}
              <Route path="/programming" element={
                <ProtectedRoute><Programming /></ProtectedRoute>
              } />
              <Route path="/programming/create" element={
                <ProtectedRoute><ProgrammingCreate /></ProtectedRoute>
              } />
              <Route path="/programming/my-programmes" element={
                <ProtectedRoute><ProgrammingMyProgrammes /></ProtectedRoute>
              } />
              <Route path="/programming/logs" element={
                <ProtectedRoute><ProgrammingLogs /></ProtectedRoute>
              } />
              
              {/* Tracker (Movement) routes */}
              <Route path="/tracker" element={
                <ProtectedRoute><Tracker /></ProtectedRoute>
              } />
              <Route path="/tracker/create" element={
                <ProtectedRoute><TrackerCreate /></ProtectedRoute>
              } />
              <Route path="/tracker/my-programmes" element={
                <ProtectedRoute><TrackerMyProgrammes /></ProtectedRoute>
              } />
              
              {/* Fuel routes */}
              <Route path="/fuel" element={
                <ProtectedRoute><Fuel /></ProtectedRoute>
              } />
              <Route path="/fuel/history" element={
                <ProtectedRoute><FuelHistory /></ProtectedRoute>
              } />
              <Route path="/fuel/recipes" element={
                <ProtectedRoute><FuelRecipes /></ProtectedRoute>
              } />
              <Route path="/fuel/planning" element={
                <ProtectedRoute><FuelPlanning /></ProtectedRoute>
              } />
              <Route path="/fuel/foods" element={
                <ProtectedRoute><FuelFoods /></ProtectedRoute>
              } />
              <Route path="/fuel/my-fuel" element={
                <ProtectedRoute><FuelMyFuel /></ProtectedRoute>
              } />
              
              {/* Mindset routes */}
              <Route path="/mindset" element={
                <ProtectedRoute><Mindset /></ProtectedRoute>
              } />
              <Route path="/mindset/breathing" element={
                <ProtectedRoute><MindsetBreathing /></ProtectedRoute>
              } />
              <Route path="/mindset/games" element={
                <ProtectedRoute><MindsetGames /></ProtectedRoute>
              } />
              
              {/* Coaching (Help) — uses Unbreakable token system, not subscription */}
              <Route path="/help" element={
                <ProtectedRoute><Help /></ProtectedRoute>
              } />
              
              {/* University */}
              <Route path="/university" element={
                <ProtectedRoute><University /></ProtectedRoute>
              } />
              <Route path="/university/:courseType/:level" element={
                <ProtectedRoute><UniversityLevel /></ProtectedRoute>
              } />
              <Route path="/university/:courseType/:level/:unit/:chapter" element={
                <ProtectedRoute><UniversityChapter /></ProtectedRoute>
              } />
              <Route path="/university/:courseType/:level/:unit/:chapter/quiz" element={
                <ProtectedRoute><UniversityChapterQuiz /></ProtectedRoute>
              } />
              <Route path="/university/:courseType/:level/:unit/assessment" element={
                <ProtectedRoute><UniversityAssessment /></ProtectedRoute>
              } />
              <Route path="/university/:courseType/:level/certificate" element={
                <ProtectedRoute><UniversityCertificate /></ProtectedRoute>
              } />
              
              {/* Habits - free to build daily engagement */}
              <Route path="/habits" element={
                <ProtectedRoute><Habits /></ProtectedRoute>
              } />
              
              {/* Coach Dashboard - role-protected + subscribed */}
              <Route path="/coach" element={
                <ProtectedRoute><CoachDashboard /></ProtectedRoute>
              } />
              
              {/* Athlete coaching page */}
              <Route path="/my-coaching" element={
                <MyCoaching />
              } />
              
              {/* Admin Dashboard - Hidden, role-protected */}
              <Route path="/admin" element={<Admin />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
      </UniversityAdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
