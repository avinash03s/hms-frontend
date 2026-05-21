import {ActionIcon,Button,Fieldset,Group,NumberInput,Pagination, Select,Text,TextInput,Title,} from "@mantine/core";

import {IconEye, IconLayoutGrid,IconLayoutList,IconPlus,IconSearch,IconTrash,} from "@tabler/icons-react";

import { useForm } from "@mantine/form";
import type { UseFormReturnType } from "@mantine/form";
import { useState } from "react";
import {
    errorNotification,
    successNotification,
} from "../../../utility/Notification";

type SaleMedicineItem = {
    medicineId: number | null;
    medicineName: string;
    quantity: number;
    stock: number;
};

type Sale = {
    id: number;
    buyerName: string;
    contact: string;
    totalAmount: number;
    saleDate: string;
    items: SaleMedicineItem[];
};

type SellFormValues = {
    buyerName: string;
    contact: string;
    items: SaleMedicineItem[];
};

// Medicines available in inventory (would come from API in real app)
const AVAILABLE_MEDICINES = [
    { value: "1", label: "Metoprolol",  stock: 120, price: 22  },
    { value: "2", label: "Amlodipine",  stock: 80,  price: 18  },
    { value: "3", label: "Aspirin",     stock: 400, price: 12  },
    { value: "4", label: "Sumatriptan", stock: 60,  price: 65  },
    { value: "5", label: "Naproxen",    stock: 150, price: 30  },
    { value: "6", label: "Domperidone", stock: 90,  price: 16  },
];

const INITIAL_SALES: Sale[] = [
    {
        id: 1,
        buyerName: "Alice Brown",
        contact: "+91 9876501234",
        totalAmount: 560,
        saleDate: "18 April 2026",
        items: [{ medicineId: 1, medicineName: "Metoprolol", quantity: 10, stock: 120 }],
    },
    {
        id: 2,
        buyerName: "Michael Lee",
        contact: "+91 9765432109",
        totalAmount: 320,
        saleDate: "24 April 2026",
        items: [{ medicineId: 2, medicineName: "Amlodipine", quantity: 5, stock: 80 }],
    },
    {
        id: 3,
        buyerName: "Neha Sharma",
        contact: "+91 9090909090",
        totalAmount: 450,
        saleDate: "26 April 2026",
        items: [{ medicineId: 5, medicineName: "Naproxen", quantity: 15, stock: 150 }],
    },
    {
        id: 4,
        buyerName: "Alice Brown",
        contact: "9878766755",
        totalAmount: 1860,
        saleDate: "20 May 2026",
        items: [{ medicineId: 4, medicineName: "Sumatriptan", quantity: 20, stock: 60 }],
    },
];

const EMPTY_ITEM: SaleMedicineItem = {
    medicineId:   null,
    medicineName: "",
    quantity:     0,
    stock:        0,
};

type SellFormProps = {
    form: UseFormReturnType<SellFormValues>;
};

