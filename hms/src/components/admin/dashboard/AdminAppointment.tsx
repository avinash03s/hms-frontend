import { Avatar, Badge, Box, Group, Loader, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { getAllAppointments, getAllDoctors, getAllPatients } from "../../../service/AdminService";
import { IconSearch, IconCalendarTime, IconClipboard } from "@tabler/icons-react";

const statusColors: Record<string, string> = {
  SCHEDULED: "blue", CONFIRMED: "teal", COMPLETED: "green",
  CANCELLED: "red", PENDING: "yellow", NO_SHOW: "gray",
};

const avatarColors = ["blue","violet","grape","pink","cyan","indigo"];
const getInitials = (name: string) =>
  name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || "blue";

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
        getAllAppointments(), getAllDoctors(), getAllPatients(),
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
    setFiltered(appointments.filter((a) =>
      a.doctorName?.toLowerCase().includes(q) ||
      a.patientName?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q)
    ));
  };

  useEffect(() => { loadAppointments(); }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
            Management
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">Appointments</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TextInput
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={15} stroke={1.5} className="text-gray-400" />}
            radius="md"
            styles={{ input: { border: "1.5px solid #e5e7eb", background: "white", fontSize: 14 } }}
          />
          <span className="bg-blue-50 text-[#1a6fa8] text-sm font-bold px-3 py-1.5 rounded-xl border border-blue-100">
            {filtered.length} Appointments
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
          {filtered.map((app) => {
            const dt = app.appointmentTime ? formatDateTime(app.appointmentTime) : null;
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-1 bg-[#1a6fa8]" />
                <div className="p-5">
                  {/* Status */}
                  <div className="flex justify-end mb-3">
                    <Badge size="sm" radius="md" color={statusColors[app.status] || "gray"} variant="light">
                      {app.status || "Unknown"}
                    </Badge>
                  </div>

                  <Group gap="sm" mb={10} wrap="nowrap">
                    <Avatar size={40} radius="xl" color={getAvatarColor(app.doctorName || "")}
                      style={{ border: "2px solid #e8f1fb", fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(app.doctorName || "D")}
                    </Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="xs" c="dimmed" fw={500}>Doctor</Text>
                      <Text fw={700} size="sm" lineClamp={1}>{app.doctorName || "—"}</Text>
                    </Stack>
                  </Group>

                  <div className="h-px bg-gray-100 mb-3" />

                  <Group gap="sm" mb={12} wrap="nowrap">
                    <Avatar size={40} radius="xl" color={getAvatarColor(app.patientName || "")}
                      style={{ border: "2px solid #e8f1fb", fontWeight: 700, flexShrink: 0, opacity: 0.85 }}>
                      {getInitials(app.patientName || "P")}
                    </Avatar>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="xs" c="dimmed" fw={500}>Patient</Text>
                      <Text fw={600} size="sm" lineClamp={1}>{app.patientName || "—"}</Text>
                    </Stack>
                  </Group>

                  <div className="h-px bg-gray-100 mb-3" />

                  {dt && (
                    <div className="flex items-center gap-2 mb-2">
                      <IconCalendarTime size={14} stroke={1.5} className="text-[#1a6fa8] shrink-0" />
                      <Text size="xs" c="dimmed">{dt.date} • {dt.time}</Text>
                    </div>
                  )}

                  {app.reason && (
                    <div className="flex items-start gap-2">
                      <IconClipboard size={14} stroke={1.5} className="text-[#1a6fa8] shrink-0 mt-0.5" />
                      <Text size="xs" c="dimmed" lineClamp={2}>{app.reason}</Text>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-4 flex flex-col items-center justify-center py-20 text-gray-400">
              <IconCalendarTime size={48} stroke={1} className="mb-3 opacity-30" />
              <p className="font-semibold">No appointments found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAppointment;