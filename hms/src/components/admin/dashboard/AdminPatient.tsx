import {
  Avatar, Badge, Box, Button, Divider, Group, Loader,
  Modal, SimpleGrid, Stack, Text, TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { deletePatient, getAllPatients } from "../../../service/AdminService";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { IconSearch, IconTrash, IconX } from "@tabler/icons-react";

const bloodGroupColor: Record<string, string> = {
  "A+": "red","A-": "pink","B+": "blue","B-": "cyan",
  "AB+": "grape","AB-": "violet","O+": "teal","O-": "green",
  A_POSITIVE: "red",A_NEGATIVE: "pink",B_POSITIVE: "blue",B_NEGATIVE: "cyan",
  AB_POSITIVE: "grape",AB_NEGATIVE: "violet",O_POSITIVE: "teal",O_NEGATIVE: "green",
};

const avatarColors = ["blue","violet","grape","pink","cyan","indigo"];
const getInitials = (name: string) =>
  name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "P";
const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || "blue";

const formatArrayData = (value: any) => {
  if (!value) return "None";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.length ? parsed.join(", ") : "None";
    } catch {}
    return value.replace(/[\[\]"]/g, "").trim() || "None";
  }
  return String(value);
};

const AdminPatient = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profilePatient, setProfilePatient] = useState<any | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await getAllPatients();
      setPatients(res.data);
      setFiltered(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatients(); }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(patients.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNo?.toLowerCase().includes(q)
    ));
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    try {
      await deletePatient(deleteId);
      successNotification("Patient deleted successfully");
      setDeleteModalOpen(false);
      setDeleteId(null);
      setProfileOpen(false);
      loadPatients();
    } catch {
      errorNotification("Failed to delete patient");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
            Management
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">Patients</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TextInput
            placeholder="Search patients..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={15} stroke={1.5} className="text-gray-400" />}
            radius="md"
            styles={{ input: { border: "1.5px solid #e5e7eb", background: "white", fontSize: 14 } }}
          />
          <span className="bg-blue-50 text-[#1a6fa8] text-sm font-bold px-3 py-1.5 rounded-xl border border-blue-100">
            {filtered.length} Patients
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
          {filtered.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => { setProfilePatient(patient); setProfileOpen(true); }}
            >
              <div className="h-1 bg-[#1a6fa8]" />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar size={52} radius="xl" color={getAvatarColor(patient.name || "")}
                    src={patient.profilePictureUrl || null}
                    style={{ border: "2px solid #e8f1fb", flexShrink: 0, fontWeight: 700 }}>
                    {getInitials(patient.name || "P")}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">{patient.name}</p>
                    <Badge size="sm" radius="md"
                      color={bloodGroupColor[patient.bloodGroup] || "blue"}
                      variant="light" mt={4} style={{ width: "fit-content" }}>
                      {patient.bloodGroup || "—"}
                    </Badge>
                  </div>
                </div>
                <div className="h-px bg-gray-100 mb-3" />
                <p className="text-xs text-gray-400 truncate mb-4">{patient.email || "—"}</p>
                <Button
                  fullWidth size="xs" radius="md" color="red" variant="light"
                  leftSection={<IconTrash size={13} />}
                  onClick={(e) => { e.stopPropagation(); setDeleteId(patient.id); setDeleteModalOpen(true); }}
                >
                  Delete Patient
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-20 text-gray-400">
              <p className="font-semibold">No patients found</p>
            </div>
          )}
        </div>
      )}

      <Modal opened={profileOpen} onClose={() => setProfileOpen(false)}
        title={<p className="font-bold text-lg text-[#1a6fa8]">Patient Profile</p>}
        centered radius="xl" size="md">
        {profilePatient && (
          <Stack gap="lg">
            <Group gap="md" align="center" wrap="nowrap">
              <Avatar size={80} radius="xl" color={getAvatarColor(profilePatient.name || "")}
                src={profilePatient.profilePictureUrl || null}
                style={{ border: "3px solid #e8f1fb", fontWeight: 700, flexShrink: 0 }}>
                {getInitials(profilePatient.name || "P")}
              </Avatar>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={800} size="xl">{profilePatient.name}</Text>
                <Badge size="md" radius="xl" color={bloodGroupColor[profilePatient.bloodGroup] || "blue"}
                  variant="light" style={{ width: "fit-content" }}>
                  Blood: {profilePatient.bloodGroup || "—"}
                </Badge>
                <Text size="sm" c="dimmed">{profilePatient.email}</Text>
              </Stack>
            </Group>

            <Divider label="Personal Information" labelPosition="left" />
            <SimpleGrid cols={2} spacing="md">
              {[
                { label: "Patient ID", value: `#${profilePatient.id}` },
                { label: "Blood Group", value: profilePatient.bloodGroup || "—" },
                { label: "Allergies", value: formatArrayData(profilePatient.allergies) },
                { label: "Chronic Disease", value: formatArrayData(profilePatient.chronicDisease) },
              ].map((item) => (
                <Box key={item.label}>
                  <Text size="xs" c="dimmed">{item.label}</Text>
                  <Text fw={600} size="sm">{item.value}</Text>
                </Box>
              ))}
            </SimpleGrid>

            <Divider label="Contact Information" labelPosition="left" />
            <SimpleGrid cols={2} spacing="md">
              <Box><Text size="xs" c="dimmed">Phone</Text><Text fw={600} size="sm">{profilePatient.phoneNo || "Not Available"}</Text></Box>
              <Box><Text size="xs" c="dimmed">Email</Text><Text fw={600} size="sm">{profilePatient.email || "—"}</Text></Box>
              <Box style={{ gridColumn: "1 / -1" }}>
                <Text size="xs" c="dimmed">Address</Text>
                <Text fw={600} size="sm">{profilePatient.address || "Not added"}</Text>
              </Box>
            </SimpleGrid>

            <Divider label="Account" labelPosition="left" />
            <Badge color={profilePatient.active === false ? "red" : "teal"} radius="xl" variant="light" style={{ width: "fit-content" }}>
              {profilePatient.active === false ? "Inactive" : "Active"}
            </Badge>

            <Divider />
            <Group grow>
              <Button color="red" variant="light" radius="xl" leftSection={<IconTrash size={14} />}
                onClick={() => { setProfileOpen(false); setDeleteId(profilePatient.id); setDeleteModalOpen(true); }}>
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

      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}
        title={<p className="font-bold text-lg text-red-500">Confirm Delete</p>}
        centered radius="xl" size="sm">
        <Text c="dimmed" mb="lg" size="sm">Are you sure you want to delete this patient?</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" radius="xl" color="gray" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button color="red" radius="xl" loading={deleteLoading} onClick={handleDelete}>Yes, Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default AdminPatient;