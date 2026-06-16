// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Button, Loader } from "@mantine/core";
// import {
//   IconHeartbeat, IconPhone, IconMail, IconMenu2, IconX,
//   IconChevronDown, IconChevronRight, IconBuildingHospital,
//   IconUser, IconCalendarTime, IconReportMedical, IconLogout, IconPackage,
//   IconSearch,
// } from "@tabler/icons-react";
// import axios from "axios";
// import { useSelector, useDispatch } from "react-redux";
// import { setJwt } from "../../slices/JwtSlices";
// import { setUser } from "../../slices/UserSlices";

// interface Hospital {
//   id: number;
//   name: string;
//   city: string;
//   address: string;
//   phone: string;
// }

// const simpleNavItems = [
//   { label: "Specialities", href: "/specialities" },
//   { label: "Health Packages", href: "/health-packages" },
//   { label: "Find A Doctor", href: "/find-doctor" },
// ];

// // ─── Doctor Search Bar ────────────────────────────────────────────────────────
// const DoctorSearchBar = () => {
//   const navigate = useNavigate();
//   const [query, setQuery] = useState("");

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (query.trim()) {
//       navigate(`/find-doctor?q=${encodeURIComponent(query.trim())}`);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSearch}
//       className="hidden lg:flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#1a6fa8] focus-within:ring-1 focus-within:ring-[#1a6fa8] transition-all bg-gray-50"
//       style={{ minWidth: 220, maxWidth: 280 }}
//     >
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search doctor..."
//         className="flex-1 text-sm px-3 py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
//       />
//       <button
//         type="submit"
//         className="px-3 py-2 text-gray-400 hover:text-[#1a6fa8] transition-colors"
//         aria-label="Search"
//       >
//         <IconSearch size={16} />
//       </button>
//     </form>
//   );
// };

// // ─── Patient Dropdown ─────────────────────────────────────────────────────────
// const PatientDropdown = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const user = useSelector((state: any) => state.user);
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const handleLogout = () => {
//     dispatch(setJwt(null));
//     dispatch(setUser(null));
//     navigate("/");
//     setOpen(false);
//   };

//   const initials = user?.name
//     ?.split(" ")
//     .map((n: string) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2) ?? "U";

//   const menuItems = [
//     { label: "My Profile", icon: <IconUser size={15} stroke={1.5} />, to: "/patient/profile" },
//     { label: "My Appointments", icon: <IconCalendarTime size={15} stroke={1.5} />, to: "/patient/appointments" },
//     { label: "My Packages", icon: <IconPackage size={15} stroke={1.5} />, to: "/patient/packages" },
//     { label: "My Reports", icon: <IconReportMedical size={15} stroke={1.5} />, to: "/patient/reports" },
//   ];

//   return (
//     <div ref={ref} className="relative">
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1a6fa8] hover:bg-blue-50 transition-all"
//       >
//         <div className="w-7 h-7 rounded-full bg-[#1a6fa8] flex items-center justify-center text-white text-xs font-bold">
//           {initials}
//         </div>
//         <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
//           {user?.name?.split(" ")[0]}
//         </span>
//         <IconChevronDown
//           size={14}
//           className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && (
//         <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
//           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
//             <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
//             <p className="text-xs text-gray-400 truncate">{user?.email}</p>
//           </div>

//           <div className="py-1">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.label}
//                 to={item.to}
//                 onClick={() => setOpen(false)}
//                 className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1a6fa8] transition-colors"
//               >
//                 <span className="text-gray-400">{item.icon}</span>
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           <div className="border-t border-gray-100 py-1">
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
//             >
//               <IconLogout size={15} stroke={1.5} />
//               Logout
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Main Navbar ──────────────────────────────────────────────────────────────
// const Navbar = () => {
//   const location = useLocation();
//   const user = useSelector((state: any) => state.user);
//   const isPatientLoggedIn = user?.role === "PATIENT";

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [mobileHospitalsOpen, setMobileHospitalsOpen] = useState(false);
//   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
//   const [mobileSearchQuery, setMobileSearchQuery] = useState("");
//   const navigate = useNavigate();

//   const [cities, setCities] = useState<string[]>([]);
//   const [hospitalsByCity, setHospitalsByCity] = useState<Record<string, Hospital[]>>({});
//   const [citiesLoading, setCitiesLoading] = useState(true);
//   const [selectedCity, setSelectedCity] = useState<string | null>(null);
//   const fetchedCities = useRef<Set<string>>(new Set());

//   useEffect(() => {
//     axios
//       .get("/api/hospitals/cities")
//       .then((res) => {
//         const data = res.data?.data || res.data;
//         setCities(Array.isArray(data) ? data : []);
//       })
//       .catch(() => setCities(["Beed"]))
//       .finally(() => setCitiesLoading(false));
//   }, []);

//   const handleCityHover = (city: string) => {
//     setSelectedCity(city);
//     if (fetchedCities.current.has(city)) return;
//     fetchedCities.current.add(city);
//     axios
//       .get(`/api/hospitals/city/${city}`)
//       .then((res) => {
//         const data = res.data?.data || res.data;
//         setHospitalsByCity((prev) => ({
//           ...prev,
//           [city]: Array.isArray(data) ? data : [],
//         }));
//       })
//       .catch(() => {
//         setHospitalsByCity((prev) => ({ ...prev, [city]: [] }));
//       });
//   };

//   const handleMobileSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (mobileSearchQuery.trim()) {
//       navigate(`/find-doctor?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
//       setMobileOpen(false);
//     }
//   };

//   return (
//     <>
//       {/* ── Top Info Bar ── */}
//       <div className="hidden md:block bg-[#1a6fa8] text-white text-xs py-2">
//         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <a
//               href="tel:+918888822222"
//               className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
//             >
//               <IconPhone size={12} /> +91 88888 22222
//             </a>
//             <a
//               href="mailto:care@pulsecare.in"
//               className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
//             >
//               <IconMail size={12} /> care@pulsecare.in
//             </a>
//             <span className="opacity-70">|</span>
//             <span className="opacity-80">Mon–Sat: 8:00 AM – 8:00 PM &nbsp;|&nbsp; Emergency: 24×7</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
//               Emergency: 108
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ── Main Header ── */}
//       <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">

