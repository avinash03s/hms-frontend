import { ActionIcon, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMenu2 } from "@tabler/icons-react";
import Sidebar from "../Patient/sidebar/Sidebar";
import DoctorSidebar from "../Doctor/sidebar/Sidebar"
import { useSelector } from "react-redux";

const SideDrawer = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const user = useSelector((state: any) => state.user);

    return (
        <>
            <Drawer
                opened={opened}
                onClose={close}
                withCloseButton={false}
                p={0}
                size="auto"
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            >
                {user.role == "PATIENT" ? <Sidebar /> : user.role == "DOCTOR" ? <DoctorSidebar /> : null}
            </Drawer>

            <ActionIcon onClick={open} variant="filled" size='lg' aria-label="Menu">
                <IconMenu2 style={{ width: '90%', height: '90%' }} />
            </ActionIcon>
        </>
    );
}
export default SideDrawer