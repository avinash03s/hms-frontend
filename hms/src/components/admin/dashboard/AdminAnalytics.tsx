import {
  Box,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  getAllAppointments,
  getAllDoctors,
  getAllPatients,
} from "../../../service/AdminService";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

//Stat Card
const StatCard = ({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) => (
  <Card
    radius="xl"
    p={0}
    style={{ border: "1.5px solid #e8f5f0", overflow: "hidden" }}
    shadow="sm"
  >
    <Box style={{ height: 4, background: color }} />
    <Box p="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase", letterSpacing: 1 }}>
            {label}
          </Text>
          <Text fw={800} size="xl" style={{ color: "#1a1a2e", fontSize: 32, lineHeight: 1 }}>
            {value}
          </Text>
          {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        </Stack>
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Group>
    </Box>
  </Card>
);

//Chart Card wrapper
const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card radius="xl" p={0} style={{ border: "1.5px solid #e8f5f0" }} shadow="sm">
    <Box style={{ height: 4, background: "linear-gradient(90deg, #20c997, #12b886)" }} />
    <Box p="lg">
      <Text fw={700} mb="md" style={{ color: "#1a1a2e", fontSize: 15 }}>
        {title}
      </Text>
      {children}
    </Box>
  </Card>
);

//Main Component
const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
  });
  const [statusData, setStatusData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [topDoctors, setTopDoctors] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [appRes, docRes, patRes] = await Promise.all([
          getAllAppointments(),
          getAllDoctors(),
          getAllPatients(),
        ]);

        const appointments: any[] = appRes.data;
        const doctors: any[] = docRes.data;
        const patients: any[] = patRes.data;

        const today = new Date().toISOString().slice(0, 10);
        const todayCount = appointments.filter((a) =>
          a.appointmentTime?.startsWith(today)
        ).length;

        setStats({
          totalDoctors: doctors.length,
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          todayAppointments: todayCount,
        });

        //Status distribution
        const statusCount: Record<string, number> = {};
        appointments.forEach((a) => {
          const s = a.status || "UNKNOWN";
          statusCount[s] = (statusCount[s] || 0) + 1;
        });
        setStatusData({
          labels: Object.keys(statusCount),
          datasets: [
            {
              data: Object.values(statusCount),
              backgroundColor: [
                "#20c997", "#339af0", "#ff6b6b", "#ffd43b", "#cc5de8", "#94d82d",
              ],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        });

        //Daily appointments
        const days: string[] = [];
        const dayCounts: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          days.push(label);
          dayCounts.push(
            appointments.filter((a) => a.appointmentTime?.startsWith(key)).length
          );
        }
        setDailyData({
          labels: days,
          datasets: [
            {
              label: "Appointments",
              data: dayCounts,
              backgroundColor: "rgba(32,201,151,0.15)",
              borderColor: "#20c997",
              borderWidth: 2,
              pointBackgroundColor: "#20c997",
              pointRadius: 4,
              fill: true,
              tension: 0.4,
            },
          ],
        });

        //Top doctors by appointment count
        const docCount: Record<number, number> = {};
        appointments.forEach((a) => {
          docCount[a.doctorId] = (docCount[a.doctorId] || 0) + 1;
        });
        const docMap: Record<number, string> = {};
        doctors.forEach((d) => { docMap[d.id] = d.name; });

        const sorted = Object.entries(docCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        setTopDoctors({
          labels: sorted.map(([id]) => docMap[Number(id)] || `Dr. #${id}`),
          datasets: [
            {
              label: "Appointments",
              data: sorted.map(([, count]) => count),
              backgroundColor: [
                "#20c997", "#339af0", "#cc5de8", "#ff6b6b", "#ffd43b",
              ],
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        });

        // Using patient index as proxy since no createdAt — show specialization spread for doctors instead
        const specCount: Record<string, number> = {};
        doctors.forEach((d) => {
          const s = d.specialization || "General";
          specCount[s] = (specCount[s] || 0) + 1;
        });
        setMonthlyData({
          labels: Object.keys(specCount),
          datasets: [
            {
              label: "Doctors",
              data: Object.values(specCount),
              backgroundColor: [
                "#20c997", "#339af0", "#cc5de8", "#ff6b6b", "#ffd43b",
                "#94d82d", "#f06595", "#74c0fc", "#a9e34b", "#ffa94d",
              ],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box p="xl" style={{ minHeight: "100vh", background: "#f8fafb" }}>
        <Group justify="center" mt={120}>
          <Loader color="teal" size="xl" />
        </Group>
      </Box>
    );
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#adb5bd", font: { size: 11 } } },
      y: { grid: { color: "#f1f3f5" }, ticks: { color: "#adb5bd", font: { size: 11 } }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#6b7280", font: { size: 11 }, padding: 12, boxWidth: 12 },
      },
    },
  };

  return (
    <Box p="xl" style={{ minHeight: "100vh", background: "#f8fafb" }}>
      {/* Header */}
      <Title
        order={2}
        mb="xl"
        style={{ color: "#20c997", fontWeight: 700, letterSpacing: "-0.5px" }}
      >
        Analytics
      </Title>

      {/* Stat Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        <StatCard
          label="Total Doctors"
          value={stats.totalDoctors}
          color="linear-gradient(135deg, #20c997, #12b886)"
          sub="Registered in system"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#20c997" strokeWidth="2" />
              <path d="M6 21v-1a6 6 0 0112 0v1" stroke="#20c997" strokeWidth="2" strokeLinecap="round" />
              <path d="M19 8v4M17 10h4" stroke="#20c997" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Total Patients"
          value={stats.totalPatients}
          color="linear-gradient(135deg, #339af0, #1c7ed6)"
          sub="Registered in system"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#339af0" strokeWidth="2" />
              <path d="M6 21v-1a6 6 0 0112 0v1" stroke="#339af0" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Total Appointments"
          value={stats.totalAppointments}
          color="linear-gradient(135deg, #cc5de8, #ae3ec9)"
          sub="All time"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#cc5de8" strokeWidth="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="#cc5de8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Today's Appointments"
          value={stats.todayAppointments}
          color="linear-gradient(135deg, #ff6b6b, #f03e3e)"
          sub="Scheduled for today"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#ff6b6b" strokeWidth="2" />
              <path d="M12 7v5l3 3" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
      </SimpleGrid>

      {/* Charts Row 1 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
        {/* Daily Appointments - Line */}
        <ChartCard title="Appointments — Last 7 Days">
          {dailyData && <Line data={dailyData} options={chartOptions} height={120} />}
        </ChartCard>

        {/* Appointment Status - Doughnut */}
        <ChartCard title="Appointment Status Distribution">
          {statusData && (
            <Box style={{ maxWidth: 280, margin: "0 auto" }}>
              <Doughnut data={statusData} options={doughnutOptions} />
            </Box>
          )}
        </ChartCard>
      </SimpleGrid>

      {/* Charts Row 2 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Top Doctors - Bar */}
        <ChartCard title="Top Doctors by Appointments">
          {topDoctors && <Bar data={topDoctors} options={chartOptions} height={120} />}
        </ChartCard>

        {/* Doctor Specialization - Doughnut */}
        <ChartCard title="Doctors by Specialization">
          {monthlyData && (
            <Box style={{ maxWidth: 280, margin: "0 auto" }}>
              <Doughnut data={monthlyData} options={doughnutOptions} />
            </Box>
          )}
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
};

export default AdminAnalytics;