import { IconHeartbeat, IconLayoutGrid, IconCalendarCheck, IconUser, IconReportMedical, IconMenu2, IconX } from "@tabler/icons-react";
import { Avatar } from "@mantine/core";
import { Text } from '@mantine/core';
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getDoctor } from "../../../service/DoctorProfileService";


const links = [
    {
        name: "Dashboard", url: "/doctor/dashboard", icons: <IconLayoutGrid stroke={1.5} />
    },
    {
        name: "Profile", url: "/doctor/profile", icons: <IconUser stroke={1.5} />
    },
    {
        name: "Appointments", url: "/doctor/appointments", icons: <IconCalendarCheck stroke={1.5} />
    },
    {
        name: "Reports", url: "/doctor/reports", icons: <IconReportMedical stroke={1.5} />
    },
    {
        name: "Pharmacy", url: "/doctor/pharmacy", icons: <IconReportMedical stroke={1.5} />
    },
];

const Sidebar = () => {
    const user = useSelector((state: any) => state.user);
    const [doctor, setProfile] = useState<any>({});
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (user?.profileId) {
            getDoctor(user.profileId)
                .then((data) => {
                    setProfile(data);
                });
        }
    }, [user]);

    // Close sidebar when route changes on mobile
    const handleNavClick = () => {
        setMobileOpen(false);
    };

    return (
        <>
            {/* ── Inline responsive styles ── */}
            <style>{`
                .sidebar-spacer {
                    width: 256px;
                    flex-shrink: 0;
                }
                .sidebar-panel {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 256px;
                    height: 100vh;
                    z-index: 200;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                    align-items: center;
                    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 199;
                    backdrop-filter: blur(2px);
                }
                .hamburger-btn {
                    display: none;
                    position: fixed;
                    top: 14px;
                    left: 14px;
                    z-index: 300;
                    background: #1a1a2e;
                    border: none;
                    border-radius: 8px;
                    padding: 8px;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                }
                .sidebar-logo {
                    position: sticky;
                    top: 0;
                    z-index: 500;
                    padding: 12px 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }

                /* Tablet: narrower sidebar */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .sidebar-spacer {
                        width: 200px;
                    }
                    .sidebar-panel {
                        width: 200px;
                    }
                }

                /* Mobile: hidden sidebar, hamburger visible */
                @media (max-width: 768px) {
                    .sidebar-spacer {
                        width: 0;
                    }
                    .sidebar-panel {
                        width: 260px;
                        transform: translateX(-100%);
                    }
                    .sidebar-panel.mobile-open {
                        transform: translateX(0);
                    }
                    .sidebar-overlay {
                        display: block;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.28s ease;
                    }
                    .sidebar-overlay.mobile-open {
                        opacity: 1;
                        pointer-events: auto;
                    }
                    .hamburger-btn {
                        display: flex;
                    }
                }
            `}</style>

            {/* Hamburger button — only visible on mobile */}
            <button
                className="hamburger-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
            >
                <IconMenu2 size={22} stroke={1.8} />
            </button>

            {/* Dark overlay — clicking closes sidebar on mobile */}
            <div
                className={`sidebar-overlay ${mobileOpen ? "mobile-open" : ""}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Main flex wrapper — spacer + fixed sidebar */}
            <div className="flex">

                {/* Spacer so main content doesn't go under sidebar */}
                <div className="sidebar-spacer" />

                {/* Fixed sidebar panel */}
                <div className={`sidebar-panel bg-dark hide-scrollbar ${mobileOpen ? "mobile-open" : ""}`}>

                    {/* Logo — sticky at top */}
                    <div className="sidebar-logo bg-dark text-primary-400 flex gap-1 items-center">
                        {/* Close button inside sidebar on mobile */}
                        <button
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close sidebar"
                            style={{
                                display: 'none',
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit',
                                padding: 4,
                            }}
                            className="sidebar-close-btn"
                        >
                            <IconX size={20} stroke={1.8} />
                        </button>
                        <IconHeartbeat size={40} stroke={3} />
                        <span className="font-heading font-semibold text-3xl">PulseCare</span>
                    </div>

                    {/* Avatar + nav links */}
                    <div className="flex flex-col mt-4 gap-5 w-full">

                        {/* Doctor avatar */}
                        <div className="flex flex-col gap-1 items-center">
                            <div className="p-1 bg-white rounded-full shadow-lg">
                                <Avatar
                                    variant="filled"
                                    src={
                                        doctor?.profilePictureId
                                            ? `http://localhost:9000/profile/files/${doctor.profilePictureId}`
                                            : "/avatar.png"
                                    }
                                    size={90}
                                    alt="it's me"
                                />
                            </div>
                            <span className="font-medium text-light">{user.name}</span>
                            <Text c="dimmed" size="xs" className="text-light">{user.role}</Text>
                        </div>

                        {/* Nav links */}
                        <div className="flex flex-col gap-1 w-full px-3">
                            {links.map((link, index) => (
                                <NavLink
                                    key={index}
                                    to={link.url}
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 w-full font-medium 
                                        text-light px-4 py-5 rounded-lg ${isActive
                                            ? "bg-primary-400 text-dark"
                                            : "hover:bg-gray-100 hover:text-dark"
                                        }`
                                    }
                                >
                                    {link.icons}
                                    <span>{link.name}</span>
                                </NavLink>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Extra style for mobile close button inside sidebar */}
            <style>{`
                @media (max-width: 768px) {
                    .sidebar-close-btn {
                        display: block !important;
                    }
                    .sidebar-logo {
                        position: relative;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;