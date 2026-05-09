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
// import HomePage from "../pages/PublicPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Random />} />
          <Route path="/pharmacy" element={<Random />} />
          <Route path="/patients" element={<Random />} />
          <Route path="/doctors" element={<Random />} />
        </Route>

        {/* Doctor */}

        <Route path="/doctor" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="appointments" element={<DoctorAppointmentPage />} />
          <Route path="appointments/:id" element={<DoctorAppointmentDetailsPage />} />
          <Route path="pharmacy" element={<Random />} />
          <Route path="patients" element={<Random />} />
          <Route path="doctors" element={<Random />} />
        </Route>

        {/* Patient */}
        <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<PatientDashboardPage />} />
          <Route path="profile" element={<PatientProfilePage />} />
          <Route path="appointments" element={<PatientAppointmentPage />} />
          <Route path="book" element={<Random />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