const SellFormFields = ({ form }: SellFormProps) => {

    const handleMedicineSelect = (index: number, value: string | null) => {
        const found = AVAILABLE_MEDICINES.find((m) => m.value === value);
        if (found) {
            form.setFieldValue(`items.${index}.medicineId`,   Number(found.value));
            form.setFieldValue(`items.${index}.medicineName`, found.label);
            form.setFieldValue(`items.${index}.stock`,        found.stock);
        } else {
            form.setFieldValue(`items.${index}.medicineId`,   null);
            form.setFieldValue(`items.${index}.medicineName`, "");
            form.setFieldValue(`items.${index}.stock`,        0);
        }
    };

    return (
        <div className="flex flex-col gap-5">

            {/* Buyer Information */}
            <Fieldset
                legend={
                    <span className="text-base font-medium text-teal-600">
                        Buyer information
                    </span>
                }
            >
                <div className="grid grid-cols-2 gap-4">
                    <TextInput
                        {...form.getInputProps("buyerName")}
                        label="Buyer Name"
                        placeholder="Enter buyer name"
                        withAsterisk
                    />
                    <TextInput
                        {...form.getInputProps("contact")}
                        label="Contact Number"
                        placeholder="Enter contact number"
                    />
                </div>
            </Fieldset>

            {/* Medicine Information */}
            <Fieldset
                legend={
                    <span className="text-base font-medium text-teal-600">
                        Medicine information
                    </span>
                }
            >
                <div className="flex flex-col gap-4">

                    {form.values.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">

                            <Select
                                label={index === 0 ? "Medicine" : undefined}
                                placeholder="Select medicine"
                                data={AVAILABLE_MEDICINES}
                                value={item.medicineId ? String(item.medicineId) : null}
                                onChange={(val) => handleMedicineSelect(index, val)}
                                error={form.errors[`items.${index}.medicineName`]}
                            />

                            <NumberInput
                                label={index === 0 ? "Quantity" : undefined}
                                placeholder="0"
                                min={0}
                                max={item.stock}
                                value={item.quantity}
                                onChange={(val) =>
                                    form.setFieldValue(`items.${index}.quantity`, Number(val))
                                }
                                error={form.errors[`items.${index}.quantity`]}
                                rightSection={
                                    item.stock > 0 ? (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                background: "#f87171",
                                                color: "#fff",
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Stock: {item.stock}
                                        </span>
                                    ) : undefined
                                }
                                rightSectionWidth={80}
                            />

                            <ActionIcon
                                color="red"
                                variant="filled"
                                size="lg"
                                mb={2}
                                disabled={form.values.items.length === 1}
                                onClick={() => form.removeListItem("items", index)}
                                aria-label="Remove medicine"
                            >
                                <IconTrash size={16} />
                            </ActionIcon>

                        </div>
                    ))}

                    <div className="flex justify-center mt-1">
                        <Button
                            variant="outline"
                            color="teal"
                            leftSection={<IconPlus size={14} />}
                            onClick={() => form.insertListItem("items", { ...EMPTY_ITEM })}
                        >
                            Add more
                        </Button>
                    </div>

                </div>
            </Fieldset>

        </div>
    );
};

