import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { deletePatient, getAllPatients } from "../../../service/AdminService";

const bloodGroupColor: Record<string, string> = {
  "A+": "red",
  "A-": "pink",
  "B+": "blue",
  "B-": "cyan",
  "AB+": "grape",
  "AB-": "violet",
  "O+": "teal",
  "O-": "green",
};

const AdminPatient = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const handleSearch = (value: string) => {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q)
      )
    );
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deletePatient(deleteId);
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadPatients();
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Initials avatar fallback
  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  const avatarColors = [
    "teal", "blue", "violet", "grape", "pink", "red", "orange", "yellow",
  ];
  const getAvatarColor = (name: string) =>
    avatarColors[name?.charCodeAt(0) % avatarColors.length] || "teal";

  return (
    <Box p="xl" style={{ minHeight: "100vh", background: "#f8fafb" }}>
      {/* Header */}
      <Group justify="space-between" mb="xl" align="center">
        <Title
          order={2}
          style={{
            color: "#20c997",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          Patients
        </Title>
        <Group gap="sm">
          <TextInput
            placeholder="Search patients..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            radius="xl"
            w={240}
            styles={{
              input: {
                border: "1.5px solid #e0f5ef",
                background: "#fff",
                "&:focus": { borderColor: "#20c997" },
              },
            }}
            leftSection={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="#20c997" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="#20c997" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <Badge
            size="lg"
            radius="xl"
            color="teal"
            variant="light"
            style={{ fontWeight: 600, fontSize: 14 }}
          >
            {filtered.length} Patients
          </Badge>
        </Group>
      </Group>

      {/* Loading */}
      {loading && (
        <Group justify="center" mt={80}>
          <Loader color="teal" size="xl" />
        </Group>
      )}

      {/* Patient Grid */}
      {!loading && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {filtered.map((patient) => (
            <Box key={patient.id}>
              <Card
                shadow="sm"
                radius="xl"
                p={0}
                style={{
                  border: "1.5px solid #e8f5f0",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "pointer",
                }}
                styles={{
                  root: {
                    "&:hover": {
                      boxShadow: "0 8px 32px rgba(32,201,151,0.15)",
                      transform: "translateY(-2px)",
                    },
                  },
                }}
              >
                {/* Card Top - teal accent bar */}
                <Box
                  style={{
                    height: 4,
                    background: "linear-gradient(90deg, #20c997, #12b886)",
                  }}
                />

                <Box p="lg">
                  {/* Avatar + Name */}
                  <Group gap="md" mb="md" align="flex-start">
                    <Avatar
                      size={56}
                      radius="xl"
                      color={getAvatarColor(patient.name || "")}
                      style={{
                        border: "2.5px solid #e0f5ef",
                        boxShadow: "0 2px 8px rgba(32,201,151,0.15)",
                        fontWeight: 700,
                        fontSize: 20,
                      }}
                    >
                      {getInitials(patient.name || "P")}
                    </Avatar>
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Text
                        fw={700}
                        size="md"
                        style={{ color: "#1a1a2e", lineHeight: 1.2 }}
                        lineClamp={1}
                      >
                        {patient.name}
                      </Text>
                      <Badge
                        size="sm"
                        radius="md"
                        color={bloodGroupColor[patient.bloodGroup] || "teal"}
                        variant="light"
                        style={{ width: "fit-content", fontWeight: 600 }}
                      >
                        {patient.bloodGroup || "—"}
                      </Badge>
                    </Stack>
                  </Group>

                  {/* Divider */}
                  <Box
                    style={{
                      height: 1,
                      background: "#e8f5f0",
                      marginBottom: 14,
                    }}
                  />

                  {/* Info rows */}
                  <Stack gap={10}>
                    {/* Email */}
                    <Group gap="xs" align="center" wrap="nowrap">
                      <Box style={{ flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="4" width="20" height="16" rx="3" stroke="#20c997" strokeWidth="1.8" />
                          <path d="M2 8l10 6 10-6" stroke="#20c997" strokeWidth="1.8" />
                        </svg>
                      </Box>
                      <Text size="xs" c="dimmed" lineClamp={1} style={{ wordBreak: "break-all" }}>
                        {patient.email || "—"}
                      </Text>
                    </Group>

                    {/* Phone */}
                    {patient.phone && (
                      <Group gap="xs" align="center">
                        <Box style={{ flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2c1.2.5 2.5.7 3.5.7a1 1 0 011 1V19a1 1 0 01-1 1A17 17 0 014 4a1 1 0 011-1h3a1 1 0 011 1c0 1.1.2 2.2.7 3.5a1 1 0 01-.2 1.1L6.6 10.8z" stroke="#20c997" strokeWidth="1.8" />
                          </svg>
                        </Box>
                        <Text size="xs" c="dimmed">
                          {patient.phone}
                        </Text>
                      </Group>
                    )}

                    {/* Address / City */}
                    {(patient.address || patient.city) && (
                      <Group gap="xs" align="center">
                        <Box style={{ flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#20c997" strokeWidth="1.8" />
                            <circle cx="12" cy="9" r="2.5" stroke="#20c997" strokeWidth="1.8" />
                          </svg>
                        </Box>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {patient.address
                            ? `${patient.address}${patient.city ? ", " + patient.city : ""}`
                            : patient.city}
                        </Text>
                      </Group>
                    )}

                    {/* Age */}
                    {patient.age && (
                      <Group gap="xs" align="center">
                        <Box style={{ flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#20c997" strokeWidth="1.8" />
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="#20c997" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </Box>
                        <Text size="xs" c="dimmed">
                          {patient.age} Years
                        </Text>
                      </Group>
                    )}

                    {/* Gender */}
                    {patient.gender && (
                      <Group gap="xs" align="center">
                        <Box style={{ flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#20c997" strokeWidth="1.8" />
                            <path d="M6 21v-1a6 6 0 0112 0v1" stroke="#20c997" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </Box>
                        <Text size="xs" c="dimmed" style={{ textTransform: "capitalize" }}>
                          {patient.gender}
                        </Text>
                      </Group>
                    )}
                  </Stack>

                  {/* Delete Button */}
                  <Button
                    fullWidth
                    mt="md"
                    radius="xl"
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => confirmDelete(patient.id)}
                    style={{ fontWeight: 600 }}
                  >
                    Delete Patient
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}

          {/* Empty state */}
          {filtered.length === 0 && (
            <Box
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "80px 20px",
                color: "#adb5bd",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                style={{ margin: "0 auto 16px", display: "block", opacity: 0.4 }}
              >
                <circle cx="12" cy="8" r="4" stroke="#20c997" strokeWidth="1.5" />
                <path d="M6 21v-1a6 6 0 0112 0v1" stroke="#20c997" strokeWidth="1.5" />
              </svg>
              <Text size="lg" fw={600} c="dimmed">
                No patients found
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Try adjusting your search query
              </Text>
            </Box>
          )}
        </SimpleGrid>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Text fw={700} c="red" size="lg">
            Confirm Delete
          </Text>
        }
        centered
        radius="xl"
        overlayProps={{ blur: 3 }}
      >
        <Text c="dimmed" mb="lg">
          Are you sure you want to delete this patient? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="light"
            radius="xl"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" radius="xl" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default AdminPatient;