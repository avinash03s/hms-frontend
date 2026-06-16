// import Random from "../components/Random";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import AdminDashboard from "../layouts/AdminDashboard";
// import LoginPage from "../pages/LoginPage";
// import RegisterPage from "../pages/Register";
// import PublicRoute from "./PublicRoutes";
// import ProtectedRoute from "./ProtectedRoutes";
// import PatientDashboard from "../layouts/PatientDashboard";
// import PatientProfilePage from "../pages/patient/PatientProfilePage";
// import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";
// import PatientAppointmentPage from "../pages/patient/PatientAppointmentPage";
// import DoctorAppointmentPage from "../pages/doctor/DoctorAppointmentPage";
// import HomePage from "../pages/PublicPage";
// import DoctorAppointmentDetailsPage from "../pages/doctor/DoctorAppointmentDetailsPage";
// import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
// import PatientDashboardPage from "../pages/patient/PatientDashbordPage";
// import DoctorReportsPage from "../pages/doctor/DoctorReportsPage";
// import PatientReportsPage from "../pages/patient/PatientReportsPage";
// import NotFoundPage from "../pages/NotFoundPage";
// import DoctorsPage from "../pages/admin/DoctorsPage";
// import PatientsPage from "../pages/admin/PatientsPage";
// import AppointmentsPage from "../pages/admin/AppointmentsPage";
// import DashboardPage from "../pages/admin/DashboardPage";
// import DoctorDashboard from "../layouts/DoctorDashboard";
// import AnalyticsPage from "../pages/admin/AnalyticsPage";
// import ForgotPasswordPage from "../pages/ForgotPasswordPage";
// import PharmacyPage from "../pages/doctor/PharmacyPage";
// import AdminMedicinePage from "../pages/admin/AdminMedicinePage";
// import InventoryPage from "../pages/admin/InventoryPage";
// import AdminSalesPage from "../pages/admin/AdminSalesPage";
// import HealthPackagesPage from "../pages/patient/HealthPackagesPage";
// import FindDoctorPage from "../pages/patient/FindDoctorPage";
// import SpecialitiesPage from "../pages/patient/SpecialitiesPage";
// import AdminHealthPackagesPage from "../pages/admin/AdminHealthPackagesPage";
// // import DoctorReportsPage from "../pages/doctor/DoctorReportsPage";
// // import HomePage from "../pages/PublicPage";

// const AppRoutes = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/health-packages" element={<HealthPackagesPage />} />
//         <Route path="/find-doctor" element={<FindDoctorPage />} />
//         <Route path="/specialities" element={<SpecialitiesPage/>}/>

//         <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
//         <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
//         <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

//         <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
//           <Route path="dashboard" element={<DashboardPage />} />
//           <Route path="doctors" element={<DoctorsPage />} />
//           <Route path="packages" element={<AdminHealthPackagesPage />} />
//           <Route path="patients" element={<PatientsPage />} />
//           <Route path="appointments" element={<AppointmentsPage />} />
//           <Route path="analytics" element={<AnalyticsPage />} />
//           <Route path="medicine" element={<AdminMedicinePage />} />
//           <Route path="inventory" element={<InventoryPage />} />
//           <Route path="sales" element={<AdminSalesPage />} />
//         </Route>

//         <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}>
//           <Route path="dashboard" element={<DoctorDashboardPage />} />
//           <Route path="profile" element={<DoctorProfilePage />} />
//           <Route path="appointments" element={<DoctorAppointmentPage />} />
//           <Route path="appointments/:id" element={<DoctorAppointmentDetailsPage />} />
//           <Route path="reports" element={<DoctorReportsPage />} />
//           <Route path="pharmacy" element={<PharmacyPage />} />
//         </Route>

//         <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
//           <Route path="dashboard" element={<PatientDashboardPage />} />
//           <Route path="profile" element={<PatientProfilePage />} />
//           <Route path="appointments" element={<PatientAppointmentPage />} />
//           <Route path="reports" element={<PatientReportsPage />} />
//           <Route path="book" element={<Random />} />
//         </Route>
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default AppRoutes;


