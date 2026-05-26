import {
    ActionIcon, Badge, Button, Fieldset, Group, Modal,
    NumberInput, Pagination, Select, Table, Text, TextInput, Title,
} from "@mantine/core";
import {
    IconEdit,
    IconPlus, IconSearch,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import type { UseFormReturnType } from "@mantine/form";
import { useState, useEffect } from "react";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { addStock, getAllStock, updateStock } from "../../../service/InventoryService";
import { getAllMedicines } from "../../../service/MedicineService";
import { DateInput } from "@mantine/dates";


type StockStatus = "ACTIVE" | "EXPIRED" | "LOW";

type MedicineOption = {
    value:        string;
    label:        string;
    manufacturer: string;
};

type StockFormValues = {
    medicineId: string | null;
    batchNo:    string;
    quantity:   number;
    expireDate: Date | null;
};

type Stock = {
    id:              number;
    medicineId:      number;
    batchNo:         string;
    quantity:        number;
    initialQuantity: number;
    expireDate:      string;
    addedDate:       string;
    stockStatus:     StockStatus;
};

const STATUS_COLORS: Record<StockStatus, string> = {
    ACTIVE:  "teal",
    EXPIRED: "red",
    LOW:     "orange",
};

const FORM_INITIAL_VALUES: StockFormValues = {
    medicineId: null,
    batchNo:    "",
    quantity:   0,
    expireDate: null,
};

const FORM_VALIDATE = {
    medicineId: (v: string | null) => (v        ? null : "Medicine is required"),
    batchNo:    (v: string)        => (v.trim() ? null : "Batch number is required"),
    quantity:   (v: number)        => (v > 0    ? null : "Quantity must be greater than 0"),
    expireDate: (v: Date | null)   => (v        ? null : "Expiry date is required"),
};

const toDateString = (date: Date | string | null): string => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const toDateObject = (str: string): Date | null => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
};

type StockFormFieldsProps = {
    form:            UseFormReturnType<StockFormValues>;
    medicineOptions: MedicineOption[];
};

const StockFormFields = ({ form, medicineOptions }: StockFormFieldsProps) => (
    <div className="grid grid-cols-2 gap-4">
        <Select
            {...form.getInputProps("medicineId")}
            label="Medicine"
            placeholder="Select medicine"
            data={medicineOptions}
            searchable
            clearable
            withAsterisk
            className="col-span-2"
        />
        <TextInput
            {...form.getInputProps("batchNo")}
            label="Batch No."
            placeholder="e.g. BATCH-001"
            withAsterisk
        />
        <DateInput
            {...form.getInputProps("expireDate")}
            label="Expiry Date"
            placeholder="DD MMM YYYY"
            valueFormat="DD MMM YYYY"
            withAsterisk
            clearable
            popoverProps={{ withinPortal: true }}
        />
        <NumberInput
            {...form.getInputProps("quantity")}
            label="Quantity"
            placeholder="e.g. 100"
            min={1}
            withAsterisk
            className="col-span-2"
        />
    </div>
);


