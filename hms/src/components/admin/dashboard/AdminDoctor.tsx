import {
  Avatar, Badge, Box, Button, Checkbox, Group, Loader,
  Modal, PasswordInput, SimpleGrid, Stack, Text, TextInput, Divider,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import {
  deleteDoctor, getAllDoctors, registerDoctor,
  setDoctorSchedule, getDoctorSchedule,
} from "../../../service/AdminService";
import { errorNotification, successNotification } from "../../../utility/Notification";
import {
  IconCalendar, IconTrash, IconX, IconUser, IconMail, IconPhone,
  IconMapPin, IconId, IconStethoscope, IconCertificate, IconBriefcase,
  IconSearch, IconPlus, IconBuildingHospital,
} from "@tabler/icons-react";
import axiosInstance from "../../../interceptor/AxiosInterceptor";

const avatarColors = ["blue", "violet", "grape", "pink", "cyan", "indigo"];
const getInitials = (name: string) =>
  name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "D";
const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || "blue";

const EMPTY_FORM = { name: "", email: "", password: "", hospitalId: "" };
const ALL_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const emptySchedule = () =>
  ALL_DAYS.map((day) => ({ dayOfWeek: day, startTime: "09:00", endTime: "17:00", available: false }));

const inputStyles = { input: { border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14 } };

const AdminDoctor = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [profileDoctor, setProfileDoctor] = useState<any | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [doctorForm, setDoctorForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedule, setSchedule] = useState(emptySchedule());

  const [hospitals, setHospitals] = useState<any[]>([]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await getAllDoctors();
      setDoctors(res.data);
      setFiltered(res.data);
    } catch {
      errorNotification("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const res = await axiosInstance.get("/api/hospitals");
      setHospitals(res.data?.data ?? []);
    } catch {
      errorNotification("Failed to load hospitals");
    }
  };

  useEffect(() => {
    loadDoctors();
    loadHospitals(); 
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(doctors.filter((d) =>
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    ));
  };

  const confirmDelete = (id: number) => { setDeleteId(id); setDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    try {
      await deleteDoctor(deleteId);
      successNotification("Doctor deleted successfully");
      setDeleteModalOpen(false);
      setDeleteId(null);
      setProfileOpen(false);
      loadDoctors();
    } catch (error: any) {
      errorNotification(error?.response?.data?.errorMessage || "Failed to delete doctor");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openSchedule = async (doctor: any) => {
    setProfileOpen(false);
    setProfileDoctor(doctor);
    setScheduleLoading(true);
    setScheduleOpen(true);
    try {
      const res = await getDoctorSchedule(doctor.id);
      if (res.data && res.data.length > 0) {
        const merged = emptySchedule().map((emptyRow) => {
          const existing = res.data.find((s: any) => s.dayOfWeek === emptyRow.dayOfWeek);
          return existing
            ? { dayOfWeek: existing.dayOfWeek, startTime: existing.startTime.slice(0, 5), endTime: existing.endTime.slice(0, 5), available: existing.available }
            : emptyRow;
        });
        setSchedule(merged);
      } else {
        setSchedule(emptySchedule());
      }
    } catch {
      setSchedule(emptySchedule());
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleScheduleSave = async () => {
    if (!profileDoctor) return;
    setScheduleLoading(true);
    try {
      for (const row of schedule) {
        await setDoctorSchedule({ ...row, doctorId: profileDoctor.id });
      }
      successNotification("Schedule saved successfully!");
      setScheduleOpen(false);
    } catch (error: any) {
      errorNotification(error?.response?.data?.errorMessage || "Failed to save schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateScheduleRow = (index: number, field: string, value: any) => {
    setSchedule((prev) => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!doctorForm.name.trim()) errors.name = "Name is required";
    if (!doctorForm.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(doctorForm.email)) errors.email = "Invalid email format";
    if (!doctorForm.password) errors.password = "Password is required";
    else if (doctorForm.password.length < 6) errors.password = "Min. 6 characters";
    if (!doctorForm.hospitalId) errors.hospitalId = "Hospital is required"; // ✅
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setDoctorForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddDoctor = async () => {
    if (!validateForm()) return;
    setAddLoading(true);
    try {
      await registerDoctor({
        name: doctorForm.name.trim(),
        email: doctorForm.email.trim(),
        password: doctorForm.password,
        role: "DOCTOR",
        hospitalId: Number(doctorForm.hospitalId),
      });
      successNotification("Doctor created successfully!");
      setAddModalOpen(false);
      setDoctorForm(EMPTY_FORM);
      setFormErrors({});
      loadDoctors();
    } catch (error: any) {
      errorNotification(error?.response?.data?.errorMessage || "Failed to create doctor");
    } finally {
      setAddLoading(false);
    }
  };

  const getHospitalName = (doctor: any) => {
    if (doctor.hospitalName) return doctor.hospitalName;
    const h = hospitals.find((h: any) => h.id === doctor.hospitalId);
    return h ? `${h.name} — ${h.city}` : "—";
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
            Management
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">Doctors</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TextInput
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={15} stroke={1.5} className="text-gray-400" />}
            radius="md"
            styles={{ input: { border: "1.5px solid #e5e7eb", background: "white", fontSize: 14 } }}
          />
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a6fa8] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#155d8f] transition-colors"
          >
            <IconPlus size={16} /> Add Doctor
          </button>
          <span className="bg-blue-50 text-[#1a6fa8] text-sm font-bold px-3 py-1.5 rounded-xl border border-blue-100">
            {filtered.length} Doctors
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center mt-20">
          <Loader color="#1a6fa8" size="lg" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-1 bg-[#1a6fa8]" />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar size={52} radius="xl" color={getAvatarColor(doctor.name || "")}
                    style={{ border: "2px solid #e8f1fb", flexShrink: 0, fontWeight: 700 }}>
                    {getInitials(doctor.name || "D")}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">{doctor.name}</p>
                    <Badge size="sm" radius="md" color="blue" variant="light" mt={4} style={{ width: "fit-content" }}>
                      {doctor.specialization || "—"}
                    </Badge>
                  </div>
                </div>
                <div className="h-px bg-gray-100 mb-3" />
                <p className="text-xs text-gray-400 truncate mb-1">{doctor.email || "—"}</p>
          
                <div className="flex items-center gap-1.5 mb-4">
                  <IconBuildingHospital size={12} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-400 truncate">{getHospitalName(doctor)}</p>
                </div>
                <div className="flex gap-2">
                  <Button flex={1} size="xs" radius="md" color="#1a6fa8" variant="light"
                    leftSection={<IconUser size={13} />}
                    onClick={() => { setProfileDoctor(doctor); setProfileOpen(true); }}>
                    Profile
                  </Button>
                  <Button flex={1} size="xs" radius="md" color="#1a6fa8" variant="filled"
                    leftSection={<IconCalendar size={13} />}
                    onClick={() => openSchedule(doctor)}>
                    Schedule
                  </Button>
                  <Button size="xs" radius="md" color="red" variant="light" px="sm"
                    onClick={() => confirmDelete(doctor.id)}>
                    <IconTrash size={13} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-20 text-gray-400">
              <p className="font-semibold">No doctors found</p>
            </div>
          )}
        </div>
      )}

  
      <Modal opened={profileOpen} onClose={() => setProfileOpen(false)}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Doctor Profile</p>}
        centered radius="xl" size="md">
        {profileDoctor && (
          <Stack gap="lg">
            <Group gap="md" align="center" wrap="nowrap">
              <Avatar size={80} radius="xl" color={getAvatarColor(profileDoctor.name || "")}
                style={{ border: "3px solid #e8f1fb", fontWeight: 700, flexShrink: 0 }}>
                {getInitials(profileDoctor.name || "D")}
              </Avatar>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={800} size="xl">Dr. {profileDoctor.name}</Text>
                <Badge size="md" radius="xl" color="blue" variant="light" style={{ width: "fit-content" }}>
                  {profileDoctor.specialization || "General"}
                </Badge>
                <Text size="sm" c="dimmed">{profileDoctor.email}</Text>
              </Stack>
            </Group>

            <Divider label="Professional Info" labelPosition="left" />
            <SimpleGrid cols={2} spacing="md">
              {[
                { icon: <IconId size={15} color="#1a6fa8" />, label: "Doctor ID", value: `#${profileDoctor.id}` },
                { icon: <IconBriefcase size={15} color="#1a6fa8" />, label: "Experience", value: `${profileDoctor.totalExperience || 0} Years` },
                { icon: <IconStethoscope size={15} color="#1a6fa8" />, label: "Department", value: profileDoctor.department || "General" },
                { icon: <IconCertificate size={15} color="#1a6fa8" />, label: "License No", value: profileDoctor.licenseNumber || "Not Added" },
              ].map((item) => (
                <Group key={item.label} gap="xs">
                  {item.icon}
                  <Box>
                    <Text size="xs" c="dimmed">{item.label}</Text>
                    <Text fw={600} size="sm">{item.value}</Text>
                  </Box>
                </Group>
              ))}
            </SimpleGrid>

       
            <Divider label="Hospital" labelPosition="left" />
            <Group gap="xs">
              <IconBuildingHospital size={15} color="#1a6fa8" />
              <Box>
                <Text size="xs" c="dimmed">Assigned Hospital</Text>
                <Text fw={600} size="sm">{getHospitalName(profileDoctor)}</Text>
              </Box>
            </Group>

            <Divider label="Contact Info" labelPosition="left" />
            <SimpleGrid cols={2} spacing="md">
              {[
                { icon: <IconPhone size={15} color="#1a6fa8" />, label: "Phone", value: profileDoctor.phoneNo || "Not Available" },
                { icon: <IconMail size={15} color="#1a6fa8" />, label: "Email", value: profileDoctor.email || "—" },
              ].map((item) => (
                <Group key={item.label} gap="xs">
                  {item.icon}
                  <Box>
                    <Text size="xs" c="dimmed">{item.label}</Text>
                    <Text fw={600} size="sm">{item.value}</Text>
                  </Box>
                </Group>
              ))}
              <Group gap="xs" style={{ gridColumn: "1 / -1" }}>
                <IconMapPin size={15} color="#1a6fa8" />
                <Box>
                  <Text size="xs" c="dimmed">Address</Text>
                  <Text fw={600} size="sm">{profileDoctor.address || "Not Added"}</Text>
                </Box>
              </Group>
            </SimpleGrid>

            <Divider />
            <Group grow>
              <Button color="red" variant="light" radius="xl" leftSection={<IconTrash size={14} />}
                onClick={() => { setProfileOpen(false); confirmDelete(profileDoctor.id); }}>
                Delete
              </Button>
              <Button variant="light" color="gray" radius="xl" leftSection={<IconX size={14} />}
                onClick={() => setProfileOpen(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal opened={scheduleOpen} onClose={() => setScheduleOpen(false)}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Schedule — Dr. {profileDoctor?.name}</p>}
        centered radius="xl" size="lg">
        <Stack gap="xs">
          <SimpleGrid cols={4} spacing="xs">
            {["Day", "Available", "Start", "End"].map((h) => (
              <Text key={h} fw={700} size="sm" c="dimmed">{h}</Text>
            ))}
          </SimpleGrid>
          <Divider />
          {schedule.map((row, i) => (
            <SimpleGrid key={row.dayOfWeek} cols={4} spacing="xs" style={{ alignItems: "center" }}>
              <Text fw={600} size="sm" style={{ textTransform: "capitalize" }}>
                {row.dayOfWeek.charAt(0) + row.dayOfWeek.slice(1).toLowerCase()}
              </Text>
              <Checkbox checked={row.available} color="#1a6fa8"
                onChange={(e) => updateScheduleRow(i, "available", e.currentTarget.checked)} />
              <TimeInput value={row.startTime} disabled={!row.available}
                onChange={(e) => updateScheduleRow(i, "startTime", e.currentTarget.value)}
                styles={{ input: { opacity: row.available ? 1 : 0.4 } }} />
              <TimeInput value={row.endTime} disabled={!row.available}
                onChange={(e) => updateScheduleRow(i, "endTime", e.currentTarget.value)}
                styles={{ input: { opacity: row.available ? 1 : 0.4 } }} />
            </SimpleGrid>
          ))}
          <Divider mt="sm" />
          <Group grow mt="xs">
            <Button color="#1a6fa8" radius="xl" loading={scheduleLoading} onClick={handleScheduleSave}>
              Save Schedule
            </Button>
            <Button variant="light" color="gray" radius="xl" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}
        title={<p className="font-bold text-lg text-red-500">Confirm Delete</p>}
        centered radius="xl" size="sm">
        <Text c="dimmed" mb="lg" size="sm">Are you sure you want to delete this doctor? This action cannot be undone.</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" radius="xl" color="gray" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button color="red" radius="xl" loading={deleteLoading} onClick={handleDelete}>Yes, Delete</Button>
        </Group>
      </Modal>

      <Modal
        opened={addModalOpen}
        onClose={() => { setAddModalOpen(false); setDoctorForm(EMPTY_FORM); setFormErrors({}); }}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Add New Doctor</p>}
        centered radius="xl" size="sm"
      >
        <Stack gap="md">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
            <TextInput placeholder="Dr. John Smith" value={doctorForm.name}
              onChange={(e) => handleFieldChange("name", e.currentTarget.value)}
              error={formErrors.name} radius="md" styles={inputStyles} />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
            <TextInput placeholder="doctor@hospital.com" value={doctorForm.email}
              onChange={(e) => handleFieldChange("email", e.currentTarget.value)}
              error={formErrors.email} radius="md" styles={inputStyles} />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
            <PasswordInput placeholder="Min. 6 characters" value={doctorForm.password}
              onChange={(e) => handleFieldChange("password", e.currentTarget.value)}
              error={formErrors.password} radius="md" styles={inputStyles} />
          </div>

        
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Hospital
            </label>
            <select
              value={doctorForm.hospitalId}
              onChange={(e) => handleFieldChange("hospitalId", e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-gray-700"
              style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb", outline: "none" }}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h: any) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.city}
                </option>
              ))}
            </select>
            {formErrors.hospitalId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.hospitalId}</p>
            )}
          </div>

          <Group grow mt="sm">
            <Button color="#1a6fa8" radius="xl" loading={addLoading} onClick={handleAddDoctor}>
              Create Doctor
            </Button>
            <Button variant="light" radius="xl" color="red"
              onClick={() => { setAddModalOpen(false); setDoctorForm(EMPTY_FORM); setFormErrors({}); }}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default AdminDoctor;