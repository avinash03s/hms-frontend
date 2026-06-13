import {
  useCallback, useEffect, useMemo, useState,
} from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getAllAppointments, getAllDoctors, getAllPatients,
} from "../../../service/AdminService";
import {
  IconUsers, IconStethoscope, IconCalendarTime, IconRefresh,
} from "@tabler/icons-react";


function pick(obj: any, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "—";
}

function pickNum(obj: any, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && !isNaN(Number(v))) return Number(v);
  }
  return 0;
}

function safeArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function normalizeAppointment(raw: any) {
  return {
    id: pickNum(raw, "id", "appointmentId"),
    patientName: pick(raw, "patientName", "patient_name", "patient"),
    doctorName: pick(raw, "doctorName", "doctor_name", "doctor"),
    specialization: pick(raw, "specialization", "department"),
    appointmentDate: pick(raw, "appointmentDate", "appointment_date", "date", "createdAt"),
    appointmentTime: pick(raw, "appointmentTime", "appointment_time", "time"),
    status: pick(raw, "status", "appointmentStatus"),
  };
}

function normalizePatient(raw: any) {
  return {
    patientId: pickNum(raw, "patientId", "id"),
    fullName: pick(raw, "fullName", "name", "patientName"),
    bloodGroup: pick(raw, "bloodGroup", "blood_type"),
    disease: pick(raw, "disease", "diagnosis", "condition"),
    email: pick(raw, "email"),
    address: pick(raw, "address", "city"),
  };
}

function normalizeDoctor(raw: any) {
  return {
    doctorId: pickNum(raw, "doctorId", "id"),
    fullName: pick(raw, "fullName", "name", "doctorName"),
    specialization: pick(raw, "specialization", "department"),
    email: pick(raw, "email"),
  };
}

type NAppointment = ReturnType<typeof normalizeAppointment>;
type NPatient = ReturnType<typeof normalizePatient>;
type NDoctor = ReturnType<typeof normalizeDoctor>;

function buildMonthlyData(appointments: NAppointment[]) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const counts: Record<string, number> = {};
  appointments.forEach((a) => {
    if (a.appointmentDate === "—") return;
    const d = new Date(a.appointmentDate.replace(" ", "T"));
    if (isNaN(d.getTime())) return;
    const k = months[d.getMonth()];
    counts[k] = (counts[k] || 0) + 1;
  });
  return months.filter((m) => counts[m]).map((m) => ({ month: m, value: counts[m] }));
}

function buildSpecData(doctors: NDoctor[]) {
  const counts: Record<string, number> = {};
  doctors.forEach((d) => {
    const key = d.specialization === "—" ? "Other" : d.specialization;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function fmtDateTime(raw: string) {
  if (!raw || raw === "—") return { date: "—", time: "" };
  const d = new Date(raw.replace(" ", "T"));
  if (isNaN(d.getTime())) return { date: raw, time: "" };
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

const PIE_COLORS = ["#1a6fa8","#0d9488","#7c3aed","#0891b2","#d97706","#dc2626","#16a34a"];

function statusBadge(status = "") {
  const s = status.toLowerCase();
  if (["confirmed","active","completed"].includes(s)) return { bg: "#dcfce7", color: "#16a34a" };
  if (["pending","scheduled"].includes(s)) return { bg: "#dbeafe", color: "#1d4ed8" };
  return { bg: "#f3f4f6", color: "#6b7280" };
}


const Skeleton = ({ h = 50 }: { h?: number }) => (
  <div
    className="rounded-xl mb-2 animate-pulse bg-gray-100"
    style={{ height: h }}
  />
);


const MiniArea = ({ data, color, gradId }: any) => (
  <ResponsiveContainer width="100%" height={60}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} />
    </AreaChart>
  </ResponsiveContainer>
);


const StatCard = ({ label, count, chartData, color, icon }: any) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="h-1 w-full rounded-t-2xl" style={{ background: color }} />
    <div className="px-5 pt-4 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color + "18", color }}
        >
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900">{count}</p>
        </div>
      </div>
      <MiniArea data={chartData} color={color} gradId={`grad-${label}`} />
    </div>
  </div>
);

const SectionCard = ({ title, children }: any) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="h-1 w-10 bg-[#1a6fa8] rounded-full mb-4" />
    <h3 className="font-bold text-gray-900 text-base mb-4">{title}</h3>
    {children}
  </div>
);


const AppointRow = ({ a }: { a: NAppointment }) => {
  const sb = statusBadge(a.status);
  const { date, time } = fmtDateTime(a.appointmentDate);
  return (
    <div className="flex items-start justify-between gap-3 bg-[#f4f7fb] rounded-xl px-4 py-3 mb-2">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{a.patientName}</p>
        <p className="text-xs text-gray-400 truncate">{a.doctorName}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">{date}</p>
        <p className="text-xs text-gray-400">{time}</p>
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: sb.bg, color: sb.color }}
        >
          {a.status}
        </span>
      </div>
    </div>
  );
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow text-xs">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => <div key={i}>{p.value}</div>)}
    </div>
  );
};