//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-2.5 shrink-0">
//             <div className="w-9 h-9 rounded-lg bg-[#1a6fa8] flex items-center justify-center">
//               <IconHeartbeat size={20} stroke={2.5} className="text-white" />
//             </div>
//             <div className="leading-none">
//               <p className="text-base font-extrabold text-gray-900 tracking-tight">PulseCare</p>
//               <p className="text-[10px] text-gray-400">Hospitals & Healthcare</p>
//             </div>
//           </Link>

//           {/* Desktop Nav */}
//           <nav className="hidden lg:flex items-center gap-1">
//             {/* Hospitals Dropdown */}
//             <div className="relative group" onMouseLeave={() => setSelectedCity(null)}>
//               <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#1a6fa8] hover:bg-blue-50 transition-colors">
//                 Hospitals
//                 <IconChevronDown
//                   size={14}
//                   className="group-hover:rotate-180 transition-transform duration-200"
//                 />
//               </button>

//               <div className="absolute top-full left-0 pt-1 hidden group-hover:flex z-50">
//                 <div className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex">
//                   {/* City list */}
//                   <div className="py-2 border-r border-gray-100" style={{ minWidth: 180 }}>
//                     {citiesLoading ? (
//                       <div className="flex items-center justify-center py-6">
//                         <Loader size="xs" color="#1a6fa8" />
//                       </div>
//                     ) : cities.length === 0 ? (
//                       <p className="px-4 py-3 text-xs text-gray-400">No cities found</p>
//                     ) : (
//                       <>
//                         {cities.map((city) => (
//                           <button
//                             key={city}
//                             onMouseEnter={() => handleCityHover(city)}
//                             className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
//                               ${
//                                 selectedCity === city
//                                   ? "bg-blue-50 text-[#1a6fa8] font-semibold"
//                                   : "text-gray-600 hover:bg-blue-50 hover:text-[#1a6fa8]"
//                               }`}
//                           >
//                             <span className="flex items-center gap-2">
//                               <IconBuildingHospital size={14} stroke={1.5} />
//                               {city}
//                             </span>
//                             <IconChevronRight size={13} />
//                           </button>
//                         ))}
//                         <div className="border-t border-gray-100 mt-1 pt-1">
//                           <Link
//                             to="/hospitals"
//                             className="block px-4 py-2 text-sm text-[#1a6fa8] font-semibold hover:bg-blue-50 transition-colors"
//                           >
//                             View All Hospitals →
//                           </Link>
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   {/* Hospitals in selected city */}
//                   {selectedCity && (
//                     <div className="py-2" style={{ minWidth: 220 }}>
//                       <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         {selectedCity}
//                       </p>
//                       {!hospitalsByCity[selectedCity] ? (
//                         <div className="flex items-center justify-center py-6">
//                           <Loader size="xs" color="#1a6fa8" />
//                         </div>
//                       ) : hospitalsByCity[selectedCity].length === 0 ? (
//                         <p className="px-4 py-3 text-xs text-gray-400">No hospitals found</p>
//                       ) : (
//                         hospitalsByCity[selectedCity].map((h) => (
//                           <Link
//                             key={h.id}
//                             to={`/hospitals/${h.id}`}
//                             className="block px-4 py-2.5 hover:bg-blue-50 transition-colors group/item"
//                           >
//                             <p className="text-sm font-semibold text-gray-700 group-hover/item:text-[#1a6fa8]">
//                               {h.name}
//                             </p>
//                             <p
//                               className="text-xs text-gray-400 truncate mt-0.5"
//                               style={{ maxWidth: 180 }}
//                             >
//                               {h.address}
//                             </p>
//                           </Link>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {simpleNavItems.map((item) => (
//               <Link
//                 key={item.label}
//                 to={item.href}
//                 className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
//                   ${
//                     location.pathname === item.href
//                       ? "text-[#1a6fa8] bg-blue-50"
//                       : "text-gray-600 hover:text-[#1a6fa8] hover:bg-blue-50"
//                   }`}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </nav>

