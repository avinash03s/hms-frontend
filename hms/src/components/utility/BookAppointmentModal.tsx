import {
    Modal, Select, Button, LoadingOverlay,
    Text, Textarea, SimpleGrid, Badge
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useSelector } from "react-redux";
import { appointmentReasons } from "../../data/DropDownData";
import { scheduleAppointment } from "../../service/AppointmentService";
import { errorNotification, successNotification } from "../../utility/Notification";
import axiosInstance from "../../interceptor/AxiosInterceptor";

interface Props {
    opened: boolean;
    onClose: () => void;
    doctorId?: string;
    doctorName?: string;
    doctors?: { value: string; label: string }[];
}

const inputStyles = {
    input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 }
};

const BookAppointmentModal = ({ opened, onClose, doctorId, doctorName, doctors = [] }: Props) => {
    const user = useSelector((state: any) => state.user);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [noSchedule, setNoSchedule] = useState(false);
    const navigate = useNavigate();
    const doctorIdRef = useRef<string>(doctorId || "");

    const form = useForm({
        initialValues: {
            doctorId: doctorId || "",
            patientId: user.profileId,
            reason: "",
            notes: "",
        },
        validate: {
            doctorId: (v) => !v ? "Doctor is required" : null,
            reason: (v) => !v ? "Reason is required" : null,
        },
    });

    // Keep form's doctorId in sync with prop (fixes prefilled-doctor case)
    useEffect(() => {
        if (doctorId) {
            form.setFieldValue("doctorId", doctorId);
            doctorIdRef.current = doctorId;
        }
    }, [doctorId]);

    // Also sync patientId once user is available
    useEffect(() => {
        if (user?.profileId) {
            form.setFieldValue("patientId", user.profileId);
        }
    }, [user?.profileId]);

    const fetchSlots = async (dId: string, date: Date) => {
        if (!dId || !date) return;
        setSlotsLoading(true);
        setAvailableSlots([]);
        setBookedSlots([]);
        setSelectedSlot(null);
        setNoSchedule(false);
        try {
            const dateStr = date.toISOString().split("T")[0];
            const res = await axiosInstance.get(`/appointment/slots/all?doctorId=${dId}&date=${dateStr}`);
            const { available, booked } = res.data;
            if (available.length === 0 && booked.length === 0) {
                setNoSchedule(true);
            } else {
                setAvailableSlots(available);
                setBookedSlots(booked);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.errorMessage;
            if (msg === "DOCTOR_SCHEDULE_NOT_FOUND") setNoSchedule(true);
            else errorNotification("Failed to load slots");
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleDoctorChange = (value: string | null) => {
        form.setFieldValue("doctorId", value || "");
        doctorIdRef.current = value || "";
        setSelectedSlot(null);
        setAvailableSlots([]);
        setNoSchedule(false);
        if (value && selectedDate) fetchSlots(value, selectedDate);
    };

    const handleDateChange = (date: string | Date | null) => {
        const parsedDate = date ? new Date(date) : null;
        setSelectedDate(parsedDate);
        setSelectedSlot(null);
        setAvailableSlots([]);
        setNoSchedule(false);
        const currentDoctorId = doctorId || doctorIdRef.current;
        if (currentDoctorId && parsedDate) fetchSlots(currentDoctorId, parsedDate);
    };

    const handleClose = () => {
        form.reset();
        setSelectedDate(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
        setNoSchedule(false);
        onClose();
    };

    const handleSubmit = (values: any) => {
        if (!selectedDate || !selectedSlot) {
            errorNotification("Please select date and time slot");
            return;
        }
        const appointmentTime = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}T${selectedSlot}:00`;
        const payload = {
            ...values,
            doctorId: Number(values.doctorId),
            patientId: Number(user.profileId),
            appointmentTime,
        };
        setLoading(true);
        scheduleAppointment(payload)
            .then(() => {
                successNotification("Appointment scheduled successfully!");
                handleClose();
                navigate("/patient/appointments");
            })
            .catch((err) => errorNotification(err?.response?.data?.errorMessage || "Failed to schedule"))
            .finally(() => setLoading(false));
    };

    const formatSlot = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            size="lg"
            centered
            radius="xl"
            title={
                <div>
                    <p className="font-bold text-lg text-[#1a6fa8]">Schedule Appointment</p>
                    {doctorName && (
                        <p className="text-xs text-gray-400 mt-0.5">Booking with Dr. {doctorName}</p>
                    )}
                </div>
            }
        >
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <form onSubmit={form.onSubmit(handleSubmit, (errors) => {
                console.log("Validation errors:", errors);
            })} className="flex flex-col gap-5">

                {/* Doctor — prefilled or dropdown */}
                {doctorId ? (
                    <div className="bg-[#f4f7fb] rounded-xl px-4 py-3 flex items-center justify-between border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Doctor</p>
                            <p className="font-bold text-gray-900">Dr. {doctorName}</p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-semibold border border-green-100">
                            ✓ Selected
                        </span>
                    </div>
                ) : (
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Doctor *</label>
                        <Select
                            {...form.getInputProps("doctorId")}
                            data={doctors}
                            placeholder="Select Doctor"
                            searchable
                            onChange={handleDoctorChange}
                            radius="md"
                            styles={inputStyles}
                        />
                    </div>
                )}

                {/* Date */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Appointment Date *</label>
                    <DatePickerInput
                        placeholder="Pick a date"
                        value={selectedDate}
                        onChange={(val) => handleDateChange(val as Date | null)}
                        minDate={new Date()}
                        radius="md"
                        styles={inputStyles}
                    />
                </div>

                {/* Slots */}
                {(slotsLoading || availableSlots.length > 0 || noSchedule ||
                    (!slotsLoading && selectedDate && (doctorId || form.values.doctorId))) && (
                        <div className="bg-[#f4f7fb] rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Text size="sm" fw={700}>Available Time Slots</Text>
                                {availableSlots.length > 0 && (
                                    <Badge color="blue" variant="light" size="sm">{availableSlots.length} slots</Badge>
                                )}
                            </div>
                            {slotsLoading && <Text size="sm" c="dimmed">Loading slots...</Text>}
                            {!slotsLoading && noSchedule && (
                                <Text size="sm" c="red">Doctor is not available on this day</Text>
                            )}
                            {!slotsLoading && !noSchedule && availableSlots.length === 0 && selectedDate && (
                                <Text size="sm" c="orange">All slots booked for this day</Text>
                            )}
                            {!slotsLoading && (availableSlots.length > 0 || bookedSlots.length > 0) && (
                                <SimpleGrid cols={4} spacing="xs">
                                    {availableSlots.map((slot) => (
                                        <Button key={slot} size="xs" radius="xl"
                                            variant={selectedSlot === slot ? "filled" : "outline"}
                                            color="#1a6fa8"
                                            onClick={() => setSelectedSlot(slot)}>
                                            {formatSlot(slot)}
                                        </Button>
                                    ))}
                                    {bookedSlots.map((slot) => (
                                        <Button key={slot} size="xs" radius="xl"
                                            variant="filled" color="red" disabled style={{ opacity: 0.5 }}>
                                            {formatSlot(slot)}
                                        </Button>
                                    ))}
                                </SimpleGrid>
                            )}
                        </div>
                    )}

                {/* Reason */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Reason *</label>
                    <Select
                        {...form.getInputProps("reason")}
                        data={appointmentReasons}
                        placeholder="Select reason"
                        searchable
                        radius="md"
                        styles={inputStyles}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Additional Notes</label>
                    <Textarea
                        {...form.getInputProps("notes")}
                        placeholder="Any additional notes..."
                        autosize minRows={2}
                        radius="md"
                        styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb" } }}
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    disabled={!selectedSlot || !selectedDate}
                    color="#1a6fa8"
                    radius="md"
                    size="md"
                >
                    {selectedSlot ? `Book ${formatSlot(selectedSlot)}` : "Select a slot to book"}
                </Button>
            </form>
        </Modal>
    );
};

export default BookAppointmentModal;