const Inventory = () => {

    const [stocks,          setStocks]          = useState<Stock[]>([]);
    const [medicineOptions, setMedicineOptions] = useState<MedicineOption[]>([]);
    const [search,          setSearch]          = useState("");
    const [page,            setPage]            = useState(1);
    const [perPage]                             = useState(10);
    const [sortField,       setSortField]       = useState<keyof Stock | null>(null);
    const [sortDir,         setSortDir]         = useState<"asc" | "desc">("asc");
    const [viewMode,        setViewMode]        = useState<"grid" | "list">("grid");
    const [editTarget,      setEditTarget]      = useState<Stock | null>(null);
    const [loading,         setLoading]         = useState(false);
    const [fetching,        setFetching]        = useState(true);

    const [addOpened,  { open: openAdd,  close: closeAdd  }] = useDisclosure(false);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

    const addForm = useForm<StockFormValues>({
        initialValues: FORM_INITIAL_VALUES,
        validate:      FORM_VALIDATE,
    });

    const editForm = useForm<StockFormValues>({
        initialValues: FORM_INITIAL_VALUES,
        validate:      FORM_VALIDATE,
    });

    const fetchStocks = () => {
        setFetching(true);
        getAllStock()
            .then((res) => setStocks(res))
            .catch(() => errorNotification("Failed to load inventory"))
            .finally(() => setFetching(false));
    };

    const fetchMedicineOptions = () => {
        getAllMedicines()
            .then((res) => {
                const opts: MedicineOption[] = res.map((m: any) => ({
                    value:        String(m.id),
                    label:        `${m.name} (${m.dosage})`,
                    manufacturer: m.manufacturer,
                }));
                setMedicineOptions(opts);
            })
            .catch(() => errorNotification("Failed to load medicines"));
    };

    useEffect(() => {
        fetchStocks();
        fetchMedicineOptions();
    }, []);

    const getMedicineName = (id: number) =>
        medicineOptions.find((m) => m.value === String(id))?.label ?? `ID: ${id}`;

    const getManufacturer = (id: number) =>
        medicineOptions.find((m) => m.value === String(id))?.manufacturer ?? "—";

    const handleSort = (field: keyof Stock) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleAddSubmit = (values: StockFormValues) => {
        setLoading(true);
        const payload = {
            medicineId: Number(values.medicineId),
            batchNo:    values.batchNo,
            quantity:   values.quantity,
            expireDate: toDateString(values.expireDate),
        };
        addStock(payload)
            .then(() => {
                successNotification("Stock added successfully");
                addForm.reset();
                closeAdd();
                fetchStocks();
                fetchMedicineOptions();
            })
            .catch(() => errorNotification("Failed to add stock"))
            .finally(() => setLoading(false));
    };

    const handleEditOpen = (stock: Stock) => {
        setEditTarget(stock);
        editForm.setValues({
            medicineId: String(stock.medicineId),
            batchNo:    stock.batchNo,
            quantity:   stock.quantity,
            expireDate: toDateObject(stock.expireDate),
        });
        openEdit();
    };

    const handleEditSubmit = (values: StockFormValues) => {
        if (!editTarget) return;
        setLoading(true);
        const payload = {
            id:         editTarget.id,
            medicineId: Number(values.medicineId),
            batchNo:    values.batchNo,
            quantity:   values.quantity,
            expireDate: toDateString(values.expireDate),
        };
        updateStock(payload)
            .then(() => {
                successNotification("Stock updated successfully");
                closeEdit();
                fetchStocks();
                fetchMedicineOptions();
            })
            .catch(() => errorNotification("Failed to update stock"))
            .finally(() => setLoading(false));
    };

    const filtered = stocks.filter((s) => {
        const q    = search.toLowerCase();
        const name = getMedicineName(s.medicineId).toLowerCase();
        const mfr  = getManufacturer(s.medicineId).toLowerCase();
        return (
            name.includes(q) ||
            mfr.includes(q)  ||
            s.batchNo.toLowerCase().includes(q) ||
            s.stockStatus?.toLowerCase().includes(q)
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
    const paginated  = sorted.slice((page - 1) * perPage, page * perPage);

    return (
        <div className="p-6 flex flex-col gap-5">

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3">
                <Button
                    leftSection={<IconPlus size={16} />}
                    color="teal"
                    onClick={openAdd}
                >
                    Add Stock
                </Button>

                <div className="flex-1" />

                <TextInput
                    leftSection={<IconSearch size={16} />}
                    placeholder="Search medicine / batch"
                    value={search}
                    onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                    w={240}
                />
            </div>

            {/* ── Table ── */}
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
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("medicineId")}>
                                Medicine {sortField === "medicineId" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("batchNo")}>
                                Batch No. {sortField === "batchNo" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("quantity")}>
                                Quantity {sortField === "quantity" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("initialQuantity")}>
                                Initial Qty {sortField === "initialQuantity" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("expireDate")}>
                                Expiry Date {sortField === "expireDate" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th style={{ cursor: "pointer" }} onClick={() => handleSort("addedDate")}>
                                Added Date {sortField === "addedDate" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                            </Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {fetching ? (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" c="dimmed" py="xl">Loading inventory...</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : paginated.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" c="dimmed" py="xl">No stock entries found</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            paginated.map((stock) => (
                                <Table.Tr key={stock.id}>
                                    <Table.Td>
                                        <span style={{ fontWeight: 500 }}>
                                            {getMedicineName(stock.medicineId)}
                                        </span>
                                        <Text span size="xs" c="dimmed" ml={6}>
                                            {getManufacturer(stock.medicineId)}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>{stock.batchNo}</Table.Td>
                                    <Table.Td>{stock.quantity}</Table.Td>
                                    <Table.Td>{stock.initialQuantity}</Table.Td>
                                    <Table.Td>{stock.expireDate}</Table.Td>
                                    <Table.Td>{stock.addedDate}</Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={STATUS_COLORS[stock.stockStatus]}
                                            variant="filled"
                                            size="sm"
                                            tt="uppercase"
                                        >
                                            {stock.stockStatus}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon
                                                color="teal"
                                                variant="filled"
                                                size="sm"
                                                onClick={() => handleEditOpen(stock)}
                                                aria-label="Edit stock"
                                            >
                                                <IconEdit size={14} />
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
                    <Pagination
                        total={totalPages}
                        value={page}
                        onChange={setPage}
                        size="sm"
                        color="teal"
                    />
                </div>
            </Fieldset>

            <Modal
                opened={addOpened}
                onClose={closeAdd}
                title={<Title order={5} component="p">Add New Stock</Title>}
                size="lg"
                centered
            >
                <form onSubmit={addForm.onSubmit(handleAddSubmit)}>
                    <StockFormFields form={addForm} medicineOptions={medicineOptions} />
                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={closeAdd}>Cancel</Button>
                        <Button type="submit" color="teal" loading={loading}>Save Stock</Button>
                    </Group>
                </form>
            </Modal>

            <Modal
                opened={editOpened}
                onClose={closeEdit}
                title={<Title order={5} component="p">Edit Stock</Title>}
                size="lg"
                centered
            >
                <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
                    <StockFormFields form={editForm} medicineOptions={medicineOptions} />
                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={closeEdit}>Cancel</Button>
                        <Button type="submit" color="teal" loading={loading}>Update Stock</Button>
                    </Group>
                </form>
            </Modal>

        </div>
    );
};

export default Inventory;