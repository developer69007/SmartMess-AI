import { Navigate, Route, Routes } from "react-router-dom";

// ================= Layouts =================
import LandingLayout from "./layouts/LandingLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// ================= Landing =================
import LandingPage from "./pages/landing/LandingPage";

// ================= Authentication =================
import LoginPage from "./pages/auth/LoginPage";
import StaffLogin from "./pages/auth/StaffLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";

// ================= Student =================
import StudentDashboard from "./pages/student/StudentDashboard";
import TodaysMenu from "./pages/student/Today'sMenu";
import Attendance from "./pages/student/Attendance";
import QRScanner from "./pages/student/QRScanner";
import Feedback from "./pages/student/Feedback";
import StudentProfile from "./pages/student/Profile";
import StudentSettings from "./pages/student/Settings";

import StaffLayout from "./layouts/StaffLayout";

// ================= Staff =================
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffAttendance from "./pages/staff/Attendance";
import KitchenStatus from "./pages/staff/KitchenStatus";
import QRVerification from "./pages/staff/QRVerification";
import MealManagement from "./pages/staff/MealManagement";
import StaffProfile from "./pages/staff/Profile";
import StaffReports from "./pages/staff/Reports";
import StaffSettings from "./pages/staff/Settings";

// ================= Admin =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Staff from "./pages/admin/Staff";
import MenuManagement from "./pages/admin/MenuManagement";
import Analytics from "./pages/admin/Analytics";
import AIInsights from "./pages/admin/AIInsights";
import AdminProfile from "./pages/admin/Profile";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

function App() {
  return (
    <Routes>

      {/* ================= Landing ================= */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/staff" element={<StaffLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ================= Student Dashboard ================= */}
      <Route element={<DashboardLayout />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/menu" element={<TodaysMenu />} />
        <Route path="/student/attendance" element={<Attendance />} />
        <Route path="/student/scanner" element={<QRScanner />} />
        <Route path="/student/feedback" element={<Feedback />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/settings" element={<StudentSettings />} />
      </Route>

      {/* ================= Staff Dashboard ================= */}
      <Route element={<StaffLayout />}>
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/attendance" element={<StaffAttendance />} />
        <Route path="/staff/kitchen-status" element={<KitchenStatus />} />
        <Route path="/staff/qr-verification" element={<QRVerification />} />
        <Route path="/staff/meal-management" element={<MealManagement />} />
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/reports" element={<StaffReports />} />
        <Route path="/staff/settings" element={<StaffSettings />} />
      </Route>

      {/* ================= Admin Dashboard ================= */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/staff" element={<Staff />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/ai-insights" element={<AIInsights />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* ================= Unknown Route ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;