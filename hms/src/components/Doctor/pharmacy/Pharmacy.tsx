import {
    ActionIcon,
    Fieldset,
    Pagination,
    Text,
    TextInput,
} from "@mantine/core";

import {
    IconLayoutGrid,
    IconLayoutList,
    IconSearch,
} from "@tabler/icons-react";

import { useState, useEffect } from "react";

import { getAllMedicines } from "../../../service/MedicineService";

import { errorNotification } from "../../../utility/Notification";

type Medicine = {
    id: number;
    name: string;
    dosage: string;
    stock: number;
    category: string;
    type: string;
    manufacturer: string;
    unitPrice: number;
};

const Pharmacy = () => {

    const [medicines, setMedicines] = useState<Medicine[]>([]);

    const [fetching, setFetching] = useState(true);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [perPage] = useState(10);

    const [sortField, setSortField] = useState<keyof Medicine | null>(null);

    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // FETCH

    useEffect(() => {

        setFetching(true);

        getAllMedicines()
            .then((res) => {

                const available = res.filter(
                    (m: Medicine) => m.stock > 0
                );

                setMedicines(available);

            })
            .catch(() =>
                errorNotification("Failed to load medicines")
            )
            .finally(() => setFetching(false));

    }, []);

    const handleSort = (field: keyof Medicine) => {

        if (sortField === field) {

            setSortDir((d) =>
                d === "asc" ? "desc" : "asc"
            );

        } else {

            setSortField(field);

            setSortDir("asc");
        }
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
            typeof av === "number" &&
                typeof bv === "number"
                ? av - bv
                : String(av).localeCompare(String(bv));

        return sortDir === "asc" ? cmp : -cmp;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(sorted.length / perPage)
    );

    const paginated = sorted.slice(
        (page - 1) * perPage,
        page * perPage
    );

    const sortIcon = (field: keyof Medicine) =>
        sortField === field
            ? (sortDir === "asc" ? " ↑" : " ↓")
            : " ↕";

    return (

        <div className="p-3 sm:p-5 lg:p-6 flex flex-col gap-5 w-full overflow-x-hidden">

            {/* TOOLBAR */}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">

                {/* VIEW TOGGLE */}
{/* 
                <ActionIcon.Group>

                    <ActionIcon
                        variant={
                            viewMode === "grid"
                                ? "filled"
                                : "default"
                        }
                        color="teal"
                        size="lg"
                        onClick={() => setViewMode("grid")}
                    >
                        <IconLayoutGrid size={18} />
                    </ActionIcon>

                    <ActionIcon
                        variant={
                            viewMode === "list"
                                ? "filled"
                                : "default"
                        }
                        color="teal"
                        size="lg"
                        onClick={() => setViewMode("list")}
                    >
                        <IconLayoutList size={18} />
                    </ActionIcon>

                </ActionIcon.Group> */}

                {/* SEARCH */}

                <TextInput
                    className="w-full sm:w-[260px] max-w-full"
                    leftSection={<IconSearch size={16} />}
                    placeholder="Keyword Search"
                    value={search}
                    onChange={(e) => {

                        setSearch(e.currentTarget.value);

                        setPage(1);
                    }}
                />
            </div>

            <div className="hidden lg:block w-full overflow-hidden">

                <Fieldset
                    p={0}
                    style={{
                        overflow: "hidden",
                        width: "100%"
                    }}
                >

                    <div className="w-full overflow-x-auto">

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "1100px",
                            }}
                        >

                            <thead>

                                <tr
                                    style={{
                                        borderBottom:
                                            "1px solid #e9ecef",
                                    }}
                                >

                                    {[
                                        {
                                            label: "Name",
                                            field: "name",
                                        },
                                        {
                                            label: "Dosage",
                                            field: "dosage",
                                        },
                                        {
                                            label: "Stock",
                                            field: "stock",
                                        },
                                        {
                                            label: "Category",
                                            field: "category",
                                        },
                                        {
                                            label: "Type",
                                            field: "type",
                                        },
                                        {
                                            label: "Manufacturer",
                                            field: "manufacturer",
                                        },
                                        {
                                            label: "Unit Price (₹)",
                                            field: "unitPrice",
                                        },
                                    ].map(({ label, field }) => (

                                        <th
                                            key={field}
                                            onClick={() =>
                                                handleSort(
                                                    field as keyof Medicine
                                                )
                                            }
                                            style={{
                                                padding:
                                                    "12px 16px",
                                                textAlign: "left",
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: "#495057",
                                                cursor: "pointer",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {label}
                                            {sortIcon(
                                                field as keyof Medicine
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>

                                {
                                    fetching ? (

                                        <tr>

                                            <td
                                                colSpan={7}
                                                style={{
                                                    padding:
                                                        "32px 16px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#868e96",
                                                }}
                                            >
                                                Loading medicines...
                                            </td>
                                        </tr>

                                    ) : paginated.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={7}
                                                style={{
                                                    padding:
                                                        "32px 16px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#868e96",
                                                }}
                                            >
                                                No medicines available
                                            </td>
                                        </tr>

                                    ) : (

                                        paginated.map(
                                            (medicine, i) => (

                                                <tr
                                                    key={
                                                        medicine.id
                                                    }
                                                    style={{
                                                        borderBottom:
                                                            i <
                                                                paginated.length -
                                                                1
                                                                ? "1px solid #f1f3f5"
                                                                : "none",

                                                        background:
                                                            medicine.stock <=
                                                                10
                                                                ? "#fff9f0"
                                                                : "transparent",
                                                    }}
                                                >

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {
                                                            medicine.name
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {
                                                            medicine.dosage
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                        }}
                                                    >

                                                        <span
                                                            style={{
                                                                color:
                                                                    medicine.stock <=
                                                                        10
                                                                        ? "#f76707"
                                                                        : "inherit",

                                                                fontWeight:
                                                                    medicine.stock <=
                                                                        10
                                                                        ? 600
                                                                        : 400,
                                                            }}
                                                        >
                                                            {
                                                                medicine.stock
                                                            }

                                                            {
                                                                medicine.stock <=
                                                                10 &&
                                                                " ⚠️"
                                                            }
                                                        </span>
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {
                                                            medicine.category
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {
                                                            medicine.type
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                            color:
                                                                "#868e96",
                                                        }}
                                                    >
                                                        {
                                                            medicine.manufacturer
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "13px 16px",
                                                            fontSize: 14,
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        ₹
                                                        {
                                                            medicine.unitPrice
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 py-3 border-t w-full overflow-hidden">

                        <Text
                            size="sm"
                            c="dimmed"
                            className="text-center sm:text-left break-words"
                        >
                            Showing{" "}
                            {
                                filtered.length === 0
                                    ? 0
                                    : (page - 1) * perPage + 1
                            }{" "}
                            to{" "}
                            {
                                Math.min(
                                    page * perPage,
                                    filtered.length
                                )
                            }{" "}
                            of {filtered.length} entries
                        </Text>

                        <div className="flex justify-center sm:justify-end max-w-full overflow-x-auto">

                            <Pagination
                                total={totalPages}
                                value={page}
                                onChange={setPage}
                                size="sm"
                                color="teal"
                            />
                        </div>
                    </div>
                </Fieldset>
            </div>

            {/* MOBILE CARD VIEW */}

            <div className="flex flex-col gap-4 lg:hidden w-full overflow-hidden">

                {
                    fetching ? (

                        <div className="text-center text-gray-500 py-10">
                            Loading medicines...
                        </div>

                    ) : paginated.length === 0 ? (

                        <div className="text-center text-gray-500 py-10">
                            No medicines available
                        </div>

                    ) : (

                        paginated.map((medicine) => (

                            <div
                                key={medicine.id}
                                className={`border rounded-xl p-4 shadow-sm flex flex-col gap-3 w-full overflow-hidden ${medicine.stock <= 10
                                    ? "bg-orange-50"
                                    : "bg-white"
                                    }`}
                            >

                                <div className="flex items-start justify-between gap-3">

                                    <div className="min-w-0 flex-1">

                                        <div className="text-lg font-semibold text-gray-800 break-words">
                                            {medicine.name}
                                        </div>

                                        <div className="text-sm text-gray-500 break-words">
                                            {medicine.manufacturer}
                                        </div>
                                    </div>

                                    <div className="text-sm font-semibold text-teal-700 whitespace-nowrap shrink-0">
                                        ₹{medicine.unitPrice}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">

                                    <div>

                                        <div className="text-gray-500">
                                            Dosage
                                        </div>

                                        <div className="font-medium break-words">
                                            {medicine.dosage}
                                        </div>
                                    </div>

                                    <div>

                                        <div className="text-gray-500">
                                            Stock
                                        </div>

                                        <div
                                            className={`font-semibold break-words ${medicine.stock <= 10
                                                ? "text-orange-600"
                                                : ""
                                                }`}
                                        >
                                            {medicine.stock}

                                            {
                                                medicine.stock <= 10 &&
                                                " ⚠️"
                                            }
                                        </div>
                                    </div>

                                    <div>

                                        <div className="text-gray-500">
                                            Category
                                        </div>

                                        <div className="font-medium break-words">
                                            {medicine.category}
                                        </div>
                                    </div>

                                    <div>

                                        <div className="text-gray-500">
                                            Type
                                        </div>

                                        <div className="font-medium break-words">
                                            {medicine.type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                }

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 w-full overflow-hidden">

                    <Text
                        size="sm"
                        c="dimmed"
                        className="text-center sm:text-left break-words"
                    >
                        Showing{" "}
                        {
                            filtered.length === 0
                                ? 0
                                : (page - 1) * perPage + 1
                        }{" "}
                        to{" "}
                        {
                            Math.min(
                                page * perPage,
                                filtered.length
                            )
                        }{" "}
                        of {filtered.length} entries
                    </Text>

                    <div className="flex justify-center max-w-full overflow-x-auto">

                        <Pagination
                            total={totalPages}
                            value={page}
                            onChange={setPage}
                            size="sm"
                            color="teal"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pharmacy;