//           {/* Doctor Search + Auth */}
//           <div className="hidden md:flex items-center gap-3 ml-auto">
//             <DoctorSearchBar />

//             {isPatientLoggedIn ? (
//               <PatientDropdown />
//             ) : (
//               <>
//                 <Link to="/login">
//                   <Button
//                     variant="outline"
//                     radius="md"
//                     size="sm"
//                     styles={{ root: { borderColor: "#1a6fa8", color: "#1a6fa8" } }}
//                   >
//                     Login
//                   </Button>
//                 </Link>
//                 <Link to="/login">
//                   <Button radius="md" size="sm" color="#c0392b">
//                     Book Appointment
//                   </Button>
//                 </Link>
//               </>
//             )}
//           </div>

//           {/* Mobile hamburger */}
//           <button
//             className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 ml-auto"
//             onClick={() => setMobileOpen(!mobileOpen)}
//             aria-label="Toggle menu"
//           >
//             {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
//           </button>
//         </div>

//         {/* ── Mobile Menu ── */}
//         {mobileOpen && (
//           <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">

//             {/* Mobile doctor search */}
//             <form
//               onSubmit={handleMobileSearch}
//               className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-2 bg-gray-50 focus-within:border-[#1a6fa8]"
//             >
//               <input
//                 type="text"
//                 value={mobileSearchQuery}
//                 onChange={(e) => setMobileSearchQuery(e.target.value)}
//                 placeholder="Search doctor here..."
//                 className="flex-1 text-sm px-3 py-2.5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
//               />
//               <button
//                 type="submit"
//                 className="px-3 py-2.5 text-gray-400 hover:text-[#1a6fa8] transition-colors"
//                 aria-label="Search"
//               >
//                 <IconSearch size={16} />
//               </button>
//             </form>

