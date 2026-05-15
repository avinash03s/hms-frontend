import {
  Avatar,
  Badge,
  Box,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { getAllAppointments, getAllDoctors, getAllPatients } from "../../../service/AdminService";

const statusColors: Record<string, string> = {
  SCHEDULED: "blue",
  CONFIRMED: "teal",
  COMPLETED: "green",
  CANCELLED: "red",
  PENDING: "yellow",
  NO_SHOW: "gray",
};

const avatarColors = [
  "teal", "blue", "violet", "grape", "pink", "red", "orange", "cyan",
];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || "teal";

const formatDateTime = (dt: string) => {
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

const AdminAppointment = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const [appRes, docRes, patRes] = await Promise.all([
        getAllAppointments(),
        getAllDoctors(),
        getAllPatients(),
      ]);

      const doctorMap: Record<number, string> = {};
      docRes.data.forEach((d: any) => { doctorMap[d.id] = d.name; });

      const patientMap: Record<number, string> = {};
      patRes.data.forEach((p: any) => { patientMap[p.id] = p.name; });

      const enriched = appRes.data.map((a: any) => ({
        ...a,
        doctorName: doctorMap[a.doctorId] || `Doctor #${a.doctorId}`,
        patientName: patientMap[a.patientId] || `Patient #${a.patientId}`,
      }));

      setAppointments(enriched);
      setFiltered(enriched);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const q = value.toLowerCase();
    setFiltered(
      appointments.filter(
        (a) =>
          a.doctorName?.toLowerCase().includes(q) ||
          a.patientName?.toLowerCase().includes(q) ||
          a.status?.toLowerCase().includes(q) ||
          a.reason?.toLowerCase().includes(q)
      )
    );
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <Box p="xl" style={{ minHeight: "100vh", background: "#f8fafb" }}>
      {/* Header */}
      <Group justify="space-between" mb="xl" align="center">
        <Title
          order={2}
          style={{ color: "#20c997", fontWeight: 700, letterSpacing: "-0.5px" }}
        >
          Appointments
        </Title>
        <Group gap="sm">
          <TextInput
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            radius="xl"
            w={240}
            styles={{
              input: { border: "1.5px solid #e0f5ef", background: "#fff" },
            }}
            leftSection={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="#20c997" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="#20c997" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
          <Badge size="lg" radius="xl" color="teal" variant="light" style={{ fontWeight: 600, fontSize: 14 }}>
            {filtered.length} Appointments
          </Badge>
        </Group>
      </Group>

      {/* Loading */}
      {loading && (
        <Group justify="center" mt={80}>
          <Loader color="teal" size="xl" />
        </Group>
      )}

      {/* Appointment Grid */}
      {!loading && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {filtered.map((app) => {
            const dt = app.appointmentTime ? formatDateTime(app.appointmentTime) : null;
            return (
              <Box key={app.id}>
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
                >
                  {/* Teal accent bar */}
                  <Box style={{ height: 4, background: "linear-gradient(90deg, #20c997, #12b886)" }} />

                  <Box p="lg">
                    {/* Status Badge */}
                    <Group justify="flex-end" mb={8}>
                      <Badge
                        size="sm"
                        radius="md"
                        color={statusColors[app.status] || "gray"}
                        variant="light"
                        style={{ fontWeight: 600, textTransform: "capitalize" }}
                      >
                        {app.status || "Unknown"}
                      </Badge>
                    </Group>

                    {/* Doctor */}
                    <Group gap="sm" mb={10} align="center">
                      <Avatar
                        size={44}
                        radius="xl"
                        color={getAvatarColor(app.doctorName || "")}
                        style={{
                          border: "2px solid #e0f5ef",
                          boxShadow: "0 2px 8px rgba(32,201,151,0.12)",
                          fontWeight: 700,
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(app.doctorName || "D")}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed" fw={500}>Doctor</Text>
                        <Text fw={700} size="sm" style={{ color: "#1a1a2e" }} lineClamp={1}>
                          {app.doctorName || "—"}
                        </Text>
                      </Stack>
                    </Group>

                    {/* Divider */}
                    <Box style={{ height: 1, background: "#e8f5f0", marginBottom: 10 }} />

                    {/* Patient */}
                    <Group gap="sm" mb={12} align="center">
                      <Avatar
                        size={44}
                        radius="xl"
                        color={getAvatarColor(app.patientName || "")}
                        style={{
                          border: "2px solid #e0f5ef",
                          boxShadow: "0 2px 8px rgba(32,201,151,0.12)",
                          fontWeight: 700,
                          fontSize: 16,
                          flexShrink: 0,
                          opacity: 0.85,
                        }}
                      >
                        {getInitials(app.patientName || "P")}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed" fw={500}>Patient</Text>
                        <Text fw={600} size="sm" style={{ color: "#1a1a2e" }} lineClamp={1}>
                          {app.patientName || "—"}
                        </Text>
                      </Stack>
                    </Group>

                    {/* Divider */}
                    <Box style={{ height: 1, background: "#e8f5f0", marginBottom: 12 }} />

                    {/* Info rows */}
                    <Stack gap={10}>
                      {/* Date & Time */}
                      {dt && (
                        <Group gap="xs" align="center">
                          <Box style={{ flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#20c997" strokeWidth="1.8" />
                              <path d="M16 2v4M8 2v4M3 10h18" stroke="#20c997" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </Box>
                          <Text size="xs" c="dimmed">{dt.date}</Text>
                          <Text size="xs" c="dimmed">•</Text>
                          <Text size="xs" c="dimmed">{dt.time}</Text>
                        </Group>
                      )}

                      {/* Reason */}
                      {app.reason && (
                        <Group gap="xs" align="flex-start" wrap="nowrap">
                          <Box style={{ flexShrink: 0, marginTop: 1 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#20c997" strokeWidth="1.8" strokeLinecap="round" />
                              <rect x="9" y="3" width="6" height="4" rx="1" stroke="#20c997" strokeWidth="1.8" />
                              <path d="M9 12h6M9 16h4" stroke="#20c997" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </Box>
                          <Text size="xs" c="dimmed" lineClamp={2}>{app.reason}</Text>
                        </Group>
                      )}

                      {/* Notes */}
                      {app.notes && (
                        <Group gap="xs" align="flex-start" wrap="nowrap">
                          <Box style={{ flexShrink: 0, marginTop: 1 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#20c997" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </Box>
                          <Text size="xs" c="dimmed" lineClamp={2}>{app.notes}</Text>
                        </Group>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Box>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <Box style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px" }}>
              <svg
                width="64" height="64" viewBox="0 0 24 24" fill="none"
                style={{ margin: "0 auto 16px", display: "block", opacity: 0.4 }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#20c997" strokeWidth="1.5" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#20c997" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <Text size="lg" fw={600} c="dimmed">No appointments found</Text>
              <Text size="sm" c="dimmed" mt={4}>Try adjusting your search query</Text>
            </Box>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default AdminAppointment;