import { BrowserRouter, Routes, Route } from "react-router-dom";

// ─── Layouts ──────────────────────────────────────────────────────────────────
import AdminDashboard from "../layouts/AdminDashboard";
import DoctorDashboard from "../layouts/DoctorDashboard";

// ─── Route Guards ─────────────────────────────────────────────────────────────
import PublicRoute from "./PublicRoutes";
import ProtectedRoute from "./ProtectedRoutes";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import HomePage from "../pages/PublicPage";
import HealthPackagesPage from "../pages/patient/HealthPackagesPage";
import FindDoctorPage from "../pages/patient/FindDoctorPage";
import SpecialitiesPage from "../pages/patient/SpecialitiesPage";
import NotFoundPage from "../pages/NotFoundPage";

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/Register";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// ─── Patient Pages (no layout — use public Navbar + Footer) ──────────────────
import PatientProfilePage from "../pages/patient/PatientProfilePage";
import PatientAppointmentPage from "../pages/patient/PatientAppointmentPage";
import PatientReportsPage from "../pages/patient/PatientReportsPage";

// ─── Doctor Pages ─────────────────────────────────────────────────────────────
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";
import DoctorAppointmentPage from "../pages/doctor/DoctorAppointmentPage";
import DoctorAppointmentDetailsPage from "../pages/doctor/DoctorAppointmentDetailsPage";
import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
import DoctorReportsPage from "../pages/doctor/DoctorReportsPage";
import PharmacyPage from "../pages/doctor/PharmacyPage";

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import DashboardPage from "../pages/admin/DashboardPage";
import DoctorsPage from "../pages/admin/DoctorsPage";
import PatientsPage from "../pages/admin/PatientsPage";
import AppointmentsPage from "../pages/admin/AppointmentsPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import AdminMedicinePage from "../pages/admin/AdminMedicinePage";
import InventoryPage from "../pages/admin/InventoryPage";
import AdminSalesPage from "../pages/admin/AdminSalesPage";
import AdminHealthPackagesPage from "../pages/admin/AdminHealthPackagesPage";
import ProfileDoctorPage from "../pages/patient/DoctorProfilePage";
import HealthPackageDetailPage from "../pages/patient/HealthPackageDetailPage";
import MyPackagesPage from "../pages/patient/MyPackagesPage";
import AdminhospitalPage from "../pages/admin/AdminhospitalPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/health-packages" element={<HealthPackagesPage />} />
        <Route path="/find-doctor" element={<FindDoctorPage />} />
        <Route path="/specialities" element={<SpecialitiesPage />} />
        <Route path="/doctors/:slug" element={<ProfileDoctorPage />} />
        <Route path="/health-packages/:id" element={<HealthPackageDetailPage />} />

        {/* ── Auth Routes ── */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* ── Patient Routes (public Navbar + Footer, no sidebar) ── */}
        <Route path="/patient/profile"element={<ProtectedRoute><PatientProfilePage /></ProtectedRoute>} />
        <Route path="/patient/appointments"element={<ProtectedRoute><PatientAppointmentPage /></ProtectedRoute>} />
        <Route path="/patient/reports"element={<ProtectedRoute><PatientReportsPage /></ProtectedRoute>} />
        <Route path="/patient/packages" element={<ProtectedRoute><MyPackagesPage/></ProtectedRoute>}/>

        {/* ── Doctor Routes (DoctorDashboard layout with sidebar) ── */}
        <Route path="/doctor" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="appointments" element={<DoctorAppointmentPage />} />
          <Route path="appointments/:id" element={<DoctorAppointmentDetailsPage />} />
          <Route path="reports" element={<DoctorReportsPage />} />
          <Route path="pharmacy" element={<PharmacyPage />} />
        </Route>

        {/* ── Admin Routes (AdminDashboard layout with sidebar) ── */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="hospitals" element={<AdminhospitalPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="packages" element={<AdminHealthPackagesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="medicine" element={<AdminMedicinePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<AdminSalesPage />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
