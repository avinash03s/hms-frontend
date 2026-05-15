import Random from "../components/Random";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "../layouts/AdminDashboard";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/Register";
import PublicRoute from "./PublicRoutes";
import ProtectedRoute from "./ProtectedRoutes";
import PatientDashboard from "../layouts/PatientDashboard";
import PatientProfilePage from "../pages/patient/PatientProfilePage";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";
import PatientAppointmentPage from "../pages/patient/PatientAppointmentPage";
import DoctorAppointmentPage from "../pages/doctor/DoctorAppointmentPage";
import HomePage from "../pages/PublicPage";
import DoctorAppointmentDetailsPage from "../pages/doctor/DoctorAppointmentDetailsPage";
import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
import PatientDashboardPage from "../pages/patient/PatientDashbordPage";
import DoctorReportsPage from "../pages/doctor/DoctorReportsPage";
import PatientReportsPage from "../pages/patient/PatientReportsPage";
import NotFoundPage from "../pages/NotFoundPage";
import DoctorsPage from "../pages/admin/DoctorsPage";
import PatientsPage from "../pages/admin/PatientsPage";
import AppointmentsPage from "../pages/admin/AppointmentsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import DoctorDashboard from "../layouts/DoctorDashboard";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
// import DoctorReportsPage from "../pages/doctor/DoctorReportsPage";
// import HomePage from "../pages/PublicPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="appointments" element={<DoctorAppointmentPage />} />
          <Route path="appointments/:id" element={<DoctorAppointmentDetailsPage />} />
          <Route path="reports" element={<DoctorReportsPage />} />
        </Route>

        <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<PatientDashboardPage />} />
          <Route path="profile" element={<PatientProfilePage />} />
          <Route path="appointments" element={<PatientAppointmentPage />} />
          <Route path="reports" element={<PatientReportsPage />} />
          <Route path="book" element={<Random />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
