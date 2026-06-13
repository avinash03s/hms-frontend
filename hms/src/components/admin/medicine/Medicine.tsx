import {
    ActionIcon, Badge, Button, Fieldset, Group, Modal,
    NumberInput, Pagination, Select, Table, Text, TextInput, Title,
} from "@mantine/core";
import {
    IconEdit,
    IconPlus, IconSearch, IconTrash,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import type { UseFormReturnType } from "@mantine/form";
import { useState, useEffect } from "react";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { medicineCategories, medicineTypes } from "../../../data/DropDownData";
import { addMedicine, deleteMedicine, getAllMedicines, updateMedicine } from "../../../service/MedicineService";

type MedicineFormValues = {
    name: string;
    dosage: string;
    stock: number;
    category: string;
    type: string;
    manufacturer: string;
    unitPrice: number;
};

type Medicine = MedicineFormValues & { id: number };

const CATEGORY_COLORS: Record<string, string> = {
    Cardiac: "blue",
    Analgesic: "green",
    Neurology: "violet",
    Gastro: "orange",
    Antibiotic: "red",
    Dermatology: "pink",
};

const FORM_INITIAL_VALUES: MedicineFormValues = {
    name: "",
    dosage: "",
    stock: 0,
    category: "",
    type: "",
    manufacturer: "",
    unitPrice: 0,
};

const FORM_VALIDATE = {
    name: (v: string) => (v.trim() ? null : "Medicine name is required"),
    dosage: (v: string) => (v.trim() ? null : "Dosage is required"),
    stock: (v: number) => (v >= 0 ? null : "Stock cannot be negative"),
    category: (v: string) => (v ? null : "Category is required"),
    type: (v: string) => (v ? null : "Type is required"),
    manufacturer: (v: string) => (v.trim() ? null : "Manufacturer is required"),
    unitPrice: (v: number) => (v > 0 ? null : "Unit price must be greater than 0"),
};

type MedicineFormFieldsProps = {
    form: UseFormReturnType<MedicineFormValues>;
};

const MedicineFormFields = ({ form }: MedicineFormFieldsProps) => (
    <div className="grid grid-cols-2 gap-4">
        <TextInput
            {...form.getInputProps("name")}
            label="Medicine Name"
            placeholder="e.g. Paracetamol"
            withAsterisk
            className="col-span-2"
        />
        <TextInput
            {...form.getInputProps("dosage")}
            label="Dosage"
            placeholder="e.g. 500mg"
            withAsterisk
        />
        <NumberInput
            {...form.getInputProps("stock")}
            label="Stock"
            placeholder="Quantity"
            min={0}
            withAsterisk
        />
        <Select
            {...form.getInputProps("category")}
            label="Category"
            placeholder="Select category"
            data={medicineCategories}
            withAsterisk
        />
        <Select
            {...form.getInputProps("type")}
            label="Type"
            placeholder="Select type"
            data={medicineTypes}
            withAsterisk
        />
        <TextInput
            {...form.getInputProps("manufacturer")}
            label="Manufacturer"
            placeholder="e.g. Sun Pharma"
            withAsterisk
            className="col-span-2"
        />
        <NumberInput
            {...form.getInputProps("unitPrice")}
            label="Unit Price (₹)"
            placeholder="0"
            min={0}
            prefix="₹"
            clampBehavior="strict"
            withAsterisk
        />
    </div>
);

const Medicine = () => {

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [sortField, setSortField] = useState<keyof Medicine | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    // const [viewMode,   setViewMode]   = useState<"grid" | "list">("grid");
    const [editTarget, setEditTarget] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

    const addForm = useForm<MedicineFormValues>({
        initialValues: FORM_INITIAL_VALUES,
        validate: FORM_VALIDATE,
    });

    const editForm = useForm<MedicineFormValues>({
        initialValues: FORM_INITIAL_VALUES,
        validate: FORM_VALIDATE,
    });

    const fetchMedicines = () => {
        setFetching(true);
        getAllMedicines()
            .then((res) => setMedicines(res))
            .catch(() => errorNotification("Failed to load medicines"))
            .finally(() => setFetching(false));
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleSort = (field: keyof Medicine) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleAddSubmit = (values: MedicineFormValues) => {
        setLoading(true);
        addMedicine(values)
            .then(() => {
                successNotification("Medicine added successfully");
                addForm.reset();
                closeAdd();
                fetchMedicines();
            })
            .catch(() => errorNotification("Failed to add medicine"))
            .finally(() => setLoading(false));
    };

    const handleEditOpen = (medicine: Medicine) => {
        setEditTarget(medicine);
        const { id, ...values } = medicine;
        editForm.setValues(values);
        openEdit();
    };

    const handleEditSubmit = (values: MedicineFormValues) => {
        if (!editTarget) return;
        setLoading(true);
        updateMedicine({ id: editTarget.id, ...values })
            .then(() => {
                successNotification("Medicine updated successfully");
                closeEdit();
                fetchMedicines();
            })
            .catch(() => errorNotification("Failed to update medicine"))
            .finally(() => setLoading(false));
    };

    const handleDelete = (id: number) => {

        deleteMedicine(id)
            .then(() => {
                successNotification("Medicine deleted successfully");
                fetchMedicines();
            })
            .catch(() => {
                errorNotification("Failed to delete medicine");
            });
    };

    const filtered = medicines.filter((m) => {
        const q = search.toLowerCase();
        return (
            m.name.toLowerCase().includes(q) ||
            m.manufacturer.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        if (!sortField) return 0;
        const av = a[sortField];
        const bv = b[sortField];
        const cmp =
            typeof av === "number" && typeof bv === "number"
                ? av - bv
                : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const paginated = sorted.slice((page - 1) * perPage, page * perPage);

    return (
        // <div className="p-6 flex flex-col gap-5">
        <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 flex flex-col gap-5">

            {/* <div className="flex items-center gap-3">
                <Button
                    leftSection={<IconPlus size={16} />}
                    color="teal"
                    onClick={openAdd}
                >
                    Add Medicine
                </Button>

                <div className="flex-1" />

                <TextInput
                    leftSection={<IconSearch size={16} />}
                    placeholder="Keyword Search"
                    value={search}
                    onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                    w={220}
                />
            </div> */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 mb-1">
                <div>
                    <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
                        Inventory
                    </span>
                    <h1 className="text-2xl font-extrabold text-gray-900">Stock Management</h1>
                </div>
                <div className="flex-1" />
                <Button leftSection={<IconPlus size={16} />} color="#1a6fa8" radius="md" onClick={openAdd}>
                    Add Medicine
                </Button>
                <TextInput
                    leftSection={<IconSearch size={16} />}
                    placeholder="Search medicine / batch"
                    value={search}
                    onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                    w={240}
                    radius="md"
                    styles={{ input: { border: "1.5px solid #e5e7eb", background: "white" } }}
                />
            </div>

            <Fieldset p={0} style={{ overflow: "hidden" }}>
                <Table
                    striped
                    highlightOnHover
                    withTableBorder={false}
                    withColumnBorders={false}
                    verticalSpacing="sm"
                    horizontalSpacing="md"
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                                Name {sortField === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th>Dosage</Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("stock")}>
                                Stock {sortField === "stock" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th>Category</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("manufacturer")}>
                                Manufacturer {sortField === "manufacturer" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("unitPrice")}>
                                Unit Price (₹) {sortField === "unitPrice" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {fetching ? (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" c="dimmed" py="xl">Loading medicines...</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : paginated.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" c="dimmed" py="xl">No medicines found</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            paginated.map((medicine) => (
                                <Table.Tr key={medicine.id}>
                                    <Table.Td fw={500}>{medicine.name}</Table.Td>
                                    <Table.Td>{medicine.dosage}</Table.Td>
                                    <Table.Td>{medicine.stock}</Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={CATEGORY_COLORS[medicine.category] ?? "gray"}
                                            variant="light"
                                            size="sm"
                                        >
                                            {medicine.category}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{medicine.type}</Table.Td>
                                    <Table.Td c="dimmed">{medicine.manufacturer}</Table.Td>
                                    <Table.Td>₹{medicine.unitPrice}</Table.Td>
                                    <Table.Td>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon
                                                color="teal"
                                                variant="filled"
                                                size="sm"
                                                onClick={() => handleEditOpen(medicine)}
                                                aria-label={`Edit ${medicine.name}`}
                                            >
                                                <IconEdit size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                                color="red"
                                                variant="light"
                                                size="sm"
                                                onClick={() => handleDelete(medicine.id)}
                                                aria-label={`Delete ${medicine.name}`}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>

                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <Text size="sm" c="dimmed">
                        Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to{" "}
                        {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
                    </Text>
                    <Pagination total={totalPages} value={page} onChange={setPage} size="sm" color="teal" />
                </div>
            </Fieldset>

            <Modal
                opened={addOpened}
                onClose={closeAdd}
                title={<Title order={4}>Add New Medicine</Title>}
                size="lg"
                centered
            >
                <form onSubmit={addForm.onSubmit(handleAddSubmit)}>
                    <MedicineFormFields form={addForm} />
                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={closeAdd}>Cancel</Button>
                        <Button type="submit" color="teal" loading={loading}>Save Medicine</Button>
                    </Group>
                </form>
            </Modal>

            <Modal
                opened={editOpened}
                onClose={closeEdit}
                title={<Title order={4}>Edit — {editTarget?.name}</Title>}
                size="lg"
                centered
            >
                <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
                    <MedicineFormFields form={editForm} />
                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={closeEdit}>Cancel</Button>
                        <Button type="submit" color="teal" loading={loading}>Update Medicine</Button>
                    </Group>
                </form>
            </Modal>

        </div>
    );
};

export default Medicine;