//             {/* Hospitals accordion */}
//             <button
//               onClick={() => setMobileHospitalsOpen(!mobileHospitalsOpen)}
//               className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#1a6fa8] hover:bg-blue-50 rounded-md transition-colors w-full"
//             >
//               Hospitals
//               <IconChevronDown
//                 size={15}
//                 className={`transition-transform duration-200 ${mobileHospitalsOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {mobileHospitalsOpen && (
//               <div className="ml-4 flex flex-col gap-0.5 mb-1">
//                 {cities.map((city) => (
//                   <Link
//                     key={city}
//                     to={`/hospitals?city=${city}`}
//                     onClick={() => setMobileOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-[#1a6fa8] rounded-md transition-colors"
//                   >
//                     <IconBuildingHospital size={13} stroke={1.5} />
//                     {city}
//                   </Link>
//                 ))}
//               </div>
//             )}

//             {simpleNavItems.map((item) => (
//               <Link
//                 key={item.label}
//                 to={item.href}
//                 onClick={() => setMobileOpen(false)}
//                 className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#1a6fa8] hover:bg-blue-50 rounded-md transition-colors"
//               >
//                 {item.label}
//               </Link>
//             ))}

//             {/* Mobile auth / patient links */}
//             <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
//               {isPatientLoggedIn ? (
//                 <div className="flex flex-col gap-1 w-full">
//                   <Link
//                     to="/patient/profile"
//                     onClick={() => setMobileOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
//                   >
//                     <IconUser size={15} stroke={1.5} /> My Profile
//                   </Link>
//                   <Link
//                     to="/patient/appointments"
//                     onClick={() => setMobileOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
//                   >
//                     <IconCalendarTime size={15} stroke={1.5} /> My Appointments
//                   </Link>
//                   <Link
//                     to="/patient/packages"
//                     onClick={() => setMobileOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
//                   >
//                     <IconPackage size={15} stroke={1.5} /> My Packages
//                   </Link>
//                   <Link
//                     to="/patient/reports"
//                     onClick={() => setMobileOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md"
//                   >
//                     <IconReportMedical size={15} stroke={1.5} /> My Reports
//                   </Link>
//                 </div>
//               ) : (
//                 <>
//                   <Link to="/login" className="flex-1">
//                     <Button
//                       fullWidth
//                       variant="outline"
//                       radius="md"
//                       size="sm"
//                       styles={{ root: { borderColor: "#1a6fa8", color: "#1a6fa8" } }}
//                     >
//                       Login
//                     </Button>
//                   </Link>
//                   <Link to="/login" className="flex-1">
//                     <Button fullWidth radius="md" size="sm" color="#c0392b">
//                       Book Appointment
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </header>
//     </>
//   );
// };

// export default Navbar;

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Loader } from "@mantine/core";
import {
  IconHeartbeat, IconPhone, IconMail, IconMenu2, IconX,
  IconChevronDown, IconChevronRight, IconBuildingHospital,
  IconUser, IconCalendarTime, IconReportMedical, IconLogout, IconPackage,
  IconSearch,
} from "@tabler/icons-react";
import { useSelector, useDispatch } from "react-redux";
import { setJwt } from "../../slices/JwtSlices";
import { setUser } from "../../slices/UserSlices";
import axiosInstance from "../../interceptor/AxiosInterceptor"; // ✅ axios hata ke axiosInstance

interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
}

const simpleNavItems = [
  { label: "Specialities", href: "/specialities" },
  { label: "Health Packages", href: "/health-packages" },
  { label: "Find A Doctor", href: "/find-doctor" },
];

// ─── Doctor Search Bar ────────────────────────────────────────────────────────
const DoctorSearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/find-doctor?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="hidden lg:flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#1a6fa8] focus-within:ring-1 focus-within:ring-[#1a6fa8] transition-all bg-gray-50"
      style={{ minWidth: 220, maxWidth: 280 }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search doctor..."
        className="flex-1 text-sm px-3 py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
      />
      <button
        type="submit"
        className="px-3 py-2 text-gray-400 hover:text-[#1a6fa8] transition-colors"
        aria-label="Search"
      >
        <IconSearch size={16} />
      </button>
    </form>
  );
};