const fallback = [{ value: 0 }, { value: 2 }, { value: 4 }, { value: 2 }, { value: 1 }];

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<NAppointment[]>([]);
  const [patients, setPatients] = useState<NPatient[]>([]);
  const [doctors, setDoctors] = useState<NDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [aRes, pRes, dRes] = await Promise.all([
        getAllAppointments(), getAllPatients(), getAllDoctors(),
      ]);
      setAppointments(safeArray(aRes.data).map(normalizeAppointment));
      setPatients(safeArray(pRes.data).map(normalizePatient));
      setDoctors(safeArray(dRes.data).map(normalizeDoctor));
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const monthlyData = useMemo(() => buildMonthlyData(appointments), [appointments]);
  const specData = useMemo(() => buildSpecData(doctors), [doctors]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="inline-block bg-blue-100 text-[#1a6fa8] text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2">
            Overview
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-sm font-semibold text-[#1a6fa8] border border-[#1a6fa8]/30 px-4 py-2 rounded-xl hover:bg-[#1a6fa8]/5 transition-colors"
        >
          <IconRefresh size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard
          label="Appointments"
          count={appointments.length}
          chartData={monthlyData.length ? monthlyData : fallback}
          color="#1a6fa8"
          icon={<IconCalendarTime size={20} stroke={1.5} />}
        />
        <StatCard
          label="Patients"
          count={patients.length}
          chartData={fallback}
          color="#0d9488"
          icon={<IconUsers size={20} stroke={1.5} />}
        />
        <StatCard
          label="Doctors"
          count={doctors.length}
          chartData={fallback}
          color="#7c3aed"
          icon={<IconStethoscope size={20} stroke={1.5} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

        <SectionCard title="Doctor Specializations">
          {loading ? (
            <Skeleton h={240} />
          ) : specData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No Data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={specData} dataKey="value" innerRadius={55} outerRadius={85}>
                    {specData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-3">
                {specData.slice(0, 6).map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] + "18", color: PIE_COLORS[i % PIE_COLORS.length] }}
                  >
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Recent Appointments">
          {loading ? (
            <>{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</>
          ) : appointments.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">No appointments</div>
          ) : (
            appointments.slice(0, 5).map((a, i) => <AppointRow key={`${a.id}-${i}`} a={a} />)
          )}
        </SectionCard>

        <SectionCard title="Dept. Breakdown">
          {loading ? (
            <>{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</>
          ) : (
            <div className="space-y-2">
              {specData.slice(0, 6).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#f4f7fb] border border-gray-100 px-4 py-3 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">Department</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: PIE_COLORS[i % PIE_COLORS.length] + "18",
                      color: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <SectionCard title="Recent Patients">
          {loading ? (
            <>{Array(3).fill(0).map((_, i) => <Skeleton key={i} h={70} />)}</>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {patients.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-[#f4f7fb] border border-gray-100 rounded-xl px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{p.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{p.email}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{p.address}</p>
                    {p.bloodGroup !== "—" && (
                      <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                        {p.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Doctors */}
        <SectionCard title="Recent Doctors">
          {loading ? (
            <>{Array(3).fill(0).map((_, i) => <Skeleton key={i} h={70} />)}</>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {doctors.slice(0, 8).map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-[#f4f7fb] border border-gray-100 rounded-xl px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">Dr. {d.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{d.email}</p>
                  </div>
                  <div className="shrink-0 ml-3">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: "#1a6fa8" + "18", color: "#1a6fa8" }}
                    >
                      {d.specialization}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
};

export default AdminDashboard;