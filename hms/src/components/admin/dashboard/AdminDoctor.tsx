import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  deleteDoctor,
  getAllDoctors,
  registerDoctor,
} from "../../../service/AdminService";
import { errorNotification, successNotification } from "../../../utility/Notification";

const avatarColors = ["teal", "blue", "violet", "grape", "pink", "red", "orange", "cyan"];

const specializationColors: Record<string, string> = {
  Cardiology: "red", Neurology: "violet", Orthopedics: "blue",
  Pediatrics: "yellow", Dermatology: "pink", Oncology: "grape",
  Radiology: "cyan", Psychiatry: "indigo", Surgery: "orange", General: "teal",
};

const getInitials = (name: string) =>
  name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "D";

const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || "teal";

const getSpecColor = (spec: string) =>
  specializationColors[spec] ||
  avatarColors[(spec?.charCodeAt(0) || 0) % avatarColors.length] ||
  "teal";

const EMPTY_FORM = { name: "", email: "", password: "" };

const AdminDoctor = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [doctorForm, setDoctorForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  useEffect(() => { loadDoctors(); }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(
      doctors.filter((d) =>
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q)
      )
    );
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
      loadDoctors();
    } catch (error: any) {
      errorNotification(error?.response?.data?.errorMessage || "Failed to delete doctor");
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!doctorForm.name.trim())
      errors.name = "Name is required";
    if (!doctorForm.email.trim())
      errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(doctorForm.email))
      errors.email = "Invalid email format";
    if (!doctorForm.password)
      errors.password = "Password is required";
    else if (doctorForm.password.length < 6)
      errors.password = "Min. 6 characters";
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
      });
      successNotification("Doctor created successfully!");
      setAddModalOpen(false);
      setDoctorForm(EMPTY_FORM);
      setFormErrors({});
      loadDoctors();
    } catch (error: any) {
      const msg =
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        "Failed to create doctor";
      errorNotification(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setDoctorForm(EMPTY_FORM);
    setFormErrors({});
  };

  return (
    <Box style={{ minHeight: "100vh", background: "#f8fafb", padding: "clamp(12px, 2vw, 24px)" }}>

      {/* Header */}
      <Group justify="space-between" mb="xl" align="center" wrap="wrap" gap="md">
        <Title order={2} style={{ color: "#20c997", fontWeight: 700, fontSize: "clamp(1.4rem, 2vw, 2rem)" }}>
          Doctors
        </Title>

        <Group gap="sm" wrap="wrap" style={{ width: "100%", justifyContent: "flex-end" }}>
          <TextInput
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            radius="xl"
            styles={{
              root: { width: "100%", maxWidth: 280 },
              input: { border: "1.5px solid #e0f5ef", background: "#fff" },
            }}
            leftSection={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="#20c997" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="#20c997" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <Button radius="xl" color="teal" onClick={() => setAddModalOpen(true)}>
            + Add Doctor
          </Button>
          <Badge size="lg" radius="xl" color="teal" variant="light" style={{ fontWeight: 600, fontSize: 14 }}>
            {filtered.length} Doctors
          </Badge>
        </Group>
      </Group>

      {loading && <Group justify="center" mt={80}><Loader color="teal" size="xl" /></Group>}

      {!loading && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
          {filtered.map((doctor) => (
            <Box key={doctor.id} style={{ width: "100%", minWidth: 0 }}>
              <Card shadow="sm" radius="xl" p={0} style={{ border: "1.5px solid #e8f5f0", overflow: "hidden", height: "100%" }}>
                <Box style={{ height: 4, background: "linear-gradient(90deg, #20c997, #12b886)" }} />
                <Box style={{ padding: "clamp(14px, 2vw, 22px)" }}>
                  <Group gap="md" mb="md" align="flex-start" wrap="nowrap">
                    <Avatar
                      size={56} radius="xl"
                      color={getAvatarColor(doctor.name || "")}
                      style={{ border: "2.5px solid #e0f5ef", boxShadow: "0 2px 8px rgba(32,201,151,0.15)", fontWeight: 700, flexShrink: 0 }}
                    >
                      {getInitials(doctor.name || "D")}
                    </Avatar>
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="md" lineClamp={2} style={{ color: "#1a1a2e", lineHeight: 1.2 }}>
                        {doctor.name}
                      </Text>
                      <Badge size="sm" radius="md" color={getSpecColor(doctor.specialization)} variant="light" style={{ width: "fit-content" }}>
                        {doctor.specialization || "—"}
                      </Badge>
                    </Stack>
                  </Group>

                  <Box style={{ height: 1, background: "#e8f5f0", marginBottom: 14 }} />

                  <Text size="xs" c="dimmed" lineClamp={1}>{doctor.email || "—"}</Text>

                  <Button fullWidth mt="md" radius="xl" size="sm" color="red" variant="light"
                    onClick={() => confirmDelete(doctor.id)} style={{ fontWeight: 600 }}>
                    Delete Doctor
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}

          {filtered.length === 0 && (
            <Box style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px" }}>
              <Text size="lg" fw={600} c="dimmed">No doctors found</Text>
            </Box>
          )}
        </SimpleGrid>
      )}

      {/* DELETE MODAL */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}
        title={<Text fw={700} c="red" size="lg">Confirm Delete</Text>} centered radius="xl" size="sm">
        <Text c="dimmed" mb="lg">Are you sure you want to delete this doctor?</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" radius="xl" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button color="red" radius="xl" loading={deleteLoading} onClick={handleDelete}>Yes, Delete</Button>
        </Group>
      </Modal>

      <Modal opened={addModalOpen} onClose={handleCloseAddModal}
        title={<Text fw={700} size="lg" c="teal">Add New Doctor</Text>} centered radius="xl" size="sm">
        <Stack gap="sm">
          <TextInput
            label="Full Name" placeholder="Dr. John Smith" required
            value={doctorForm.name}
            onChange={(e) => handleFieldChange("name", e.currentTarget.value)}
            error={formErrors.name}
          />
          <TextInput
            label="Email" placeholder="doctor@hospital.com" required
            value={doctorForm.email}
            onChange={(e) => handleFieldChange("email", e.currentTarget.value)}
            error={formErrors.email}
          />
          <PasswordInput
            label="Password" placeholder="Min. 6 characters" required
            value={doctorForm.password}
            onChange={(e) => handleFieldChange("password", e.currentTarget.value)}
            error={formErrors.password}
          />
          <Group grow mt="sm">
            <Button color="teal" radius="xl" loading={addLoading} onClick={handleAddDoctor}>
              Create Doctor
            </Button>
            <Button variant="light" radius="xl" color="red" onClick={handleCloseAddModal} disabled={addLoading}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>

    </Box>
  );
};

export default AdminDoctor;