// ─── Patient Dropdown ─────────────────────────────────────────────────────────
const PatientDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(setJwt(null));
    dispatch(setUser(null));
    navigate("/");
    setOpen(false);
  };

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  const menuItems = [
    { label: "My Profile", icon: <IconUser size={15} stroke={1.5} />, to: "/patient/profile" },
    { label: "My Appointments", icon: <IconCalendarTime size={15} stroke={1.5} />, to: "/patient/appointments" },
    { label: "My Packages", icon: <IconPackage size={15} stroke={1.5} />, to: "/patient/packages" },
    { label: "My Reports", icon: <IconReportMedical size={15} stroke={1.5} />, to: "/patient/reports" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1a6fa8] hover:bg-blue-50 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-[#1a6fa8] flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {user?.name?.split(" ")[0]}
        </span>
        <IconChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1a6fa8] transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
            >
              <IconLogout size={15} stroke={1.5} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const location = useLocation();
  const user = useSelector((state: any) => state.user);
  const isPatientLoggedIn = user?.role === "PATIENT";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileHospitalsOpen, setMobileHospitalsOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const navigate = useNavigate();

  const [cities, setCities] = useState<string[]>([]);
  const [hospitalsByCity, setHospitalsByCity] = useState<Record<string, Hospital[]>>({});
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const fetchedCities = useRef<Set<string>>(new Set());

  useEffect(() => {
    // ✅ axiosInstance use karo — baseURL: localhost:9000
    axiosInstance
      .get("/api/hospitals/cities")
      .then((res) => {
        const data = res.data?.data || res.data;
        setCities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, []);

  const handleCityHover = (city: string) => {
    setSelectedCity(city);
    if (fetchedCities.current.has(city)) return;
    fetchedCities.current.add(city);
    // ✅ axiosInstance use karo
    axiosInstance
      .get(`/api/hospitals/city/${city}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setHospitalsByCity((prev) => ({
          ...prev,
          [city]: Array.isArray(data) ? data : [],
        }));
      })
      .catch(() => {
        setHospitalsByCity((prev) => ({ ...prev, [city]: [] }));
      });
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/find-doctor?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* ── Top Info Bar ── */}
      <div className="hidden md:block bg-[#1a6fa8] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+918888822222" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <IconPhone size={12} /> +91 88888 22222
            </a>
            <a href="mailto:care@pulsecare.in" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <IconMail size={12} /> care@pulsecare.in
            </a>
            <span className="opacity-70">|</span>
            <span className="opacity-80">Mon–Sat: 8:00 AM – 8:00 PM &nbsp;|&nbsp; Emergency: 24×7</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              Emergency: 108
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#1a6fa8] flex items-center justify-center">
              <IconHeartbeat size={20} stroke={2.5} className="text-white" />
            </div>
            <div className="leading-none">
              <p className="text-base font-extrabold text-gray-900 tracking-tight">PulseCare</p>
              <p className="text-[10px] text-gray-400">Hospitals & Healthcare</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Hospitals Dropdown */}
            <div className="relative group" onMouseLeave={() => setSelectedCity(null)}>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#1a6fa8] hover:bg-blue-50 transition-colors">
                Hospitals
                <IconChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>

              <div className="absolute top-full left-0 pt-1 hidden group-hover:flex z-50">
                <div className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex">
                  {/* City list */}
                  <div className="py-2 border-r border-gray-100" style={{ minWidth: 180 }}>
                    {citiesLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader size="xs" color="#1a6fa8" />
                      </div>
                    ) : cities.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-gray-400">No cities found</p>
                    ) : (
                      <>
                        {cities.map((city) => (
                          <button
                            key={city}
                            onMouseEnter={() => handleCityHover(city)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                              ${selectedCity === city
                                ? "bg-blue-50 text-[#1a6fa8] font-semibold"
                                : "text-gray-600 hover:bg-blue-50 hover:text-[#1a6fa8]"
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              <IconBuildingHospital size={14} stroke={1.5} />
                              {city}
                            </span>
                            <IconChevronRight size={13} />
                          </button>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <Link to="/hospitals" className="block px-4 py-2 text-sm text-[#1a6fa8] font-semibold hover:bg-blue-50 transition-colors">
                            View All Hospitals →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hospitals in selected city */}
                  {selectedCity && (
                    <div className="py-2" style={{ minWidth: 220 }}>
                      <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {selectedCity}
                      </p>
                      {!hospitalsByCity[selectedCity] ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader size="xs" color="#1a6fa8" />
                        </div>
                      ) : hospitalsByCity[selectedCity].length === 0 ? (
                        <p className="px-4 py-3 text-xs text-gray-400">No hospitals found</p>
                      ) : (
                        hospitalsByCity[selectedCity].map((h) => (
                          <Link
                            key={h.id}
                            to={`/find-doctor?hospitalId=${h.id}`}  // ✅ find-doctor pe filter ke saath
                            className="block px-4 py-2.5 hover:bg-blue-50 transition-colors group/item"
                          >
                            <p className="text-sm font-semibold text-gray-700 group-hover/item:text-[#1a6fa8]">
                              {h.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5" style={{ maxWidth: 180 }}>
                              {h.address}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {simpleNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${location.pathname === item.href
                    ? "text-[#1a6fa8] bg-blue-50"
                    : "text-gray-600 hover:text-[#1a6fa8] hover:bg-blue-50"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Doctor Search + Auth */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <DoctorSearchBar />
            {isPatientLoggedIn ? (
              <PatientDropdown />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" radius="md" size="sm"
                    styles={{ root: { borderColor: "#1a6fa8", color: "#1a6fa8" } }}>
                    Login
                  </Button>
                </Link>
                <Link to="/login">
                  <Button radius="md" size="sm" color="#c0392b">Book Appointment</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">
            <form
              onSubmit={handleMobileSearch}
              className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-2 bg-gray-50 focus-within:border-[#1a6fa8]"
            >
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="Search doctor here..."
                className="flex-1 text-sm px-3 py-2.5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <button type="submit" className="px-3 py-2.5 text-gray-400 hover:text-[#1a6fa8] transition-colors" aria-label="Search">
                <IconSearch size={16} />
              </button>
            </form>

            <button
              onClick={() => setMobileHospitalsOpen(!mobileHospitalsOpen)}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#1a6fa8] hover:bg-blue-50 rounded-md transition-colors w-full"
            >
              Hospitals
              <IconChevronDown size={15} className={`transition-transform duration-200 ${mobileHospitalsOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileHospitalsOpen && (
              <div className="ml-4 flex flex-col gap-0.5 mb-1">
                {cities.map((city) => (
                  <Link
                    key={city}
                    to={`/hospitals?city=${city}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-[#1a6fa8] rounded-md transition-colors"
                  >
                    <IconBuildingHospital size={13} stroke={1.5} />
                    {city}
                  </Link>
                ))}
              </div>
            )}

            {simpleNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#1a6fa8] hover:bg-blue-50 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              {isPatientLoggedIn ? (
                <div className="flex flex-col gap-1 w-full">
                  <Link to="/patient/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
                    <IconUser size={15} stroke={1.5} /> My Profile
                  </Link>
                  <Link to="/patient/appointments" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
                    <IconCalendarTime size={15} stroke={1.5} /> My Appointments
                  </Link>
                  <Link to="/patient/packages" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
                    <IconPackage size={15} stroke={1.5} /> My Packages
                  </Link>
                  <Link to="/patient/reports" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md">
                    <IconReportMedical size={15} stroke={1.5} /> My Reports
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="flex-1">
                    <Button fullWidth variant="outline" radius="md" size="sm" styles={{ root: { borderColor: "#1a6fa8", color: "#1a6fa8" } }}>Login</Button>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <Button fullWidth radius="md" size="sm" color="#c0392b">Book Appointment</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;