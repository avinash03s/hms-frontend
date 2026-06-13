import {Badge,Breadcrumbs,Button,Card,Divider,Group,Tabs,Text,Title} from "@mantine/core";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAppointmentDetails } from "../../../service/AppointmentService";
import { formatDateWithTime } from "../../../utility/DateUtility";
import {
    IconClipboardHeart,
    IconPlus
} from "@tabler/icons-react";

import AppointmentReport from "./AppointmentReport";

const AppointmentDetails = () => {

    const { id } = useParams();

    const [appointment, setAppointment] = useState<any>({});

    const [openReport, setOpenReport] = useState(false);

    useEffect(() => {

        getAppointmentDetails(id)
            .then((res) => {

                console.log("Appointment Details:", res);

                setAppointment(res);

            })
            .catch((err) => {

                console.error(
                    "Error fetching appointment details:",
                    err
                );

            });

    }, [id]);

    return (

        <div className="w-full px-3 sm:px-4 md:px-6 py-3">

            <div className="overflow-x-auto">
                <Breadcrumbs my="md">

                    <Link
                        className="text-primary-400 hover:underline whitespace-nowrap text-sm sm:text-base"
                        to="/doctor/dashboard"
                    >
                        Dashboard
                    </Link>

                    <Link
                        className="text-primary-400 hover:underline whitespace-nowrap text-sm sm:text-base"
                        to="/doctor/appointments"
                    >
                        Appointments
                    </Link>

                    <Text className="text-primary-400 whitespace-nowrap text-sm sm:text-base">
                        Details
                    </Text>

                </Breadcrumbs>
            </div>

            <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className="w-full overflow-hidden"
            >

                <Group
                    justify="space-between"
                    mb="sm"
                    className="flex-col sm:flex-row items-start sm:items-center gap-3"
                >

                    <Title
                        order={2}
                        className="!text-xl sm:!text-2xl break-words"
                    >
                        {appointment.patientName || "Patient"}
                    </Title>

                    <Badge
                        color={
                            appointment.status === "CANCELLED"
                                ? "red"
                                : appointment.status === "COMPLETED"
                                    ? "green"
                                    : "blue"
                        }
                        variant="light"
                        className="shrink-0"
                    >
                        {appointment.status}
                    </Badge>

                </Group>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                    <Text className="break-words text-sm sm:text-base">
                        <strong>Email:</strong>{" "}
                        {appointment.patientEmail || "—"}
                    </Text>

                    <Text className="break-words text-sm sm:text-base">
                        <strong>Phone:</strong>{" "}
                        {appointment.patientPhone || "—"}
                    </Text>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Text className="break-words text-sm sm:text-base">
                        <strong>Reason:</strong>{" "}
                        {appointment.reason || "—"}
                    </Text>

                    <Text className="break-words text-sm sm:text-base">
                        <strong>Appointment Time:</strong>{" "}
                        {
                            appointment.appointmentTime
                                ? formatDateWithTime(
                                    appointment.appointmentTime
                                )
                                : "—"
                        }
                    </Text>

                </div>

                {
                    appointment.notes && (

                        <Text
                            mt="sm"
                            color="dimmed"
                            size="sm"
                            className="break-words leading-6"
                        >

                            <strong>Notes:</strong>{" "}
                            {appointment.notes}

                        </Text>

                    )
                }

            </Card>

            <Tabs
                variant="pills"
                my="md"
                defaultValue="report"
            >
                <div className="overflow-x-auto">

                    <Tabs.List className="flex-nowrap min-w-max">

                        <Tabs.Tab
                            value="report"
                            leftSection={
                                <IconClipboardHeart size={18} />
                            }
                            className="whitespace-nowrap"
                        >
                            Report
                        </Tabs.Tab>

                    </Tabs.List>

                </div>

                <Divider my="md" />
                <Tabs.Panel value="report">

                    {
                        appointment.status !== "COMPLETED" &&
                        !openReport && (

                            <div className="flex justify-center sm:justify-end mb-5">

                                <Button
                                    leftSection={
                                        <IconPlus size={18} />
                                    }
                                    onClick={() =>
                                        setOpenReport(true)
                                    }
                                    fullWidth={window.innerWidth < 640}
                                    className="sm:w-auto"
                                >
                                    Add Report
                                </Button>

                            </div>
                        )
                    }

                    {
                        openReport && (

                            <div className="w-full overflow-hidden">

                                <AppointmentReport
                                    appointment={appointment}
                                    onClose={() =>
                                        setOpenReport(false)
                                    }
                                />

                            </div>

                        )
                    }

                    {
                        appointment.status === "COMPLETED" &&
                        !openReport && (

                            <Card
                                withBorder
                                radius="md"
                                padding="lg"
                                className="text-center w-full"
                            >

                                <Text
                                    size="lg"
                                    fw={600}
                                    c="green"
                                    className="text-base sm:text-lg"
                                >
                                    Report Already Submitted
                                </Text>

                                <Text
                                    size="sm"
                                    c="dimmed"
                                    mt={5}
                                    className="text-sm"
                                >
                                    This appointment has been completed.
                                </Text>

                            </Card>

                        )
                    }

                </Tabs.Panel>

            </Tabs>

        </div>
    );
};

export default AppointmentDetails;