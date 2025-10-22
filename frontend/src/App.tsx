import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Pages
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProjectDetail from "./pages/ProjectDetail";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import MyProjects from "./pages/MyProjects";
import Publish from "./pages/Publish";
import EditProject from "./pages/EditProject";
import Intros from "./pages/Intros";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/u/:username" element={<UserProfile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/about" element={<About />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
              <Route path="/publish" element={<ProtectedRoute><Publish /></ProtectedRoute>} />
              <Route path="/project/:id/edit" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
              <Route path="/intros" element={<ProtectedRoute><Intros /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
