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
  COMPLETED:  { bg: "#ECFDF5", color: "#065F46", dot: "#10B981" },
  CANCELLED:  { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444" },
  PENDING:    { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B" },
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
    } catch { /* fall through */ }
  }
  return trimmed ? [trimmed] : [];
};

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "PT";


const S = {
  // layout
  page: {
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "18px",
    minHeight: "100vh",
    background: "#F0F4F8",
    fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
  } as React.CSSProperties,

  // hero
  hero: {
    background: "linear-gradient(135deg,#0F766E 0%,#0EA5A0 45%,#3B82F6 100%)",
    borderRadius: "22px",
    padding: "28px",
    position: "relative" as const,
    overflow: "hidden",
  } as React.CSSProperties,
  heroInner: {
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: "20px",
  } as React.CSSProperties,
  heroLeft: { display: "flex", alignItems: "center", gap: "18px" } as React.CSSProperties,
  heroStats: { display: "flex", gap: "10px", flexWrap: "wrap" as const } as React.CSSProperties,
  hstat: {
    minWidth: "88px",
    padding: "14px 20px",
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "16px",
    textAlign: "center" as const,
  } as React.CSSProperties,
  hstatVal: { fontSize: "26px", fontWeight: 700, color: "#fff", lineHeight: 1 } as React.CSSProperties,
  hstatLbl: { fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginTop: "3px", textTransform: "uppercase" as const, letterSpacing: "0.07em" } as React.CSSProperties,

  // stat grid — guaranteed 4-column
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  } as React.CSSProperties,

  // 2-column grid
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  } as React.CSSProperties,

  // stat card
  scard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    border: "1px solid #F1F5F9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  } as React.CSSProperties,

  // panel
  panel: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #F1F5F9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)",
    padding: "22px",
  } as React.CSSProperties,
  panelTitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#94A3B8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  } as React.CSSProperties,
  panelHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  } as React.CSSProperties,
};

const StatCard = ({
  label, value, iconClass, iconBg, valueColor,
}: {
  label: string; value: number | string;
  iconClass: string; iconBg: string; valueColor: string;
}) => (
  <div style={S.scard}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)";
    }}
  >
    <div style={{
      width: 46, height: 46, borderRadius: 12,
      background: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
    }}>
      <i className={`ti ${iconClass}`} aria-hidden="true" />
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_STYLE[status] ?? { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600,
      padding: "4px 8px", borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
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
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 10,
      border: "1px solid #F1F5F9", background: "#F8FAFC",
      transition: "background 0.18s, border-color 0.18s", cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = "#E0F7F6";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#B2E8E6";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#F1F5F9";
      }}
    >
      {/* Time box */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        minWidth: 50, background: "#fff",
        border: "1px solid #F1F5F9", borderRadius: 9,
        padding: "6px 8px", flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>{mon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0D9488", lineHeight: 1.2 }}>{day}</span>
        <span style={{ fontSize: 10, color: "#94A3B8" }}>{hr} {ampm}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          Dr. {appt.doctorName}
        </div>
        <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {appt.doctorSpecialization}
        </div>
        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {appt.reason}
        </div>
      </div>

      <StatusBadge status={appt.status} />
    </div>
  );
};

