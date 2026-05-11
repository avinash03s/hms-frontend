import {
    ActionIcon,
    Button,
    Fieldset,
    MultiSelect,
    NumberInput,
    Select,
    Textarea,
    TextInput
} from "@mantine/core";

import { dosageFrequencies, symptoms, tests } from "../../../data/DropDownData";
import { IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import {
    createAppointmentReport, createPrescription
} from "../../../service/AppointmentService";
import {
    errorNotification,
    successNotification
} from "../../../utility/Notification";
import { useState } from "react";
import { useSelector } from "react-redux";  // ← ADD

type Medicine = {
    medicineName: string;
    medicineId?: number;
    dosage: string;
    frequency: string;
    duration: number;
    routes: string;
    type: string;
    instructions: string;
    prescriptionId?: number;
};

const AppointmentReport = ({ appointment }: any) => {
    const [loading, setLoading] = useState(false);
    const user = useSelector((state: any) => state.user);  // ← ADD

    const form = useForm({
        initialValues: {
            symptoms: [],
            tests: [],
            diagnosis: "",
            referral: "",
            notes: "",
            prescription: {
                medicines: [] as Medicine[]
            }
        },

        validate: {
            symptoms: (value) =>
                value.length > 0 ? null : "Please select at least one symptom",
            diagnosis: (value) =>
                value?.trim() ? null : "Diagnosis is required",
            prescription: {
                medicines: {
                    medicineName: (value) =>
                        value?.trim() ? null : "Medicine name is required",
                    dosage: (value) =>
                        value?.trim() ? null : "Dosage is required",
                    frequency: (value) =>
                        value ? null : "Frequency is required",
                    duration: (value) =>
                        value > 0 ? null : "Duration must be greater than 0",
                    routes: (value) =>
                        value ? null : "Route is required",
                    type: (value) =>
                        value ? null : "Type is required",
                    instructions: (value) =>
                        value?.trim() ? null : "Instructions are required"
                }
            }
        }
    });

    const insertMedicine = () => {
        form.insertListItem("prescription.medicines", {
            medicineName: "",
            medicineId: undefined,
            dosage: "",
            frequency: "",
            duration: 0,
            routes: "",
            type: "",
            instructions: ""
        });
    };

    const removeMedicine = (index: number) => {
        form.removeListItem("prescription.medicines", index);
    };

    const handleSubmit = (values: typeof form.values) => {
        const doctorId = user.profileId;  // ← Redux se doctor ID
        const patientId = appointment.patientId;
        const appointmentId = appointment.id;

        const reportData = {
            ...values,
            doctorId,
            patientId,
            appointmentId,
        };

        const prescriptionData = {
            ...values.prescription,
            doctorId,
            patientId,
            appointmentId,
        };

        setLoading(true);

        Promise.all([
            createAppointmentReport(reportData),
            createPrescription(prescriptionData)
        ])
            .then(() => {
                successNotification("Report Created Successfully");
                form.reset();
            })
            .catch(() => {
                errorNotification("Failed to create report");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="grid gap-5">

            <Fieldset
                className="grid grid-cols-2 gap-5"
                legend={<span className="text-lg font-medium text-primary-500">Patient Information</span>}
            >
                <MultiSelect
                    {...form.getInputProps("symptoms")}
                    label="Symptoms"
                    placeholder="Pick symptoms"
                    data={symptoms}
                    className="col-span-2"
                />
                <MultiSelect
                    {...form.getInputProps("tests")}
                    label="Tests"
                    placeholder="Pick tests"
                    data={tests}
                    className="col-span-2"
                />
                <TextInput
                    {...form.getInputProps("diagnosis")}
                    label="Diagnosis"
                    placeholder="Enter Diagnosis"
                    withAsterisk
                />
                <TextInput
                    {...form.getInputProps("referral")}
                    label="Referral"
                    placeholder="Enter Referral"
                />
                <Textarea
                    {...form.getInputProps("notes")}
                    label="Notes"
                    placeholder="Additional Notes"
                    className="col-span-2"
                />
            </Fieldset>

            <Fieldset
                className="grid gap-5"
                legend={<span className="text-lg font-medium text-primary-500">Prescription</span>}
            >
                {form.values.prescription.medicines.map((_, index) => (
                    <fieldset key={index} className="grid grid-cols-2 gap-4 col-span-2">
                        <div className="flex justify-between col-span-2 items-center">
                            <h1 className="text-lg font-medium">Medicine {index + 1}</h1>
                            <ActionIcon color="red" variant="filled" onClick={() => removeMedicine(index)}>
                                <IconTrash size={18} />
                            </ActionIcon>
                        </div>
                        <TextInput
                            {...form.getInputProps(`prescription.medicines.${index}.medicineName`)}
                            label="Medicine Name"
                            placeholder="Enter Medicine Name"
                            withAsterisk
                        />
                        <TextInput
                            {...form.getInputProps(`prescription.medicines.${index}.dosage`)}
                            label="Dosage"
                            placeholder="Enter Dosage"
                            withAsterisk
                        />
                        <Select
                            {...form.getInputProps(`prescription.medicines.${index}.frequency`)}
                            label="Frequency"
                            data={dosageFrequencies}
                            placeholder="Select Frequency"
                            withAsterisk
                        />
                        <NumberInput
                            {...form.getInputProps(`prescription.medicines.${index}.duration`)}
                            label="Duration (days)"
                            placeholder="Enter duration"
                            withAsterisk
                        />
                        <Select
                            {...form.getInputProps(`prescription.medicines.${index}.routes`)}
                            label="Route"
                            data={["Oral", "Intravenous", "Topical", "Inhalation"]}
                            placeholder="Select Route"
                            withAsterisk
                        />
                        <Select
                            {...form.getInputProps(`prescription.medicines.${index}.type`)}
                            label="Type"
                            data={["Tablet", "Capsule", "Syrup", "Injection"]}
                            placeholder="Select Type"
                            withAsterisk
                        />
                        <TextInput
                            {...form.getInputProps(`prescription.medicines.${index}.instructions`)}
                            label="Instructions"
                            placeholder="Enter Instructions"
                            withAsterisk
                        />
                    </fieldset>
                ))}
                <div className="flex justify-center col-span-2">
                    <Button onClick={insertMedicine} variant="outline">
                        Add Medicine
                    </Button>
                </div>
            </Fieldset>

            <div className="flex gap-5 justify-center">
                <Button loading={loading} type="submit" fullWidth>
                    Submit Report
                </Button>
                <Button color="red" variant="filled">
                    Cancel
                </Button>
            </div>

        </form>
    );
};

export default AppointmentReport;