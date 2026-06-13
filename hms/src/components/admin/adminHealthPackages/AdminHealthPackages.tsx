import { useEffect, useState } from "react";
import {
  Button, Group, Loader, Modal, NumberInput,
  Select, Stack, Switch, Text, TextInput, Textarea, Pagination,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconPlus, IconEdit, IconTrash, IconSearch,
  IconPackage, IconStar, IconCalendarTime,
} from "@tabler/icons-react";
import axiosInstance from "../../../interceptor/AxiosInterceptor";
import { successNotification, errorNotification } from "../../../utility/Notification";

interface HealthPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  idealFor: string;
  ageGroup: string;
  parameters: number;
  tests: string[];
  imageUrl?: string;
  isActive: boolean;
  isPopular: boolean;
}

interface Booking {
  id: number;
  packageId: number;
  packageName: string;
  patientName: string;
  phone: string;
  email: string;
  preferredDate: string;
  timeSlot: string;
  status: string;
  notes?: string;
  bookedAt: string;
}

const categoryColors: Record<string, string> = {
  Cancer: "#9d174d", Cardiac: "#92400e", General: "#065f46",
  Diabetes: "#1e40af", "Women's Health": "#7e22ce", Ortho: "#9a3412",
};

const bookingStatusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef9c3", color: "#854d0e" },
  CONFIRMED: { bg: "#dcfce7", color: "#166534" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { bg: "#dbeafe", color: "#1e40af" },
  SCHEDULED: { bg: "#dbeafe", color: "#1e40af" },
};

const EMPTY_FORM = {
  name: "", description: "", price: 0, category: "",
  idealFor: "Both", ageGroup: "", parameters: 1,
  tests: "", imageUrl: "", isPopular: false,
};

const inputStyles = { input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 } };

