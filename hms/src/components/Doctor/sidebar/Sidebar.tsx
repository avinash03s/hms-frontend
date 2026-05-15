import { IconHeartbeat, IconLayoutGrid, IconCalendarCheck, IconUser, IconReportMedical } from "@tabler/icons-react";
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
]

const Sidebar = () => {
    const user = useSelector((state: any) => state.user);
    const [doctor, setProfile] = useState<any>({});

    useEffect(() => {

        if (user?.profileId) {

            getDoctor(user.profileId)
                .then((data) => {
                    setProfile(data);
                });

        }

    }, [user])

    return (
        <div className="flex">
            <div className="w-64">

            </div>
            <div className="fixed w-64 h-screen bg-dark overflow-y-auto hide-scrollbar flex flex-col gap-7 items-center">
                <div className="fixed z-[500] bg-dark py-3 text-primary-400 flex gap-1 items-center">
                    <IconHeartbeat size={40} stroke={3} />
                    <span className="font-heading font-semibold text-3xl">PulseCare</span>
                </div>

                <div className="flex flex-col mt-20 gap-5">
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


                    <div className="flex flex-col gap-1 w-full px-3">
                        {links.map((link, index) => (
                            <NavLink
                                key={index}
                                to={link.url}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 w-full font-medium 
      text-light px-4 py-5 rounded-lg ${isActive ? "bg-primary-400 text-dark" : "hover:bg-gray-100 hover:text-dark"}`
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
    );
};

export default Sidebar;