const EmptyState = ({ icon, text }: { icon: string; text: string }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 6, color: "#94A3B8" }}>
    <span style={{ fontSize: 28 }}>{icon}</span>
    <span style={{ fontSize: 13 }}>{text}</span>
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
  const donutRef  = useRef<HTMLCanvasElement>(null);
  const visitsChartRef = useRef<Chart | null>(null);
  const donutChartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!profileId || !userId) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const patRes: PatientDTO = await getPatient(profileId);
        setPatient(patRes);

        let apptRes: AppointmentDTO[] = [];
        try { apptRes = await getAppointmentsByPatient(userId); } catch { apptRes = []; }
        if (apptRes.length === 0 && profileId !== userId) {
          try { apptRes = await getAppointmentsByPatient(profileId); } catch { apptRes = []; }
        }

        const enriched: AppointmentDTO[] = await Promise.all(
          apptRes.map(async (appt) => {
            try {
              const doc: DoctorDTO = await getDoctor(appt.doctorId);
              return { ...appt, doctorName: doc.name, doctorSpecialization: doc.specialization };
            } catch {
              return { ...appt, doctorName: "Unknown Doctor", doctorSpecialization: "" };
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

  const today       = new Date().toISOString().split("T")[0];
  const todayAppts  = appointments.filter((a) => getDatePart(a.appointmentTime) === today && a.status !== "CANCELLED");
  const upcoming    = appointments.filter((a) => new Date(a.appointmentTime) > new Date() && a.status !== "CANCELLED");
  const completed   = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelled   = appointments.filter((a) => a.status === "CANCELLED").length;

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
  const reasonData   = Object.values(reasonMap);
  const totalReasons = reasonData.reduce((a, b) => a + b, 0);
  const reasonColors = reasonLabels.map((_, i) => REASON_COLORS[i % REASON_COLORS.length]);

  const upcomingSorted = [...upcoming]
    .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
    .slice(0, 6);

  useEffect(() => {
    if (loading || !visitsRef.current) return;
    visitsChartRef.current?.destroy();
    visitsChartRef.current = new Chart(visitsRef.current, {
      type: "line",
      data: {
        labels: MONTHS,
        datasets: [{
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
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#94A3B8" }, border: { display: false } },
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.1)", drawTicks: false }, ticks: { font: { size: 10 }, color: "#94A3B8", padding: 8 }, border: { display: false } },
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
        datasets: [{
          data: reasonData,
          backgroundColor: reasonColors,
          borderWidth: 4,
          borderColor: "#ffffff",
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
        },
      },
    });
  }, [loading, appointments]);

  useEffect(() => () => {
    visitsChartRef.current?.destroy();
    donutChartRef.current?.destroy();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: 52, height: 52, margin: "0 auto 12px" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid #CCFBF1" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid #0D9488", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Loading your dashboard…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 12px", background: "#FEF2F2", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚠️</div>
          <p style={{ color: "#475569", fontWeight: 500, marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", background: "#0D9488", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bloodColor = BLOOD_COLORS[patient?.bloodGroup ?? ""] ?? "#94A3B8";

  return (
    <div style={S.page}>

      <div style={S.hero}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: "38%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={S.heroInner}>
          {/* Left: avatar + info */}
          <div style={S.heroLeft}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden", border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {patient?.profilePictureId ? (
                  <img
                    src={`http://localhost:9000/profile/files/${patient.profilePictureId}`}
                    alt="profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{getInitials(patient?.name ?? "")}</span>
                )}
              </div>
              {/* Blood group badge */}
              <div style={{
                position: "absolute", bottom: -8, right: -8,
                width: 28, height: 28, borderRadius: 8,
                background: bloodColor, border: "2.5px solid rgba(15,118,110,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff",
              }}>
                {formatBloodGroup(patient?.bloodGroup ?? "")}
              </div>
            </div>

            {/* Name / details */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Welcome Back</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{patient?.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>
                {calcAge(patient?.dob ?? "")} years old
                <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.4)" }}>·</span>
                {patient?.phoneNo}
                <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.4)" }}>·</span>
                {patient?.address}
              </div>
              {/* Health tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {parseListField(patient?.chronicDisease).map((item) => (
                  <span key={item} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}>
                    🫀 {item}
                  </span>
                ))}
                {parseListField(patient?.allergies).map((item) => (
                  <span key={item} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(251,191,36,0.35)", background: "rgba(251,191,36,0.18)", color: "rgba(255,255,255,0.9)" }}>
                    ⚠️ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: summary stat boxes */}
          <div style={S.heroStats}>
            {[
              { val: appointments.length, lbl: "Total Visits" },
              { val: upcoming.length,     lbl: "Upcoming" },
              { val: completed,           lbl: "Completed" },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={S.hstat}>
                <div style={S.hstatVal}>{val}</div>
                <div style={S.hstatLbl}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.statGrid}>
        <StatCard label="Total Visits" value={appointments.length} iconClass="ti-building-hospital" iconBg="#E0F7F6" valueColor="#0D9488" />
        <StatCard label="Upcoming"     value={upcoming.length}     iconClass="ti-calendar-event"   iconBg="#EFF6FF" valueColor="#2563EB" />
        <StatCard label="Completed"    value={completed}            iconClass="ti-circle-check"     iconBg="#ECFDF5" valueColor="#10B981" />
        <StatCard label="Cancelled"    value={cancelled}            iconClass="ti-circle-x"         iconBg="#FEF2F2" valueColor="#EF4444" />
      </div>

      <div style={S.grid2}>

        {/* Visits line chart */}
        <div style={S.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={S.panelTitle}>Monthly Visits</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{new Date().getFullYear()} Overview</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0D9488", lineHeight: 1 }}>{appointments.length}</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>total</div>
            </div>
          </div>
          <div style={{ position: "relative", height: 140 }}>
            <canvas ref={visitsRef} aria-label="Monthly visits chart" />
          </div>
        </div>

        {/* Reason donut */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <div style={S.panelTitle}>Visit Reason Distribution</div>
          </div>
          {reasonLabels.length === 0 ? (
            <EmptyState icon="📊" text="No visit data yet" />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Donut */}
              <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                <canvas ref={donutRef} aria-label="Reason distribution chart" />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#334155", lineHeight: 1 }}>{totalReasons}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>visits</span>
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {reasonLabels.map((label, i) => {
                  const pct = Math.round((reasonData[i] / totalReasons) * 100);
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: reasonColors[i], flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 56, height: 5, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: reasonColors[i] }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", width: 28, textAlign: "right" }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={S.grid2}>

        {/* Upcoming appointments */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <div style={S.panelTitle}>Appointments</div>
            <div style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: "#E0F7F6", color: "#0c7a76" }}>
              {upcoming.length} upcoming
            </div>
          </div>
          {appointments.length === 0 ? (
            <EmptyState icon="🗓️" text="No appointments found" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
              {(upcomingSorted.length > 0 ? upcomingSorted : appointments.slice(0, 6)).map((a) => (
                <AppointmentCard key={a.id} appt={a} />
              ))}
            </div>
          )}
        </div>

        {/* Today's visits */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <div style={S.panelTitle}>Today's Visits</div>
            <div style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: "#EFF6FF", color: "#1D4ED8" }}>
              {todayAppts.length} scheduled
            </div>
          </div>
          {todayAppts.length === 0 ? (
            <EmptyState icon="🗓️" text="No visits scheduled today" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
              {todayAppts.map((a) => {
                const { hr, ampm } = formatTime(a.appointmentTime);
                return (
                  <div
                    key={a.id}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid #F1F5F9", background: "#F8FAFC", transition: "background 0.18s, border-color 0.18s", cursor: "default" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#E0F7F6"; (e.currentTarget as HTMLDivElement).style.borderColor = "#B2E8E6"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"; (e.currentTarget as HTMLDivElement).style.borderColor = "#F1F5F9"; }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 50, background: "#fff", border: "1px solid #F1F5F9", borderRadius: 9, padding: "6px 8px", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0D9488", lineHeight: 1.2 }}>{hr}</span>
                      <span style={{ fontSize: 10, color: "#94A3B8" }}>{ampm}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Dr. {a.doctorName}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.reason}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
          <AIChatBot/>
    </div>
  );
};

export default Dashboard;