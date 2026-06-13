import {
  IconHeartbeat, IconLayoutGrid, IconCalendarCheck,
  IconUser, IconMoodHeart, IconPackage, IconMedicineSyrup,
  IconLogout, IconMenu2, IconX, IconChevronRight,
} from "@tabler/icons-react";
import { Avatar, Tooltip } from "@mantine/core";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { setJwt } from "../../../slices/JwtSlices";
import { setUser } from "../../../slices/UserSlices";

const links = [
  { name: "Dashboard",    url: "/admin/dashboard",    icon: <IconLayoutGrid size={20} stroke={1.5} /> },
  { name: "Doctors",      url: "/admin/doctors",      icon: <IconUser size={20} stroke={1.5} /> },
  { name: "Patients",     url: "/admin/patients",     icon: <IconMoodHeart size={20} stroke={1.5} /> },
  { name: "Appointments", url: "/admin/appointments", icon: <IconCalendarCheck size={20} stroke={1.5} /> },
  { name: "Medicine",     url: "/admin/medicine",     icon: <IconMedicineSyrup size={20} stroke={1.5} /> },
  { name: "Inventory",    url: "/admin/inventory",    icon: <IconPackage size={20} stroke={1.5} /> },
  { name: "Packages",     url: "/admin/packages",     icon: <IconPackage size={20} stroke={1.5} /> },
];

const AdminNavbar = () => {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(setJwt(null));
    dispatch(setUser({}));
    navigate("/login");
  };

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen z-50 bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-56"
        }`}
      >
        <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 ${collapsed ? "justify-center px-0" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-[#1a6fa8] flex items-center justify-center shrink-0">
            <IconHeartbeat size={18} stroke={2.5} className="text-white" />
          </div>
          {!collapsed && (
            <div className="leading-none">
              <p className="text-sm font-extrabold text-gray-900 tracking-tight">PulseCare</p>
              <p className="text-[10px] text-[#1a6fa8] font-semibold">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
          {links.map((link) => (
            <Tooltip
              key={link.url}
              label={link.name}
              position="right"
              disabled={!collapsed}
              withArrow
            >
              <NavLink
                to={link.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#1a6fa8] text-white shadow-sm"
                      : "text-gray-500 hover:bg-[#f4f7fb] hover:text-[#1a6fa8]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-white" : "text-[#1a6fa8]"}>
                      {link.icon}
                    </span>
                    {!collapsed && <span>{link.name}</span>}
                  </>
                )}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        <div className={`border-t border-gray-100 p-3 flex flex-col gap-2`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2 px-1">
                <Avatar size={32} radius="xl" color="blue"
                  style={{ border: "2px solid #e8f1fb", fontWeight: 700, flexShrink: 0 }}>
                  {user.name?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.name || "Admin"}</p>
                  <p className="text-[10px] text-gray-400">{user.role || "ADMIN"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-500 rounded-xl hover:bg-red-50 transition-colors"
              >
                <IconLogout size={15} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip label={user.name || "Admin"} position="right" withArrow>
                <Avatar size={32} radius="xl" color="blue"
                  style={{ border: "2px solid #e8f1fb", fontWeight: 700, cursor: "pointer" }}>
                  {user.name?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
              </Tooltip>
              <Tooltip label="Logout" position="right" withArrow>
                <button onClick={handleLogout}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                  <IconLogout size={16} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <IconChevronRight
            size={13}
            stroke={2.5}
            className={`text-gray-400 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
          />
        </button>
      </aside>

      <header
        className={`hidden lg:flex fixed top-0 z-40 bg-white border-b border-gray-100 shadow-sm items-center px-6 h-14 transition-all duration-300 ${
          collapsed ? "left-[72px] w-[calc(100%-72px)]" : "left-56 w-[calc(100%-224px)]"
        }`}
      >
        <h1 className="text-sm font-bold text-gray-500">
          Welcome back, <span className="text-gray-900">{user.name || "Admin"}</span> 👋
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
      </header>

      <header className="lg:hidden fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1a6fa8] flex items-center justify-center">
            <IconHeartbeat size={16} stroke={2.5} className="text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-sm">PulseCare Admin</span>
        </div>
        <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-56 h-full bg-white flex flex-col shadow-xl">
            <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#1a6fa8] flex items-center justify-center">
                <IconHeartbeat size={18} stroke={2.5} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">PulseCare</p>
                <p className="text-[10px] text-[#1a6fa8] font-semibold">Admin Panel</p>
              </div>
            </div>
            <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
              {links.map((link) => (
                <NavLink key={link.url} to={link.url}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? "bg-[#1a6fa8] text-white" : "text-gray-500 hover:bg-[#f4f7fb] hover:text-[#1a6fa8]"
                    }`
                  }
                >
                  {link.icon} {link.name}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Avatar size={30} radius="xl" color="blue" style={{ fontWeight: 700 }}>
                  {user.name?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-gray-400">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-500 rounded-xl hover:bg-red-50">
                <IconLogout size={15} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`hidden lg:block fixed top-0 left-0 h-screen pointer-events-none transition-all duration-300 ${collapsed ? "w-[72px]" : "w-56"}`} />
    </>
  );
};

export default AdminNavbar;