const Sales = () => {

    const [view,      setView]      = useState<"list" | "form">("list");
    const [sales,     setSales]     = useState<Sale[]>(INITIAL_SALES);
    const [search,    setSearch]    = useState("");
    const [page,      setPage]      = useState(1);
    const [perPage]                 = useState(10);
    const [sortField, setSortField] = useState<keyof Sale | null>(null);
    const [sortDir,   setSortDir]   = useState<"asc" | "desc">("asc");
    const [viewMode,  setViewMode]  = useState<"grid" | "list">("grid");
    const [loading,   setLoading]   = useState(false);

    const form = useForm<SellFormValues>({
        initialValues: {
            buyerName: "",
            contact:   "",
            items:     [{ ...EMPTY_ITEM }],
        },
        validate: {
            buyerName: (v) => (v.trim() ? null : "Buyer name is required"),
            items: {
                medicineName: (v) => (v ? null : "Please select a medicine"),
                quantity:     (v) => (v > 0 ? null : "Quantity must be greater than 0"),
            },
        },
    });

    const handleSort = (field: keyof Sale) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleSellSubmit = (values: SellFormValues) => {
        setLoading(true);
        try {
            const totalAmount = values.items.reduce((sum, item) => {
                const med = AVAILABLE_MEDICINES.find((m) => m.value === String(item.medicineId));
                return sum + (med ? med.price * item.quantity : 0);
            }, 0);

            const now   = new Date();
            const saleDate = now.toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
            });

            const newSale: Sale = {
                id: Date.now(),
                buyerName:   values.buyerName,
                contact:     values.contact,
                totalAmount,
                saleDate,
                items:       values.items,
            };

            setSales((prev) => [newSale, ...prev]);
            successNotification("Medicine sold successfully");
            form.reset();
            form.setFieldValue("items", [{ ...EMPTY_ITEM }]);
            setView("list");
        } catch {
            errorNotification("Failed to process sale");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        form.setFieldValue("items", [{ ...EMPTY_ITEM }]);
        setView("list");
    };

    const filtered = sales.filter((s) => {
        const q = search.toLowerCase();
        return (
            s.buyerName.toLowerCase().includes(q) ||
            s.contact.toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        if (!sortField) return 0;
        const av = a[sortField];
        const bv = b[sortField];
        if (typeof av === "number" && typeof bv === "number") {
            return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const paginated  = sorted.slice((page - 1) * perPage, page * perPage);

    if (view === "form") {
        return (
            <div className="p-6 flex flex-col gap-5">

                <div className="flex items-center justify-between">
                    <Title order={3} c="teal">Sell Medicine</Title>
                    <Button
                        color="teal"
                        leftSection={<IconPlus size={16} />}
                        variant="filled"
                    >
                        Import Prescription
                    </Button>
                </div>

                <form onSubmit={form.onSubmit(handleSellSubmit)}>
                    <div className="flex flex-col gap-5">

                        <SellFormFields form={form} />

                        <Group justify="center" gap="md">
                            <Button
                                type="submit"
                                color="teal"
                                size="md"
                                loading={loading}
                            >
                                Sell Medicine
                            </Button>
                            <Button
                                type="button"
                                color="red"
                                variant="filled"
                                size="md"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </Group>

                    </div>
                </form>

            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-5">

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3">

                <Button
                    leftSection={<IconPlus size={16} />}
                    color="teal"
                    onClick={() => setView("form")}
                >
                    Sell Medicine
                </Button>

                <div className="flex-1" />

                <ActionIcon.Group>
                    <ActionIcon
                        variant={viewMode === "grid" ? "filled" : "default"}
                        color="teal"
                        size="lg"
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                    >
                        <IconLayoutGrid size={18} />
                    </ActionIcon>
                    <ActionIcon
                        variant={viewMode === "list" ? "filled" : "default"}
                        color="teal"
                        size="lg"
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                    >
                        <IconLayoutList size={18} />
                    </ActionIcon>
                </ActionIcon.Group>

                <TextInput
                    leftSection={<IconSearch size={16} />}
                    placeholder="Keyword Search"
                    value={search}
                    onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                    w={220}
                />

            </div>

            {/* ── Table ── */}
            <Fieldset p={0} style={{ overflow: "hidden" }}>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                            <th
                                style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 500, color: "#868e96" }}
                            >
                                Buyer
                            </th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 500, color: "#868e96" }}>
                                Contact
                            </th>
                            <th
                                style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 500, color: "#868e96", cursor: "pointer" }}
                                onClick={() => handleSort("totalAmount")}
                            >
                                Total Amount {sortField === "totalAmount" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                            </th>
                            <th
                                style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 500, color: "#868e96", cursor: "pointer" }}
                                onClick={() => handleSort("saleDate")}
                            >
                                Sale Date {sortField === "saleDate" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                            </th>
                            <th style={{ padding: "12px 16px" }} />
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: "#868e96" }}>
                                    No sales found
                                </td>
                            </tr>
                        ) : (
                            paginated.map((sale, i) => (
                                <tr
                                    key={sale.id}
                                    style={{
                                        borderBottom: i < paginated.length - 1 ? "1px solid #f1f3f5" : "none",
                                        background: i % 2 === 0 ? "#fff" : "#f8fffe",
                                    }}
                                >
                                    <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 500 }}>
                                        {sale.buyerName}
                                    </td>
                                    <td style={{ padding: "13px 16px", fontSize: 14 }}>
                                        {sale.contact}
                                    </td>
                                    <td style={{ padding: "13px 16px", fontSize: 14 }}>
                                        {sale.totalAmount}
                                    </td>
                                    <td style={{ padding: "13px 16px", fontSize: 14 }}>
                                        {sale.saleDate}
                                    </td>
                                    <td style={{ padding: "13px 16px" }}>
                                        <ActionIcon
                                            color="teal"
                                            variant="filled"
                                            size="sm"
                                            aria-label={`View sale by ${sale.buyerName}`}
                                        >
                                            <IconEye size={14} />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* ── Pagination ── */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <Text size="sm" c="dimmed">
                        Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to{" "}
                        {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
                    </Text>
                    <Pagination
                        total={totalPages}
                        value={page}
                        onChange={setPage}
                        size="sm"
                        color="teal"
                    />
                </div>

            </Fieldset>

        </div>
    );
};

export default Sales;