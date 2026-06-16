import {
     TextInput
} from "@mantine/core";
import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { IconSearch } from '@tabler/icons-react';
import { getMyBookings } from "../../../service/HealthPackageService";
import { formatDateWithTime } from "../../../utility/DateUtility";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";

const inputStyles = {
    input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 }
};

const MyPackages = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        packageName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

    const getSeverity = (status: string) => {
        switch (status) {
            case 'CANCELLED': return 'danger';
            case 'COMPLETED': return 'success';
            case 'CONFIRMED': return 'info';
            case 'PENDING': return 'warning';
            default: return null;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        getMyBookings().then((res) => {
            const data = res?.data || res;
            setBookings(Array.isArray(data) ? data : []);
        }).catch((error) => console.error("Error fetching bookings:", error));
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters: any = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const statusBodyTemplate = (rowData: any) => <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;

    const dateTemplate = (rowData: any) => <span>{rowData.preferredDate} {rowData.timeSlot}</span>;

    const bookedAtTemplate = (rowData: any) => <span>{formatDateWithTime(rowData.bookedAt)}</span>;

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
            <Navbar />

            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">

                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900">My Packages</h1>
                    <p className="text-sm text-gray-400 mt-1">View your booked health packages</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    <div className="h-2 bg-[#1a6fa8]" />

                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-5">
                            <TextInput
                                leftSection={<IconSearch size={16} />}
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                placeholder="Search packages..."
                                radius="md"
                                styles={inputStyles}
                                className="sm:w-64"
                            />
                        </div>

                        <DataTable
                            value={bookings} size="small" paginator rows={10}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            rowsPerPageOptions={[10, 25, 50]} dataKey="id"
                            filters={filters} filterDisplay="menu"
                            globalFilterFields={['packageName', 'patientName', 'status']}
                            emptyMessage="No package bookings found."
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        >
                            <Column field="packageName" header="Package" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
                            <Column field="patientName" header="Patient" sortable style={{ minWidth: '12rem' }} />
                            <Column header="Preferred Slot" style={{ minWidth: '13rem' }} body={dateTemplate} />
                            <Column header="Booked At" sortable style={{ minWidth: '13rem' }} body={bookedAtTemplate} />
                            <Column field="status" header="Status" sortable filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '10rem' }} body={statusBodyTemplate} filter />
                        </DataTable>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MyPackages;