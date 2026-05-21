import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Chart,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler,
  DoughnutController, ArcElement, Tooltip,
} from "chart.js";
import { getAppointmentsByPatient } from "../../../service/AppointmentService";
import { getPatient } from "../../../service/PatientProfileService";
import { getDoctor } from "../../../service/DoctorProfileService";
import AIChatBot from "../../utility/AIChatBot";

Chart.register(
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler,
  DoughnutController, ArcElement, Tooltip
);

interface PatientDTO {
  id: number;
  name: string;
  email: string;
  dob: string;
  profilePictureId: number;
  phoneNo: string;
  address: string;
  aadharId: string;
  bloodGroup: string;
  allergies: string;
  chronicDisease: string;
}

interface DoctorDTO {
  id: number;
  name: string;
  specialization: string;
  department: string;
  phoneNo: string;
}

interface AppointmentDTO {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentTime: string;
  status: string;
  reason: string;
  notes: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

const REASON_COLORS = ["#0D9488", "#2563EB", "#D97706", "#DC2626", "#7C3AED", "#EC4899"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BLOOD_COLORS: Record<string, string> = {
  A_POSITIVE: "#DC2626", A_NEGATIVE: "#F87171",
  B_POSITIVE: "#2563EB", B_NEGATIVE: "#818CF8",
  O_POSITIVE: "#0D9488", O_NEGATIVE: "#34D399",
  AB_POSITIVE: "#D97706", AB_NEGATIVE: "#FCD34D",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  SCHEDULED: { bg: "#F5F3FF", color: "#6D28D9", dot: "#7C3AED" },
  COMPLETED: { bg: "#ECFDF5", color: "#065F46", dot: "#10B981" },
  CANCELLED: { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444" },
  PENDING: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B" },
};

const calcAge = (dob: string) =>
  dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

const formatBloodGroup = (bg: string) =>
  bg ? bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "−") : "—";

const getDatePart = (t: string) => (t ? new Date(t).toISOString().split("T")[0] : "");

const formatTime = (t: string) => {
  if (!t) return { hr: "—", ampm: "" };
  const d = new Date(t);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return { hr: `${h % 12 || 12}:${m}`, ampm: h >= 12 ? "PM" : "AM" };
};

const parseListField = (val: string | string[] | null | undefined): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  const trimmed = val.trim();

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch { }
  }

  return trimmed ? [trimmed] : [];
};

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "PT";

const StatCard = ({
  label,
  value,
  iconClass,
  iconBg,
  valueColor,
}: {
  label: string;
  value: number | string;
  iconClass: string;
  iconBg: string;
  valueColor: string;
}) => (
  <div
    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
      style={{ background: iconBg }}
    >
      <i className={`ti ${iconClass}`} aria-hidden="true" />
    </div>

    <div>
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </div>

      <div
        className="text-2xl sm:text-3xl font-bold leading-none"
        style={{ color: valueColor }}
      >
        {value}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_STYLE[status] ?? {
    bg: "#F1F5F9",
    color: "#475569",
    dot: "#94A3B8",
  };

  return (
    <div
      className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap shrink-0"
      style={{
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: cfg.dot }}
      />
      {status}
    </div>
  );
};

const AppointmentCard = ({ appt }: { appt: AppointmentDTO }) => {
  const { hr, ampm } = formatTime(appt.appointmentTime);
  const d = new Date(appt.appointmentTime);
  const mon = d.toLocaleDateString([], { month: "short" });
  const day = d.getDate();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 transition-all"
    >
      <div className="flex flex-col items-center min-w-[52px] bg-white border border-slate-100 rounded-xl px-2 py-2 shrink-0 shadow-sm">
        <span className="text-[10px] font-semibold text-slate-400 uppercase">
          {mon}
        </span>

        <span className="text-sm font-bold text-teal-600 leading-tight">
          {day}
        </span>

        <span className="text-[10px] text-slate-400">
          {hr} {ampm}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-700 truncate">
          Dr. {appt.doctorName}
        </div>

        <div className="text-[11px] text-slate-400 truncate">
          {appt.doctorSpecialization}
        </div>

        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {appt.reason}
        </div>
      </div>

      <StatusBadge status={appt.status} />
    </div>
  );
};

const EmptyState = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
    <span className="text-3xl">{icon}</span>
    <span className="text-sm">{text}</span>
  </div>
);

