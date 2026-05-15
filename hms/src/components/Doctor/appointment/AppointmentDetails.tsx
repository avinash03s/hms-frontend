import { Badge, Breadcrumbs, Card, Divider, Group, Tabs, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import { getAppointmentDetails } from "../../../service/AppointmentService";
import { formatDateWithTime } from "../../../utility/DateUtility";
import { IconClipboardHeart, } from "@tabler/icons-react";
import AppointmentReport from "./AppointmentReport";

const AppointmentDetails = () => {

    const { id } = useParams();

    const [appointment, setAppointment] = useState<any>({});

    useEffect(() => {
        getAppointmentDetails(id)
            .then((res) => {
                console.log("Appointment Details:", res);
                setAppointment(res);
            })
            .catch((err) => {
                console.error("Error fetching appointment details:", err);
            });
    }, [id]);

    return (
        <div>
            <Breadcrumbs my="md">
                <Link className="text-primary-400 hover:underline" to="/doctor/dashboard">
                    Dashboard
                </Link>
                <Link className="text-primary-400 hover:underline" to="/doctor/appointments">
                    Appointments
                </Link>
                <Text className="text-primary-400">Details</Text>
            </Breadcrumbs>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="sm">
                    <Title order={2}>{appointment.patientName}</Title>
                    <Badge color={appointment.status === 'CANCELLED' ? 'red' : 'green'} variant="light">
                        {appointment.status}
                    </Badge>
                </Group>

                <div className="grid grid-cols-2 gap-5 mb-2">
                    <Text><strong>Email:</strong> {appointment.patientEmail}</Text>
                    <Text><strong>Phone:</strong> {appointment.patientPhone}</Text>
                </div>

                <div className="grid grid-cols-2 gap-5">

                    <Text><strong>Reason:</strong> {appointment.reason}</Text>
                    <Text><strong>Appointment Time:</strong> {formatDateWithTime(appointment.appointmentTime)}</Text>
                </div>
                {appointment.notes && (
                    <Text mt="sm" color="dimmed" size="sm">
                        <strong>Notes:</strong> {appointment.notes}
                    </Text>
                )}
            </Card>

            <Tabs variant="pills" my='md' defaultValue="report">
                <Tabs.List>
                    {/* <Tabs.Tab value="medical" leftSection={<IconStethoscope size={20} />}>
                        Medical History
                    </Tabs.Tab>
                    <Tabs.Tab value="prescription" leftSection={<IconVaccine size={20} />}>
                        Prescription
                    </Tabs.Tab> */}
                    <Tabs.Tab value="report" leftSection={<IconClipboardHeart size={20} />}>
                        Report
                    </Tabs.Tab>
                </Tabs.List>

                {/* <Divider my='md/> */}
                <Divider my="md" />

                <Tabs.Panel value="medical">
                    Medical
                </Tabs.Panel>

                <Tabs.Panel value="prescription">
                    Prescription
                </Tabs.Panel>

                <Tabs.Panel value="report">
                    <AppointmentReport appointment={appointment} />
                </Tabs.Panel>
            </Tabs>

        </div>
    );
}
export default AppointmentDetails