import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import DashboardPage from "@/pages/admin/DashboardPage";
import EventsListPage from "@/pages/admin/EventsListPage";
import CreateEventPage from "@/pages/admin/CreateEventPage";
import EditEventPage from "@/pages/admin/EditEventPage";
import EventDetailPage from "@/pages/admin/EventDetailPage";
import OrganizationPage from "@/pages/admin/OrganizationPage";
import StatisticsPage from "@/pages/admin/StatisticsPage";
import AccessControlPage from "@/pages/admin/AccessControlPage";
import NotificationsPage from "@/pages/admin/NotificationsPage";
import FinancesPage from "@/pages/admin/FinancesPage";
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="events" element={<EventsListPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/:uuid" element={<EventDetailPage />} />
            <Route path="events/:uuid/edit" element={<EditEventPage />} />
            <Route path="organization" element={<OrganizationPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="access-control" element={<AccessControlPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="finances" element={<FinancesPage />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
