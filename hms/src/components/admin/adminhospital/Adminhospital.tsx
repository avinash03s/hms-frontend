import {
  Avatar, Badge, Button, Divider, Group, Loader,
  Modal, SimpleGrid, Stack, Text, TextInput, Textarea, Switch,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  IconBuildingHospital, IconPhone, IconMail, IconMapPin,
  IconPlus, IconSearch, IconEdit, IconTrash, IconX, IconCheck,
  IconWifi, IconEye,
} from "@tabler/icons-react";
import axiosInstance from "../../../interceptor/AxiosInterceptor";
import { errorNotification, successNotification } from "../../../utility/Notification";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
  facilities: string;
  isActive: boolean;
}

const EMPTY_FORM: Omit<Hospital, "id" | "isActive"> = {
  name: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  imageUrl: "",
  facilities: "",
};

const inputStyles = {
  input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 },
};

const cityColors: Record<string, string> = {};
const PALETTE = ["blue", "violet", "teal", "grape", "cyan", "indigo", "pink"];
const getCityColor = (city: string) => {
  if (!cityColors[city]) {
    cityColors[city] = PALETTE[Object.keys(cityColors).length % PALETTE.length];
  }
  return cityColors[city];
};

// ─── API helpers ──────────────────────────────────────────────────────────────
const api = {
  getAll: () => axiosInstance.get("/api/hospitals").then((r) => r.data?.data ?? r.data),
  add: (data: typeof EMPTY_FORM) =>
    axiosInstance.post("/api/hospitals", data).then((r) => r.data?.data ?? r.data),
  update: (id: number, data: Partial<Hospital>) =>
    axiosInstance.put(`/api/hospitals/${id}`, data).then((r) => r.data?.data ?? r.data),
  softDelete: (id: number) =>
    axiosInstance.delete(`/api/hospitals/${id}`).then((r) => r.data),
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminHospital = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filtered, setFiltered] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // City filter
  const [activeCity, setActiveCity] = useState("ALL");
  const [cities, setCities] = useState<string[]>([]);

  // View modal
  const [viewHospital, setViewHospital] = useState<Hospital | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Add / Edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data: Hospital[] = await api.getAll();
      setHospitals(data);
      setFiltered(data);
      const uniqueCities = Array.from(new Set(data.map((h) => h.city).filter(Boolean))).sort();
      setCities(uniqueCities as string[]);
    } catch {
      errorNotification("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const applyFilters = (q: string, city: string, list: Hospital[]) => {
    const lower = q.toLowerCase();
    return list.filter((h) => {
      const matchSearch =
        !lower ||
        h.name?.toLowerCase().includes(lower) ||
        h.city?.toLowerCase().includes(lower) ||
        h.address?.toLowerCase().includes(lower);
      const matchCity = city === "ALL" || h.city === city;
      return matchSearch && matchCity;
    });
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setFiltered(applyFilters(val, activeCity, hospitals));
  };

  const handleCityTab = (city: string) => {
    setActiveCity(city);
    setFiltered(applyFilters(search, city, hospitals));
  };

  // ── Form helpers ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setFormMode("add");
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (h: Hospital) => {
    setFormMode("edit");
    setEditId(h.id);
    setForm({
      name: h.name,
      city: h.city,
      address: h.address,
      phone: h.phone,
      email: h.email ?? "",
      imageUrl: h.imageUrl ?? "",
      facilities: h.facilities ?? "",
    });
    setFormErrors({});
    setViewOpen(false);
    setFormOpen(true);
  };

  const setField = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Hospital name is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      if (formMode === "add") {
        await api.add(form);
        successNotification("Hospital added successfully!");
      } else if (editId !== null) {
        await api.update(editId, form);
        successNotification("Hospital updated successfully!");
      }
      setFormOpen(false);
      load();
    } catch (err: any) {
      errorNotification(err?.response?.data?.errorMessage || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setViewOpen(false);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    try {
      await api.softDelete(deleteId);
      successNotification("Hospital deactivated successfully");
      setDeleteOpen(false);
      setDeleteId(null);
      load();
    } catch (err: any) {
      errorNotification(err?.response?.data?.errorMessage || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
            Management
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">Hospitals</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TextInput
            placeholder="Search hospitals..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={15} stroke={1.5} className="text-gray-400" />}
            radius="md"
            styles={{ input: { border: "1.5px solid #e5e7eb", background: "white", fontSize: 14 } }}
          />
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#1a6fa8] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#155d8f] transition-colors"
          >
            <IconPlus size={16} /> Add Hospital
          </button>
          <span className="bg-blue-50 text-[#1a6fa8] text-sm font-bold px-3 py-1.5 rounded-xl border border-blue-100">
            {filtered.length} Hospitals
          </span>
        </div>
      </div>

      {/* City tabs */}
      {!loading && cities.length > 0 && (
        <div className="mb-5 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {["ALL", ...cities].map((city) => (
              <button
                key={city}
                onClick={() => handleCityTab(city)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap
                  ${activeCity === city
                    ? "bg-[#1a6fa8] text-white border-[#1a6fa8]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#1a6fa8] hover:text-[#1a6fa8]"
                  }`}
              >
                {city === "ALL" ? "All Cities" : city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader color="#1a6fa8" size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Top color bar — city color */}
              <div className={`h-1.5 bg-${getCityColor(h.city)}-500`} />

              <div className="p-5">
                {/* Icon + Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <IconBuildingHospital size={22} color="#1a6fa8" stroke={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">{h.name}</p>
                    <Badge
                      size="sm" radius="md" mt={4}
                      color={getCityColor(h.city)} variant="light"
                      style={{ width: "fit-content" }}
                    >
                      {h.city}
                    </Badge>
                  </div>
                  {/* Active indicator */}
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${h.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                </div>

                <div className="h-px bg-gray-100 mb-3" />

                {/* Info */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                    <IconMapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{h.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <IconPhone size={12} className="text-gray-400 shrink-0" />
                    {h.phone}
                  </div>
                  {h.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                      <IconMail size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{h.email}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    flex={1} size="xs" radius="md" color="#1a6fa8" variant="light"
                    leftSection={<IconEye size={13} />}
                    onClick={() => { setViewHospital(h); setViewOpen(true); }}
                  >
                    View
                  </Button>
                  <Button
                    flex={1} size="xs" radius="md" color="#1a6fa8" variant="filled"
                    leftSection={<IconEdit size={13} />}
                    onClick={() => openEdit(h)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs" radius="md" color="red" variant="light" px="sm"
                    onClick={() => confirmDelete(h.id)}
                  >
                    <IconTrash size={13} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-20 text-gray-400">
              <IconBuildingHospital size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No hospitals found</p>
            </div>
          )}
        </div>
      )}

      {/* ── View Modal ────────────────────────────────────────────────────────── */}
      <Modal
        opened={viewOpen} onClose={() => setViewOpen(false)}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Hospital Details</p>}
        centered radius="xl" size="md"
      >
        {viewHospital && (
          <Stack gap="lg">
            <Group gap="md" align="center" wrap="nowrap">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <IconBuildingHospital size={32} color="#1a6fa8" stroke={1.5} />
              </div>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={800} size="xl">{viewHospital.name}</Text>
                <Group gap="xs">
                  <Badge color={getCityColor(viewHospital.city)} variant="light" radius="xl">
                    {viewHospital.city}
                  </Badge>
                  <Badge
                    color={viewHospital.isActive ? "green" : "gray"}
                    variant="light" radius="xl"
                  >
                    {viewHospital.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Group>
              </Stack>
            </Group>

            <Divider label="Contact Info" labelPosition="left" />
            <SimpleGrid cols={2} spacing="md">
              {[
                { icon: <IconPhone size={15} color="#1a6fa8" />, label: "Phone", value: viewHospital.phone },
                { icon: <IconMail size={15} color="#1a6fa8" />, label: "Email", value: viewHospital.email || "—" },
              ].map((item) => (
                <Group key={item.label} gap="xs">
                  {item.icon}
                  <div>
                    <Text size="xs" c="dimmed">{item.label}</Text>
                    <Text fw={600} size="sm">{item.value}</Text>
                  </div>
                </Group>
              ))}
            </SimpleGrid>

            <Group gap="xs">
              <IconMapPin size={15} color="#1a6fa8" />
              <div>
                <Text size="xs" c="dimmed">Address</Text>
                <Text fw={600} size="sm">{viewHospital.address}</Text>
              </div>
            </Group>

            {viewHospital.facilities && (
              <>
                <Divider label="Facilities" labelPosition="left" />
                <Group gap="xs" wrap="wrap">
                  {viewHospital.facilities.split(",").map((f) => f.trim()).filter(Boolean).map((f) => (
                    <Badge key={f} size="sm" radius="md" color="blue" variant="dot">
                      {f}
                    </Badge>
                  ))}
                </Group>
              </>
            )}

            <Divider />
            <Group grow>
              <Button
                color="#1a6fa8" variant="light" radius="xl"
                leftSection={<IconEdit size={14} />}
                onClick={() => openEdit(viewHospital)}
              >
                Edit
              </Button>
              <Button
                color="red" variant="light" radius="xl"
                leftSection={<IconTrash size={14} />}
                onClick={() => confirmDelete(viewHospital.id)}
              >
                Deactivate
              </Button>
              <Button
                variant="light" color="gray" radius="xl"
                leftSection={<IconX size={14} />}
                onClick={() => setViewOpen(false)}
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        title={
          <p className="font-bold text-lg text-[#1a6fa8]">
            {formMode === "add" ? "Add New Hospital" : "Edit Hospital"}
          </p>
        }
        centered radius="xl" size="md"
      >
        <Stack gap="md">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Hospital Name *
            </label>
            <TextInput
              placeholder="e.g. PulseCare Pune Central"
              value={form.name}
              onChange={(e) => setField("name", e.currentTarget.value)}
              error={formErrors.name}
              radius="md" styles={inputStyles}
            />
          </div>

          <SimpleGrid cols={2} spacing="md">
            {/* City */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                City *
              </label>
              <TextInput
                placeholder="e.g. Pune"
                value={form.city}
                onChange={(e) => setField("city", e.currentTarget.value)}
                error={formErrors.city}
                radius="md" styles={inputStyles}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Phone *
              </label>
              <TextInput
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setField("phone", e.currentTarget.value)}
                error={formErrors.phone}
                radius="md" styles={inputStyles}
              />
            </div>
          </SimpleGrid>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Address *
            </label>
            <Textarea
              placeholder="Full address..."
              value={form.address}
              onChange={(e) => setField("address", e.currentTarget.value)}
              error={formErrors.address}
              radius="md" styles={inputStyles}
              minRows={2} autosize
            />
          </div>

          <SimpleGrid cols={2} spacing="md">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <TextInput
                placeholder="hospital@pulsecare.in"
                value={form.email}
                onChange={(e) => setField("email", e.currentTarget.value)}
                error={formErrors.email}
                radius="md" styles={inputStyles}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Image URL
              </label>
              <TextInput
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setField("imageUrl", e.currentTarget.value)}
                radius="md" styles={inputStyles}
              />
            </div>
          </SimpleGrid>

          {/* Facilities */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Facilities
              <span className="ml-1 text-gray-400 font-normal normal-case">(comma separated)</span>
            </label>
            <TextInput
              placeholder="ICU, OPD, Lab, Pharmacy, Emergency"
              value={form.facilities}
              onChange={(e) => setField("facilities", e.currentTarget.value)}
              radius="md" styles={inputStyles}
            />
            {/* Live preview */}
            {form.facilities && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.facilities.split(",").map((f) => f.trim()).filter(Boolean).map((f) => (
                  <Badge key={f} size="xs" radius="md" color="blue" variant="dot">{f}</Badge>
                ))}
              </div>
            )}
          </div>

          <Group grow mt="sm">
            <Button
              color="#1a6fa8" radius="xl"
              loading={formLoading}
              leftSection={<IconCheck size={15} />}
              onClick={handleSubmit}
            >
              {formMode === "add" ? "Add Hospital" : "Save Changes"}
            </Button>
            <Button
              variant="light" color="red" radius="xl"
              leftSection={<IconX size={15} />}
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      <Modal
        opened={deleteOpen} onClose={() => setDeleteOpen(false)}
        title={<p className="font-bold text-lg text-red-500">Deactivate Hospital</p>}
        centered radius="xl" size="sm"
      >
        <Text c="dimmed" size="sm" mb="lg">
          This hospital will be marked as <strong>inactive</strong> and hidden from public listings.
          Doctors linked to it will not be affected.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="light" color="gray" radius="xl"
            onClick={() => setDeleteOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button color="red" radius="xl" loading={deleteLoading} onClick={handleDelete}>
            Yes, Deactivate
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default AdminHospital;