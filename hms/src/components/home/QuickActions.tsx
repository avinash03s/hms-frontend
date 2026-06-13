import { Link } from "react-router-dom";
import {
  IconCalendarTime,
  IconPackage,
  IconRobot,
  IconPill,
  IconSearch,
  IconStethoscope,
} from "@tabler/icons-react";

const actions = [
  {
    title: "Book Appointment",
    icon: <IconCalendarTime size={30} stroke={1.5} />,
    to: "/find-doctor",
    color: "#1a6fa8",
    bg: "#e8f1fb",
  },
  {
    title: "Health Packages",
    icon: <IconPackage size={30} stroke={1.5} />,
    to: "/health-packages",
    color: "#0d9488",
    bg: "#e8f5f2",
  },
  {
    title: "Find A Doctor",
    icon: <IconSearch size={30} stroke={1.5} />,
    to: "/find-doctor",
    color: "#7c3aed",
    bg: "#f0ebfe",
  },
  {
    title: "Specialities",
    icon: <IconStethoscope size={30} stroke={1.5} />,
    to: "/specialities",
    color: "#0891b2",
    bg: "#e0f5fa",
  },
  // {
  //   title: "Pharmacy",
  //   icon: <IconPill size={30} stroke={1.5} />,
  //   to: "/login",
  //   color: "#d97706",
  //   bg: "#fef3e0",
  // },
];

const QuickActions = () => {
  return (
    <section className="bg-white py-0 px-4 sm:px-6 lg:px-12 relative z-10">
      <div className="max-w-2xl mx-auto">

        <div
         className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex flex-wrap justify-center gap-2"
          style={{ marginTop: -36 }}
        >
          {actions.map((action) => (
            <Link key={action.title} to={action.to}>
              <div className="flex flex-col items-center gap-2.5 px-2 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ background: action.bg, color: action.color }}
                >
                  {action.icon}
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-[#1a6fa8] transition-colors leading-tight">
                  {action.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;