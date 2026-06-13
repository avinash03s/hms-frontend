import {
    ActionIcon, SegmentedControl, Text, TextInput
} from "@mantine/core";
import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { useSelector } from "react-redux";
import {
    cancelAppointment, getAppointmentsByPatient
} from "../../../service/AppointmentService";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { formatDateWithTime } from "../../../utility/DateUtility";
import { modals } from "@mantine/modals";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";

const inputStyles = {
    input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 }
};

const Appointment = () => {
    const user = useSelector((state: any) => state.user);
    const [tab, setTab] = useState<string>('Today');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        doctorName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        reason: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

    const getSeverity = (status: string) => {
        switch (status) {
            case 'CANCELLED': return 'danger';
            case 'COMPLETED': return 'success';
            case 'SCHEDULED': return 'info';
            default: return null;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        getAppointmentsByPatient(user.profileId).then((data) => {
            setAppointments(data || []);
        }).catch((error) => console.error("Error fetching appointments:", error));
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters: any = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const handleDelete = (rowData: any) => {
        modals.openConfirmModal({
            title: <span className="text-xl font-serif font-semibold">Are You sure</span>,
            centered: true,
            children: <Text size="sm">You want to Cancel this appointment?</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                cancelAppointment(rowData.id).then(() => {
                    successNotification("Appointment cancelled successfully");
                    setAppointments(appointments.map((a) =>
                        a.id == rowData.id ? { ...a, status: "CANCELLED" } : a
                    ));
                }).catch((error) => {
                    errorNotification(error.response?.data?.errorMessage || "Failed to cancel");
                });
            },
        });
    };

    const statusBodyTemplate = (rowData: any) => <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;

    const actionBodyTemplate = (rowData: any) => (
        rowData.status === 'SCHEDULED' ? (
            <ActionIcon color="red" variant="light" radius="md" onClick={() => handleDelete(rowData)}>
                <IconTrash size={18} stroke={1.5} />
            </ActionIcon>
        ) : (
            <span className="text-gray-300">—</span>
        )
    );

    const timeTemplate = (rowData: any) => <span>{formatDateWithTime(rowData.appointmentTime)}</span>;

    const filteredAppointments = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentTime);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const appointmentDay = new Date(appointmentDate); appointmentDay.setHours(0, 0, 0, 0);
        if (tab === "Today") return appointmentDay.getTime() === today.getTime();
        if (tab === "Upcoming") return appointmentDay.getTime() > today.getTime();
        if (tab === "Past") return appointmentDay.getTime() < today.getTime();
        return true;
    });

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
            <Navbar />

            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">

             
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900">My Appointments</h1>
                    <p className="text-sm text-gray-400 mt-1">View and manage your scheduled appointments</p>
                </div>

               
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

               
                    <div className="h-2 bg-[#1a6fa8]" />

                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                            <SegmentedControl
                                value={tab}
                                onChange={setTab}
                                data={["Today", "Upcoming", "Past"]}
                                color="#1a6fa8"
                                radius="md"
                            />
                            <TextInput
                                leftSection={<IconSearch size={16} />}
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                placeholder="Search appointments..."
                                radius="md"
                                styles={inputStyles}
                                className="sm:w-64"
                            />
                        </div>

                        <DataTable
                            value={filteredAppointments} size="small" paginator rows={10}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            rowsPerPageOptions={[10, 25, 50]} dataKey="id"
                            filters={filters} filterDisplay="menu"
                            globalFilterFields={['doctorName', 'reason', 'notes', 'status']}
                            emptyMessage="No appointment found."
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        >
                            <Column field="doctorName" header="Doctor" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                            <Column field="appointmentTime" header="Appointment Time" sortable style={{ minWidth: '13rem' }} body={timeTemplate} />
                            <Column field="reason" header="Reason" sortable filter filterPlaceholder="Search by reason" style={{ minWidth: '12rem' }} />
                            <Column field="notes" header="Notes" style={{ minWidth: '12rem' }} />
                            <Column field="status" header="Status" sortable filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '10rem' }} body={statusBodyTemplate} filter />
                            <Column headerStyle={{ width: '5rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionBodyTemplate} />
                        </DataTable>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Appointment;