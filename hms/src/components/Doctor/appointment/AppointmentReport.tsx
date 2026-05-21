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

import {
    dosageFrequencies,
    symptoms,
    tests
} from "../../../data/DropDownData";

import { IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";

import { createAppointmentReport } from "../../../service/AppointmentService";
import { getAllMedicines }          from "../../../service/MedicineService";
import { errorNotification, successNotification } from "../../../utility/Notification";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// ── Types ──────────────────────────────────────────────────────────────────

type Medicine = {
    medicineName:   string;
    medicineId?:    number;
    dosage:         string;
    frequency:      string;
    duration:       number;
    routes:         string;
    type:           string;
    instructions:   string;
    prescriptionId?: number;
};

// Pharmacy medicine option for dropdown
type PharmacyOption = {
    value:        string;   // "123"  → medicineId as string  |  "OTHER" special
    label:        string;   // "Metoprolol – CardioLife Pharma (50mg)"
    medicineId:   number | null;
    medicineName: string;
    dosage:       string;   // ✅ auto-fill
    type:         string;   // ✅ auto-fill
};

// ── Component ─────────────────────────────────────────────────────────────

const AppointmentReport = ({ appointment, onClose }: any) => {

    const [loading,          setLoading]          = useState(false);
    const [pharmacyOptions,  setPharmacyOptions]  = useState<PharmacyOption[]>([]);

    // Per-row state: track whether "Other" is selected for each medicine row
    const [isOther, setIsOther] = useState<boolean[]>([]);

    const user = useSelector((state: any) => state.user);

    // ── Fetch pharmacy medicines ──
    useEffect(() => {
        getAllMedicines()
            .then((res) => {
                const opts: PharmacyOption[] = res
                    .filter((m: any) => m.stock > 0)   // sirf available
                    .map((m: any) => ({
                        value:        String(m.id),
                        label:        `${m.name} – ${m.manufacturer}`,
                        medicineId:   m.id,
                        medicineName: m.name,
                        dosage:       m.dosage,   // ✅
                        type:         m.type,     // ✅
                    }));

                // "Other" option at the end
                opts.push({
                    value:        "OTHER",
                    label:        "Other (type manually)",
                    medicineId:   null,
                    medicineName: "",
                    dosage:       "",
                    type:         "",
                });

                setPharmacyOptions(opts);
            })
            .catch(() => errorNotification("Failed to load pharmacy medicines"));
    }, []);

    // ── Form ──
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
            symptoms:  (v) => (v.length > 0 ? null : "Please select at least one symptom"),
            diagnosis: (v) => (v?.trim()    ? null : "Diagnosis is required"),

            prescription: {
                medicines: {
                    medicineName: (v) => (v?.trim() ? null : "Medicine name is required"),
                    dosage:       (v) => (v?.trim() ? null : "Dosage is required"),
                    frequency:    (v) => (v         ? null : "Frequency is required"),
                    duration:     (v) => (v > 0     ? null : "Duration must be greater than 0"),
                    routes:       (v) => (v         ? null : "Route is required"),
                    type:         (v) => (v         ? null : "Type is required"),
                    instructions: (v) => (v?.trim() ? null : "Instructions are required"),
                }
            }
        }
    });

    // ── Insert / Remove medicine row ──
    const insertMedicine = () => {
        form.insertListItem("prescription.medicines", {
            medicineName:  "",
            medicineId:    undefined,
            dosage:        "",
            frequency:     "",
            duration:      0,
            routes:        "",
            type:          "",
            instructions:  "",
        });
        setIsOther((prev) => [...prev, false]);
    };

    const removeMedicine = (index: number) => {
        form.removeListItem("prescription.medicines", index);
        setIsOther((prev) => prev.filter((_, i) => i !== index));
    };

    // ── Medicine dropdown change handler ──
    // value = "123" (pharmacy id)  OR  "OTHER"
    const handleMedicineSelect = (index: number, value: string | null) => {
        if (!value) {
            // cleared
            form.setFieldValue(`prescription.medicines.${index}.medicineName`, "");
            form.setFieldValue(`prescription.medicines.${index}.medicineId`,   undefined);
            form.setFieldValue(`prescription.medicines.${index}.dosage`,       "");
            form.setFieldValue(`prescription.medicines.${index}.type`,         "");
            setIsOther((prev) => { const n = [...prev]; n[index] = false; return n; });
            return;
        }

        if (value === "OTHER") {
            // Let user type manually
            form.setFieldValue(`prescription.medicines.${index}.medicineName`, "");
            form.setFieldValue(`prescription.medicines.${index}.medicineId`,   undefined);
            form.setFieldValue(`prescription.medicines.${index}.dosage`,       "");
            form.setFieldValue(`prescription.medicines.${index}.type`,         "");
            setIsOther((prev) => { const n = [...prev]; n[index] = true; return n; });
            return;
        }

        // Pharmacy medicine selected
        const opt = pharmacyOptions.find((o) => o.value === value);
        if (opt) {
            form.setFieldValue(`prescription.medicines.${index}.medicineName`, opt.medicineName);
            form.setFieldValue(`prescription.medicines.${index}.medicineId`,   opt.medicineId ?? undefined);
            form.setFieldValue(`prescription.medicines.${index}.dosage`,       opt.dosage);   // ✅ auto-fill
            form.setFieldValue(`prescription.medicines.${index}.type`,         opt.type);     // ✅ auto-fill
        }
        setIsOther((prev) => { const n = [...prev]; n[index] = false; return n; });
    };

    // ── Submit ──
    const handleSubmit = (values: typeof form.values) => {
        const reportData = {
            ...values,
            doctorId:      user.profileId,
            patientId:     appointment.patientId,
            appointmentId: appointment.id,
        };

        setLoading(true);

        createAppointmentReport(reportData)
            .then(() => {
                successNotification("Report Created Successfully");
                form.reset();
                setIsOther([]);
                onClose();
            })
            .catch(() => errorNotification("Failed to create report"))
            .finally(() => setLoading(false));
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="grid gap-5 pb-24">

            {/* ── Patient Information ── */}
            <Fieldset
                className="grid grid-cols-2 gap-5"
                legend={
                    <span className="text-lg font-medium text-primary-500">
                        Patient Information
                    </span>
                }
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

            {/* ── Prescription ── */}
            <Fieldset
                className="grid gap-5"
                legend={
                    <span className="text-lg font-medium text-primary-500">
                        Prescription
                    </span>
                }
            >
                {form.values.prescription.medicines.map((med, index) => (
                    <fieldset
                        key={index}
                        className="grid grid-cols-2 gap-4 col-span-2 border p-4 rounded-lg"
                    >
                        {/* Row header */}
                        <div className="flex justify-between col-span-2 items-center">
                            <h1 className="text-lg font-medium">Medicine {index + 1}</h1>
                            <ActionIcon color="red" variant="filled" onClick={() => removeMedicine(index)}>
                                <IconTrash size={18} />
                            </ActionIcon>
                        </div>

                        {/* ✅ Medicine dropdown — input mein sirf naam, dropdown mein company + dosage */}
                        <Select
                            label="Medicine"
                            placeholder="Select from pharmacy or choose Other"
                            data={pharmacyOptions.map((o) => ({
                                value: o.value,
                                label: o.value === "OTHER" ? "Other (type manually)" : o.medicineName,
                            }))}
                            searchable
                            clearable
                            withAsterisk
                            value={
                                isOther[index]
                                    ? "OTHER"
                                    : pharmacyOptions.find(
                                          (o) => o.medicineName === med.medicineName && o.value !== "OTHER"
                                      )?.value ?? null
                            }
                            onChange={(val) => handleMedicineSelect(index, val)}
                            error={form.errors[`prescription.medicines.${index}.medicineName`]}
                            renderOption={({ option }) => {
                                const full = pharmacyOptions.find((o) => o.value === option.value);
                                if (!full || full.value === "OTHER") {
                                    return <span style={{ fontSize: 14 }}>Other (type manually)</span>;
                                }
                                return (
                                    <div style={{ lineHeight: 1.4 }}>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                                            {full.medicineName}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#868e96" }}>
                                            {full.label.includes("–") ? full.label.split("–")[1]?.trim() : ""} · {full.dosage}
                                        </div>
                                    </div>
                                );
                            }}
                        />

                        {/* ✅ Manual name input — sirf "Other" select karne par dikhega */}
                        {isOther[index] && (
                            <TextInput
                                {...form.getInputProps(`prescription.medicines.${index}.medicineName`)}
                                label="Medicine Name (manual)"
                                placeholder="Type medicine name"
                                withAsterisk
                            />
                        )}

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
                            label="Type"
                            data={["Tablet", "Capsule", "Syrup", "Injection"]}
                            placeholder="Select Type"
                            withAsterisk
                            value={form.values.prescription.medicines[index]?.type || null}
                            onChange={(val) =>
                                form.setFieldValue(`prescription.medicines.${index}.type`, val ?? "")
                            }
                            error={form.errors[`prescription.medicines.${index}.type`]}
                        />

                        <TextInput
                            {...form.getInputProps(`prescription.medicines.${index}.instructions`)}
                            label="Instructions"
                            placeholder="Enter Instructions"
                            withAsterisk
                            className={isOther[index] ? "" : "col-span-2"}
                        />

                    </fieldset>
                ))}

                <div className="flex justify-center col-span-2">
                    <Button type="button" onClick={insertMedicine} variant="outline">
                        Add Medicine
                    </Button>
                </div>
            </Fieldset>

            {/* ── Sticky Submit Bar ── */}
            <div className="sticky bottom-0 bg-white py-3 border-t z-50">
                <div className="flex gap-5 justify-center items-center">
                    <Button loading={loading} type="submit" className="w-[300px]">
                        Submit Report
                    </Button>
                    <Button type="button" color="red" variant="filled" className="w-[120px]" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>

        </form>
    );
};

export default AppointmentReport;