const AdminHealthPackages = () => {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [filtered, setFiltered] = useState<HealthPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Tabs
  const [activeTab, setActiveTab] = useState<"packages" | "bookings">("packages");

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<HealthPackage | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const form = useForm({ initialValues: EMPTY_FORM });

  const load = () => {
    setLoading(true);
    axiosInstance.get("/api/packages")
      .then((res) => {
        const data = res.data?.data || res.data;
        const list = Array.isArray(data) ? data : [];
        setPackages(list);
        setFiltered(list);
      })
      .catch(() => errorNotification("Failed to load packages"))
      .finally(() => setLoading(false));
  };

  const loadBookings = () => {
    setBookingsLoading(true);
    axiosInstance.get("/api/bookings/all")
      .then((res) => {
        const data = res.data?.data || res.data;
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => errorNotification("Failed to load bookings"))
      .finally(() => setBookingsLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (activeTab === "bookings") loadBookings(); }, [activeTab]);

  const handleSearch = (val: string) => {
    setSearch(val);
    const q = val.toLowerCase();
    setFiltered(packages.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ));
    setPage(1);
  };

  const handleAdd = async () => {
    const v = form.values;
    if (!v.name || !v.category || !v.idealFor) {
      errorNotification("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.post("/api/packages", {
        ...v,
        tests: v.tests.split(",").map((t: string) => t.trim()).filter(Boolean),
      });
      successNotification("Package created!");
      setAddOpen(false);
      form.reset();
      load();
    } catch (e: any) {
      errorNotification(e?.response?.data?.message || "Failed to create package");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    const v = form.values;
    setSaving(true);
    try {
      await axiosInstance.put(`/api/packages/${editTarget.id}`, {
        ...v,
        tests: typeof v.tests === "string"
          ? v.tests.split(",").map((t: string) => t.trim()).filter(Boolean)
          : v.tests,
      });
      successNotification("Package updated!");
      setEditOpen(false);
      load();
    } catch (e: any) {
      errorNotification(e?.response?.data?.message || "Failed to update package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await axiosInstance.delete(`/api/packages/${deleteId}`);
      successNotification("Package deleted!");
      setDeleteOpen(false);
      setDeleteId(null);
      load();
    } catch {
      errorNotification("Failed to delete package");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, status: string) => {
    setStatusLoading(bookingId);
    try {
      await axiosInstance.patch(`/api/bookings/${bookingId}/status?status=${status}`);
      successNotification("Status updated!");
      loadBookings();
    } catch {
      errorNotification("Failed to update status");
    } finally {
      setStatusLoading(null);
    }
  };

  const openEdit = (pkg: HealthPackage) => {
    setEditTarget(pkg);
    form.setValues({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      category: pkg.category,
      idealFor: pkg.idealFor,
      ageGroup: pkg.ageGroup,
      parameters: pkg.parameters,
      tests: Array.isArray(pkg.tests) ? pkg.tests.join(", ") : "",
      imageUrl: pkg.imageUrl || "",
      isPopular: pkg.isPopular,
    });
    setEditOpen(true);
  };

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const PackageForm = () => (
    <Stack gap="md">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Package Name *</label>
        <TextInput {...form.getInputProps("name")} placeholder="e.g. Cardiac Health Package" radius="md" styles={inputStyles} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description *</label>
        <Textarea {...form.getInputProps("description")} placeholder="Package description..." radius="md" minRows={3}
          styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 } }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Price (₹) *</label>
          <NumberInput {...form.getInputProps("price")} placeholder="999" min={0} prefix="₹" radius="md" styles={inputStyles} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Parameters *</label>
          <NumberInput {...form.getInputProps("parameters")} placeholder="10" min={1} radius="md" styles={inputStyles} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category *</label>
          <Select {...form.getInputProps("category")} placeholder="Select category" radius="md"
            data={["Cancer", "Cardiac", "General", "Diabetes", "Women's Health", "Ortho", "Thyroid", "Kidney", "Liver"]}
            styles={inputStyles} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Ideal For *</label>
          <Select {...form.getInputProps("idealFor")} placeholder="Select gender" radius="md"
            data={["Male", "Female", "Both"]} styles={inputStyles} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Age Group *</label>
        <TextInput {...form.getInputProps("ageGroup")} placeholder="e.g. 18-60 years" radius="md" styles={inputStyles} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tests (comma separated) *</label>
        <Textarea {...form.getInputProps("tests")} placeholder="CBC, Lipid Profile, Blood Sugar..." radius="md" minRows={2}
          styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 } }} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Image URL</label>
        <TextInput {...form.getInputProps("imageUrl")} placeholder="https://..." radius="md" styles={inputStyles} />
      </div>
      <Switch {...form.getInputProps("isPopular", { type: "checkbox" })} label="Mark as Popular" color="#1a6fa8" />
    </Stack>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
            Management
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">Health Packages</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {activeTab === "packages" && (
            <>
              <TextInput
                placeholder="Search packages..."
                value={search}
                onChange={(e) => handleSearch(e.currentTarget.value)}
                leftSection={<IconSearch size={15} stroke={1.5} className="text-gray-400" />}
                radius="md"
                styles={{ input: { border: "1.5px solid #e5e7eb", background: "white", fontSize: 14 } }}
              />
              <button
                onClick={() => { form.reset(); setAddOpen(true); }}
                className="flex items-center gap-2 bg-[#1a6fa8] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#155d8f] transition-colors"
              >
                <IconPlus size={16} /> Add Package
              </button>
            </>
          )}
          <span className="bg-blue-50 text-[#1a6fa8] text-sm font-bold px-3 py-1.5 rounded-xl border border-blue-100">
            {activeTab === "packages" ? `${filtered.length} Packages` : `${bookings.length} Bookings`}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "packages", label: "Packages", icon: <IconPackage size={15} /> },
          { key: "bookings", label: "Bookings", icon: <IconCalendarTime size={15} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key
                ? "bg-[#1a6fa8] text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-[#f4f7fb]"
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "packages" && (
        <>
          {loading ? (
            <div className="flex justify-center mt-20"><Loader color="#1a6fa8" size="lg" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
                {paginated.map((pkg) => {
                  const color = categoryColors[pkg.category] || "#1e40af";
                  return (
                    <div key={pkg.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="h-1 w-full" style={{ background: color }} />
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                            style={{ background: color + "15", color, borderColor: color + "30" }}>
                            {pkg.category}
                          </span>
                          {pkg.isPopular && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                              <IconStar size={10} /> Popular
                            </span>
                          )}
                          {!pkg.isActive && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{pkg.name}</h3>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{pkg.description}</p>
                        <div className="flex items-center justify-between mb-3 py-2 border-y border-gray-100">
                          <span className="text-xl font-extrabold text-[#1a6fa8]">₹{Number(pkg.price).toLocaleString()}</span>
                          <span className="text-xs text-gray-400">{pkg.parameters} parameters</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                          <span>{pkg.idealFor}</span><span>•</span><span>{pkg.ageGroup}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button flex={1} size="xs" radius="md" color="#1a6fa8" variant="light"
                            leftSection={<IconEdit size={13} />} onClick={() => openEdit(pkg)}>
                            Edit
                          </Button>
                          <Button size="xs" radius="md" color="red" variant="light" px="sm"
                            onClick={() => { setDeleteId(pkg.id); setDeleteOpen(true); }}>
                            <IconTrash size={13} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {paginated.length === 0 && (
                  <div className="col-span-4 flex flex-col items-center justify-center py-20 text-gray-400">
                    <IconPackage size={48} stroke={1} className="mb-3 opacity-30" />
                    <p className="font-semibold">No packages found</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination total={totalPages} value={page} onChange={setPage} color="#1a6fa8" radius="md" />
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === "bookings" && (
        <>
          {bookingsLoading ? (
            <div className="flex justify-center mt-20"><Loader color="#1a6fa8" size="lg" /></div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <IconCalendarTime size={48} stroke={1} className="mb-3 opacity-30" />
              <p className="font-semibold">No bookings yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-[#1a6fa8]" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["#", "Package", "Patient", "Phone", "Date", "Slot", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const sc = bookingStatusColors[b.status] || { bg: "#f3f4f6", color: "#6b7280" };
                      return (
                        <tr key={b.id} className="border-b border-gray-50 hover:bg-[#f4f7fb] transition-colors">
                          <td className="px-4 py-3 text-gray-400 text-xs">#{b.id}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900 max-w-[160px] truncate">{b.packageName}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">{b.patientName}</p>
                            <p className="text-xs text-gray-400">{b.email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{b.phone}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{b.preferredDate}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{b.timeSlot}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                              style={{ background: sc.bg, color: sc.color }}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              size="xs"
                              radius="md"
                              value={b.status}
                              data={["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]}
                              disabled={statusLoading === b.id}
                              onChange={(val) => {
                                if (val) handleStatusUpdate(b.id, val);
                              }}
                              styles={{ input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 12, minWidth: 130 } }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Modal opened={addOpen} onClose={() => setAddOpen(false)}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Add New Package</p>}
        centered radius="xl" size="lg">
        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
          <PackageForm />
        </div>
        <Group grow mt="xl">
          <Button color="#1a6fa8" radius="xl" loading={saving} onClick={handleAdd}>Create Package</Button>
          <Button variant="light" color="gray" radius="xl" onClick={() => setAddOpen(false)}>Cancel</Button>
        </Group>
      </Modal>

      <Modal opened={editOpen} onClose={() => setEditOpen(false)}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Edit Package</p>}
        centered radius="xl" size="lg">
        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
          <PackageForm />
        </div>
        <Group grow mt="xl">
          <Button color="#1a6fa8" radius="xl" loading={saving} onClick={handleEdit}>Update Package</Button>
          <Button variant="light" color="gray" radius="xl" onClick={() => setEditOpen(false)}>Cancel</Button>
        </Group>
      </Modal>

      <Modal opened={deleteOpen} onClose={() => setDeleteOpen(false)}
        title={<p className="font-bold text-lg text-red-500">Confirm Delete</p>}
        centered radius="xl" size="sm">
        <Text c="dimmed" size="sm" mb="lg">Are you sure? This package will be soft deleted.</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" color="gray" radius="xl" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="red" radius="xl" loading={saving} onClick={handleDelete}>Yes, Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default AdminHealthPackages;