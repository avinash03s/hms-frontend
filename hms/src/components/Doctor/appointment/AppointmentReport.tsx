import { ActionIcon, Button, Fieldset, MultiSelect, NumberInput, Select, Textarea, TextInput } from "@mantine/core"
import { dosageFrequencies, symptoms, tests } from "../../../data/DropDownData"
import { IconTrash } from "@tabler/icons-react"
import { useForm } from "@mantine/form";
import { createAppointmentReport } from "../../../service/AppointmentService";
import { errorNotification, successNotification } from "../../../utility/Notification";
// import { useDispatch } from "react-redux";
import { useState } from "react";

type Medicine = {
    name: string;
    medicineId?: number;
    dosage: string;
    frequency: string;
    duration: number; // in days
    route: string;    // e.g., oral, intravenous (fixed typo from 'routrie')
    type: string;     // e.g., tablet, syrup, injection
    instructions: string;
    prescriptionId?: number;
};

const AppointmentReport = ({ appointment }: any) => {

    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            symptoms: [],
            tests: [],
            diagnosis: '',
            referral: '',
            notes: '',
            prescription: {
                medicines: [] as Medicine[]
            }
        },

        validate: {
            symptoms: (value) => (value.length > 0 ? null : 'Please select at least one symptom'),
            diagnosis: (value) => (value?.trim() ? null : 'Diagnosis is required'),
            prescription: {
                medicines: {
                    name: (value) => (value?.trim() ? null : 'Medicine name is required'),
                    dosage: (value) => (value?.trim() ? null : 'Dosage is required'),
                    frequency: (value) => (value ? null : 'Frequency is required'),
                    duration: (value) => (value > 0 ? null : 'Duration must be greater than 0'),
                    route: (value) => (value ? null : 'Route is required'),
                    type: (value) => (value ? null : 'Type is required'),
                    instructions: (value) => (value?.trim() ? null : 'Instructions are required')
                }
            }
        }
    });

    const insertMedicine = () => {
        form.insertListItem('prescription.medicines', {
            name: '',
            dosage: '',
            frequency: '',
            duration: 0,
            route: '',
            type: '',
            instructions: ''
        });
    };

    const removeMedicine = (index: number) => {
        form.removeListItem('prescription.medicines', index);
    }

    const handleSubmit = (values: typeof form.values) => {
        console.log("Form Submitted with values:", values);

        let data = {
            ...values,
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            prescription: {
                ...values.prescription,
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                appointmentId: appointment.id,
            }
        }
        setLoading(true);
        createAppointmentReport(data).then(() => {
            successNotification("Report Created Successfully")
            form.reset();
        })
            .catch(() => {
                errorNotification("Failed to create report")
            })
            .finally(() => {
                setLoading(false);
            })
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="grid gap-5">
            <Fieldset className="grid grid-cols-2 gap-5" legend={<span className="text-lg font-medium text-primary-500">Personal information</span>} radius="md">
                <MultiSelect {...form.getInputProps("symptoms")} withAsterisk className="col-span-2"
                    label="Symptoms"
                    placeholder="Pick symptoms"
                    data={symptoms}
                />
                <MultiSelect {...form.getInputProps("tests")} withAsterisk className="col-span-2"
                    label="Tests"
                    placeholder="Pick tests"
                    data={tests}
                />

                <TextInput {...form.getInputProps("diagnosis")} label="Diagnosis" placeholder="Enter Diagnosis" withAsterisk />
                <TextInput {...form.getInputProps("referral")} label="Referral" placeholder="Enter Referral" withAsterisk />
                <Textarea {...form.getInputProps("notes")} className="col-span-2" label="Notes" placeholder="Enter any Additional Notes" />
            </Fieldset>


            <Fieldset className="grid gap-5" legend={<span className="text-lg font-medium text-primary-500">Prescription</span>} radius="md">
                {
                    form.values.prescription.medicines.map((_medicine: Medicine, index: number) => (

                        <fieldset className="grid col-span-2 grid-cols-2 gap-4">
                            <div className="flex col-span-2 items-center justify-between">
                                <h1 className="text-lg font-medium">Medicine{index + 1} </h1>
                                <ActionIcon onClick={() => removeMedicine(index)} variant="filled" color="red" size="lg" className="mb-2">
                                    <IconTrash />
                                </ActionIcon>
                            </div>
                            <TextInput {...form.getInputProps(`prescription.medicines.${index}.name`)} label="Medicine" placeholder="Enter Medicine Name" withAsterisk />
                            <TextInput {...form.getInputProps(`prescription.medicines.${index}.dosage`)} label="Dosage" placeholder="Enter dosage" withAsterisk />
                            <Select {...form.getInputProps(`prescription.medicines.${index}.frequency`)} label="Frequency" placeholder="Enter Frequency" withAsterisk data={dosageFrequencies} />
                            <NumberInput
                                {...form.getInputProps(`prescription.medicines.${index}.duration`)}
                                label="Duration (days)"
                                placeholder="Enter duration in days"
                                withAsterisk
                            />
                            <Select
                                {...form.getInputProps(`prescription.medicines.${index}.route`)}
                                label="Route"
                                placeholder="Select route"
                                withAsterisk
                                data={["Oral", "Intravenous", "Topical", "Inhalation"]}
                            />

                            <Select
                                {...form.getInputProps(`prescription.medicines.${index}.type`)}
                                label="Type"
                                placeholder="Select type"
                                withAsterisk
                                data={["Tablet", "Syrup", "Injection", "Capsule", "Ointment"]}
                            />

                            <TextInput {...form.getInputProps(`prescription.medicines.${index}.instructions`)} label="Instructions" placeholder="Enter Instructions" withAsterisk />
                        </fieldset>

                    ))
                }
                <div className="flex items-center col-span-2 justify-center">
                    <Button
                        onClick={insertMedicine}
                        variant="outline"
                        color="blue"
                        className="col-span-2"
                    >
                        Add Medicine
                    </Button>
                </div>

            </Fieldset>

            <div className="flex items-center gap-5 justify-center">
                <Button
                    loading={loading}
                    type="submit"
                    className="w-full"
                    variant="filled"
                    color="primary"
                >
                    Submit Report
                </Button>

                <Button
                    loading={loading}
                    variant="filled"
                    color="red"
                >
                    Cancel
                </Button>
            </div>

        </form>
    )
}
export default AppointmentReport