const Dashboard = () => {
  const user: any = useSelector((state: any) => state.user);

  const profileId = user?.profileId;
  const userId = user?.id;

  const [patient, setPatient] = useState<PatientDTO | null>(null);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const visitsRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);

  const visitsChartRef = useRef<Chart | null>(null);
  const donutChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!profileId || !userId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const patRes: PatientDTO = await getPatient(profileId);
        setPatient(patRes);

        let apptRes: AppointmentDTO[] = [];

        try {
          apptRes = await getAppointmentsByPatient(userId);
        } catch {
          apptRes = [];
        }

        if (apptRes.length === 0 && profileId !== userId) {
          try {
            apptRes = await getAppointmentsByPatient(profileId);
          } catch {
            apptRes = [];
          }
        }

        const enriched: AppointmentDTO[] = await Promise.all(
          apptRes.map(async (appt) => {
            try {
              const doc: DoctorDTO = await getDoctor(appt.doctorId);

              return {
                ...appt,
                doctorName: doc.name,
                doctorSpecialization: doc.specialization,
              };
            } catch {
              return {
                ...appt,
                doctorName: "Unknown Doctor",
                doctorSpecialization: "",
              };
            }
          })
        );

        setAppointments(enriched);
      } catch (err: any) {
        setError("Failed to load dashboard data.");
        console.error("Patient dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [profileId, userId]);

  const today = new Date().toISOString().split("T")[0];

  const todayAppts = appointments.filter(
    (a) =>
      getDatePart(a.appointmentTime) === today &&
      a.status !== "CANCELLED"
  );

  const upcoming = appointments.filter(
    (a) =>
      new Date(a.appointmentTime) > new Date() &&
      a.status !== "CANCELLED"
  );

  const completed = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  const cancelled = appointments.filter(
    (a) => a.status === "CANCELLED"
  ).length;

  const visitsByMonth = Array(12).fill(0);

  appointments.forEach((a) => {
    if (!a.appointmentTime) return;
    visitsByMonth[new Date(a.appointmentTime).getMonth()]++;
  });

  const reasonMap: Record<string, number> = {};

  appointments.forEach((a) => {
    const r = a.reason || "General";
    reasonMap[r] = (reasonMap[r] || 0) + 1;
  });

  const reasonLabels = Object.keys(reasonMap);
  const reasonData = Object.values(reasonMap);

  const totalReasons = reasonData.reduce((a, b) => a + b, 0);

  const reasonColors = reasonLabels.map(
    (_, i) => REASON_COLORS[i % REASON_COLORS.length]
  );

  const upcomingSorted = [...upcoming]
    .sort(
      (a, b) =>
        new Date(a.appointmentTime).getTime() -
        new Date(b.appointmentTime).getTime()
    )
    .slice(0, 6);

  useEffect(() => {
    if (loading || !visitsRef.current) return;

    visitsChartRef.current?.destroy();

    visitsChartRef.current = new Chart(visitsRef.current, {
      type: "line",
      data: {
        labels: MONTHS,
        datasets: [
          {
            data: visitsByMonth,
            borderColor: "#0D9488",
            backgroundColor: "rgba(13,148,136,0.07)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#0D9488",
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              color: "#94A3B8",
            },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148,163,184,0.1)",
              drawTicks: false,
            },
            ticks: {
              font: { size: 10 },
              color: "#94A3B8",
              padding: 8,
            },
            border: { display: false },
          },
        },
      },
    });
  }, [loading, appointments]);

  useEffect(() => {
    if (loading || !donutRef.current || reasonLabels.length === 0) return;

    donutChartRef.current?.destroy();

    donutChartRef.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: reasonLabels,
        datasets: [
          {
            data: reasonData,
            backgroundColor: reasonColors,
            borderWidth: 4,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });
  }, [loading, appointments]);

  useEffect(() => {
    return () => {
      visitsChartRef.current?.destroy();
      donutChartRef.current?.destroy();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100" />

            <div
              className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"
            />
          </div>

          <p className="text-sm text-slate-400 font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">
            ⚠️
          </div>

          <p className="text-slate-600 font-medium mb-4">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bloodColor =
    BLOOD_COLORS[patient?.bloodGroup ?? ""] ?? "#94A3B8";

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-4 lg:p-6 flex flex-col gap-5 font-sans">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-500 to-blue-500 p-4 sm:p-6 lg:p-7">

        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 left-1/3 w-52 h-52 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          {/* LEFT */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            <div className="relative shrink-0">
              <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden border-[3px] border-white/30 shadow-lg bg-white/20 flex items-center justify-center">

                {patient?.profilePictureId ? (
                  <img
                    src={`http://localhost:9000/profile/files/${patient.profilePictureId}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {getInitials(patient?.name ?? "")}
                  </span>
                )}
              </div>

              <div
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg border-2 flex items-center justify-center text-[9px] font-bold text-white"
                style={{
                  background: bloodColor,
                  borderColor: "rgba(15,118,110,0.8)",
                }}
              >
                {formatBloodGroup(patient?.bloodGroup ?? "")}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">
                Welcome Back
              </div>

              <div className="text-2xl font-bold text-white mb-1 break-words">
                {patient?.name}
              </div>

              <div className="text-sm text-white/80 mb-3 break-words leading-relaxed">
                {calcAge(patient?.dob ?? "")} years old
                <span className="mx-2 text-white/40">·</span>
                {patient?.phoneNo}
                <span className="mx-2 text-white/40">·</span>
                {patient?.address}
              </div>

              <div className="flex flex-wrap gap-2">
                {parseListField(patient?.chronicDisease).map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-medium px-3 py-1 rounded-md border border-white/20 bg-white/10 text-white"
                  >
                    🫀 {item}
                  </span>
                ))}

                {parseListField(patient?.allergies).map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-medium px-3 py-1 rounded-md border border-yellow-300/30 bg-yellow-300/20 text-white"
                  >
                    ⚠️ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT STATS */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 w-full xl:w-auto">
            {[
              { val: appointments.length, lbl: "Total Visits" },
              { val: upcoming.length, lbl: "Upcoming" },
              { val: completed, lbl: "Completed" },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="min-w-[90px] px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-center"
              >
                <div className="text-3xl font-bold text-white leading-none">
                  {val}
                </div>

                <div className="text-[10px] mt-1 text-white/60 font-semibold uppercase tracking-wider">
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STAT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Visits"
          value={appointments.length}
          iconClass="ti-building-hospital"
          iconBg="#E0F7F6"
          valueColor="#0D9488"
        />

        <StatCard
          label="Upcoming"
          value={upcoming.length}
          iconClass="ti-calendar-event"
          iconBg="#EFF6FF"
          valueColor="#2563EB"
        />

        <StatCard
          label="Completed"
          value={completed}
          iconClass="ti-circle-check"
          iconBg="#ECFDF5"
          valueColor="#10B981"
        />

        <StatCard
          label="Cancelled"
          value={cancelled}
          iconClass="ti-circle-x"
          iconBg="#FEF2F2"
          valueColor="#EF4444"
        />
      </div>

      {/* CHART GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* LINE CHART */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-5 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Visits
              </div>

              <div className="text-sm text-slate-500 mt-1">
                {new Date().getFullYear()} Overview
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-teal-600 leading-none">
                {appointments.length}
              </div>

              <div className="text-[11px] text-slate-400">
                total
              </div>
            </div>
          </div>

          <div className="relative h-[220px] sm:h-[260px]">
            <canvas ref={visitsRef} />
          </div>
        </div>

        {/* DONUT */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Visit Reason Distribution
            </div>
          </div>

          {reasonLabels.length === 0 ? (
            <EmptyState icon="📊" text="No visit data yet" />
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">

              <div className="relative w-[180px] h-[180px] shrink-0">
                <canvas ref={donutRef} />

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-700 leading-none">
                    {totalReasons}
                  </span>

                  <span className="text-xs text-slate-400">
                    visits
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {reasonLabels.map((label, i) => {
                  const pct = Math.round(
                    (reasonData[i] / totalReasons) * 100
                  );

                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background: reasonColors[i],
                          }}
                        />

                        <span className="text-sm text-slate-600 truncate">
                          {label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: reasonColors[i],
                            }}
                          />
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 w-7 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* APPOINTMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* UPCOMING */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Appointments
            </div>

            <div className="text-[11px] font-semibold px-3 py-1 rounded-md bg-teal-100 text-teal-700">
              {upcoming.length} upcoming
            </div>
          </div>

          {appointments.length === 0 ? (
            <EmptyState icon="🗓️" text="No appointments found" />
          ) : (
            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
              {(upcomingSorted.length > 0
                ? upcomingSorted
                : appointments.slice(0, 6)
              ).map((a) => (
                <AppointmentCard key={a.id} appt={a} />
              ))}
            </div>
          )}
        </div>

        {/* TODAY */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Today's Visits
            </div>

            <div className="text-[11px] font-semibold px-3 py-1 rounded-md bg-blue-100 text-blue-700">
              {todayAppts.length} scheduled
            </div>
          </div>

          {todayAppts.length === 0 ? (
            <EmptyState icon="🗓️" text="No visits scheduled today" />
          ) : (
            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">

              {todayAppts.map((a) => {
                const { hr, ampm } = formatTime(a.appointmentTime);

                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 transition-all"
                  >
                    <div className="flex flex-col items-center min-w-[52px] bg-white border border-slate-100 rounded-xl px-2 py-2 shrink-0 shadow-sm">
                      <span className="text-sm font-bold text-teal-600 leading-tight">
                        {hr}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {ampm}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">
                        Dr. {a.doctorName}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate">
                        {a.reason}
                      </div>
                    </div>

                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AIChatBot />
    </div>
  );
};

export default Dashboard;