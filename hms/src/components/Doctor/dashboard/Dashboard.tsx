import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
    Chart,
    LineController, LineElement, PointElement,
    LinearScale, CategoryScale, Filler,
    DoughnutController, ArcElement, Tooltip,
} from "chart.js";
import { getAppointmentsByDoctor } from "../../../service/AppointmentService";
import { getDoctor } from "../../../service/DoctorProfileService";
import { getPatient } from "../../../service/PatientProfileService";

Chart.register(
    LineController, LineElement, PointElement,
    LinearScale, CategoryScale, Filler,
    DoughnutController, ArcElement, Tooltip
);

//Types
interface DoctorDTO {
    id: number;
    name: string;
    email: string;
    dob: string;
    profilePictureId: number;
    phoneNo: string;
    address: string;
    licenseNumber: string;
    specialization: string;
    department: string;
    totalExperience: number;
}

interface PatientDTO {
    id: number;
    name: string;
    email: string;
    dob: string;
    phoneNo: string;
    address: string;
    aadharId: string;
    bloodGroup: string;
    allergies: string;
    chronicDisease: string;
}

interface AppointmentDTO {
    id: number;
    patientId: number;
    doctorId: number;
    appointmentTime: string;
    status: string;
    reason: string;
    notes: string;
    patientName?: string;
    patientEmail?: string;
    bloodGroup?: string;
    address?: string;
}

// Constants
const REASON_COLORS = ["#2563EB", "#0D9488", "#D97706", "#DC2626", "#7C3AED", "#EC4899"];

const STATUS_CONFIG: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    SCHEDULED: { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE", dot: "#6366F1" },
    COMPLETED: { bg: "#F0FDF9", color: "#0F6E56", border: "#99F6E4", dot: "#0D9488" },
    CANCELLED: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA", dot: "#EF4444" },
    PENDING: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", dot: "#F59E0B" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BLOOD_COLORS: Record<string, string> = {
    "A_POSITIVE": "#DC2626", "A_NEGATIVE": "#F87171", "B_POSITIVE": "#2563EB", "B_NEGATIVE": "#818CF8",
    "O_POSITIVE": "#0D9488", "O_NEGATIVE": "#34D399", "AB_POSITIVE": "#D97706", "AB_NEGATIVE": "#FCD34D",
};

//Helpers
const formatTime = (t: string) => {
    if (!t) return { hr: "—", ampm: "" };
    const d = new Date(t);
    const h = d.getHours(), m = d.getMinutes().toString().padStart(2, "0");
    return { hr: `${h % 12 || 12}:${m}`, ampm: h >= 12 ? "PM" : "AM" };
};

const getDatePart = (t: string) => t ? new Date(t).toISOString().split("T")[0] : "";

const formatBloodGroup = (bg: string) =>
    bg ? bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "−") : "—";

const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "DR";

//Inline style helpers
const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    border: "0.5px solid #E8EDF2",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    padding: "20px 22px",
};

//Stat Card 
const StatCard = ({
    label, value, icon, accent, bg,
}: {
    label: string; value: number;
    icon: string; accent: string; bg: string;
}) => {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                ...card,
                display: "flex", alignItems: "center", gap: 14,
                transition: "box-shadow .18s, transform .18s",
                boxShadow: hov ? "0 6px 20px rgba(0,0,0,0.08)" : card.boxShadow as string,
                transform: hov ? "translateY(-2px)" : "none",
                cursor: "default",
            }}
        >
            <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: bg, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
            }}>
                <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 20, color: accent }} />
            </div>
            <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                    {label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</p>
            </div>
        </div>
    );
};

//Today Appointment Row
const ApptRow = ({ a }: { a: AppointmentDTO }) => {
    const [hov, setHov] = useState(false);
    const cfg = STATUS_CONFIG[a.status] ?? { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0", dot: "#94A3B8" };
    const { hr, ampm } = formatTime(a.appointmentTime);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                background: hov ? "#F8FAFC" : "transparent",
                border: `0.5px solid ${hov ? "#E2E8F0" : "transparent"}`,
                transition: "background .15s, border .15s",
                cursor: "default",
            }}
        >
            {/* Time */}
            <div style={{
                minWidth: 52, background: "#F8FAFC", border: "0.5px solid #E8EDF2",
                borderRadius: 10, padding: "6px 8px", textAlign: "center", flexShrink: 0,
            }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", lineHeight: 1.2 }}>{hr}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{ampm}</div>
            </div>

            {/* Avatar + name */}
            <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#EFF6FF", color: "#2563EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
                {getInitials(a.patientName ?? "")}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.patientName}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.reason}
                </div>
            </div>

            {/* Status badge */}
            <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: cfg.bg, border: `0.5px solid ${cfg.border}`,
                borderRadius: 8, padding: "4px 10px", flexShrink: 0,
            }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{a.status}</span>
            </div>
        </div>
    );
};

//Patient Card 
const PatientCard = ({ p }: { p: AppointmentDTO }) => {
    const [hov, setHov] = useState(false);
    const bgColor = BLOOD_COLORS[p.bloodGroup ?? ""] ?? "#94A3B8";
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 12,
                border: `0.5px solid ${hov ? "#BFDBFE" : "#E8EDF2"}`,
                background: hov ? "#EFF6FF" : "#fff",
                transition: "background .15s, border .15s",
                cursor: "default",
            }}
        >
            <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: hov ? "#DBEAFE" : "#F1F5F9",
                color: hov ? "#2563EB" : "#475569",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                transition: "background .15s, color .15s",
            }}>
                {getInitials(p.patientName ?? "")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: hov ? "#1D4ED8" : "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color .15s" }}>
                    {p.patientName}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.patientEmail}
                </div>
                {p.address && (
                    <div style={{ fontSize: 10, color: "#CBD5E1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.address}
                    </div>
                )}
            </div>
            <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: bgColor, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                boxShadow: `0 2px 8px ${bgColor}55`,
            }}>
                {formatBloodGroup(p.bloodGroup ?? "")}
            </div>
        </div>
    );
};

//Main Dashboard
const Dashboard = () => {
    const user: any = useSelector((state: any) => state.user);
    const profileId = user?.profileId;
    const userId = user?.id;

    const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
    const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apptRef = useRef<HTMLCanvasElement>(null);
    const patRef = useRef<HTMLCanvasElement>(null);
    const donutRef = useRef<HTMLCanvasElement>(null);

    const apptChartRef = useRef<Chart | null>(null);
    const patChartRef = useRef<Chart | null>(null);
    const donutChartRef = useRef<Chart | null>(null);

    //Fetch 
    useEffect(() => {
        if (!profileId || !userId) return;
        const fetchAll = async () => {
            try {
                setLoading(true); setError(null);
                const docRes: DoctorDTO = await getDoctor(profileId);
                setDoctor(docRes);
                const apptRes: AppointmentDTO[] = await getAppointmentsByDoctor(profileId);
                const enriched = await Promise.all(apptRes.map(async (appt) => {
                    try {
                        const patient: PatientDTO = await getPatient(appt.patientId);
                        return { ...appt, patientName: patient.name, patientEmail: patient.email, bloodGroup: patient.bloodGroup, address: patient.address };
                    } catch { return { ...appt, patientName: "Unknown", patientEmail: "" }; }
                }));
                setAppointments(enriched);
            } catch (err: any) {
                setError("Failed to load dashboard data.");
                console.error(err);
            } finally { setLoading(false); }
        };
        fetchAll();
    }, [profileId, userId]);

    //Derived 
    const today = new Date().toISOString().split("T")[0];
    const todayAppts = appointments.filter(a => getDatePart(a.appointmentTime) === today && a.status !== "CANCELLED");
    const totalPatients = new Set(appointments.map(a => a.patientId)).size;
    const pending = appointments.filter(a => a.status === "PENDING").length;
    const critical = appointments.filter(a => a.reason?.toLowerCase().includes("emergency")).length;

    const apptByMonth = Array(12).fill(0);
    const patByMonth: Record<number, Set<any>> = {};
    MONTHS.forEach((_, i) => (patByMonth[i] = new Set()));
    appointments.forEach(a => {
        if (!a.appointmentTime) return;
        const m = new Date(a.appointmentTime).getMonth();
        apptByMonth[m]++;
        patByMonth[m].add(a.patientId);
    });
    const patCountByMonth = Object.values(patByMonth).map(s => s.size);

    const reasonMap: Record<string, number> = {};
    appointments.forEach(a => { const r = a.reason || "Consult"; reasonMap[r] = (reasonMap[r] || 0) + 1; });
    const reasonLabels = Object.keys(reasonMap);
    const reasonData = Object.values(reasonMap);
    const totalReasons = reasonData.reduce((a, b) => a + b, 0);
    const reasonColors = reasonLabels.map((_, i) => REASON_COLORS[i % REASON_COLORS.length]);

    const patientMap = new Map<any, AppointmentDTO>();
    appointments.forEach(a => { if (!patientMap.has(a.patientId)) patientMap.set(a.patientId, a); });
    const patientList = Array.from(patientMap.values()).slice(0, 6);

    // Chart line options
    const lineOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index" as const, intersect: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#94A3B8" }, border: { display: false } },
            y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.1)", drawTicks: false }, ticks: { font: { size: 10 }, color: "#94A3B8", padding: 8 }, border: { display: false } },
        },
    };

    useEffect(() => {
        if (loading || !apptRef.current) return;
        apptChartRef.current?.destroy();
        apptChartRef.current = new Chart(apptRef.current, {
            type: "line",
            data: { labels: MONTHS, datasets: [{ data: apptByMonth, borderColor: "#2563EB", backgroundColor: "rgba(37,99,235,0.06)", borderWidth: 2.5, fill: true, tension: 0.45, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: "#2563EB", pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2 }] },
            options: lineOptions,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, appointments]);

    useEffect(() => {
        if (loading || !patRef.current) return;
        patChartRef.current?.destroy();
        patChartRef.current = new Chart(patRef.current, {
            type: "line",
            data: { labels: MONTHS, datasets: [{ data: patCountByMonth, borderColor: "#0D9488", backgroundColor: "rgba(13,148,136,0.06)", borderWidth: 2.5, fill: true, tension: 0.45, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: "#0D9488", pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2 }] },
            options: lineOptions,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, appointments]);

    useEffect(() => {
        if (loading || !donutRef.current || reasonLabels.length === 0) return;
        donutChartRef.current?.destroy();
        donutChartRef.current = new Chart(donutRef.current, {
            type: "doughnut",
            data: { labels: reasonLabels, datasets: [{ data: reasonData, backgroundColor: reasonColors, borderWidth: 4, borderColor: "#ffffff", hoverOffset: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: "74%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } } } },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, appointments]);

    useEffect(() => () => {
        apptChartRef.current?.destroy();
        patChartRef.current?.destroy();
        donutChartRef.current?.destroy();
    }, []);

    //Loading 
    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 48, height: 48, margin: "0 auto 16px" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #E0F2FE" }} />
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #2563EB", borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
                </div>
                <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Loading dashboard…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </div>
    );

    // Error
    if (error) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ textAlign: "center", maxWidth: 320 }}>
                <div style={{ width: 56, height: 56, background: "#FEF2F2", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>⚠️</div>
                <p style={{ color: "#475569", fontWeight: 500, marginBottom: 16 }}>{error}</p>
                <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Retry
                </button>
            </div>
        </div>
    );

    //Render
    return (
        <div style={{ padding: "20px 24px", fontFamily: "'DM Sans','Inter',system-ui,sans-serif", background: "#F0F4F8", minHeight: "100vh", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Hero Card */}
            <div style={{
                borderRadius: 20, overflow: "hidden", position: "relative",
                background: "linear-gradient(135deg, #0F6E56 0%, #1D9E75 45%, #2563EB 100%)",
                boxShadow: "0 8px 32px rgba(15,110,86,0.18)",
            }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -50, left: "35%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

                <div style={{ position: "relative", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                    {/* Doctor info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            
                            <div style={{ width: 64, height: 64, borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {doctor?.profilePictureId ? (
                                    <img
                                        src={`http://localhost:9000/profile/files/${doctor.profilePictureId}`}
                                        alt="profile"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                                        {getInitials(doctor?.name ?? "")}
                                    </span>
                                )}
                            </div>
                            <div style={{
                                position: "absolute", bottom: -2, right: -2,
                                width: 14, height: 14, borderRadius: "50%",
                                background: "#4ADE80", border: "2px solid #0F6E56",
                            }} title="Online" />
                        </div>

                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>
                                Welcome back
                            </p>
                            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px", lineHeight: 1.2 }}>
                                Dr. {doctor?.name}
                            </h1>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "0 0 8px" }}>
                                {doctor?.specialization}
                                <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
                                {doctor?.department}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.45)", display: "inline-block" }} />
                                    {doctor?.totalExperience} yrs experience
                                </span>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                                    {doctor?.phoneNo}
                                </span>
                                <span style={{
                                    fontSize: 11, fontWeight: 600, color: "#fff",
                                    background: "rgba(255,255,255,0.15)", border: "0.5px solid rgba(255,255,255,0.25)",
                                    borderRadius: 7, padding: "3px 10px",
                                }}>
                                    {doctor?.licenseNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary badges */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            { val: appointments.length, lbl: "Total appts" },
                            { val: totalPatients, lbl: "Patients" },
                            { val: todayAppts.length, lbl: "Today" },
                        ].map(({ val, lbl }) => (
                            <div key={lbl} style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)",
                                borderRadius: 14, padding: "14px 22px", minWidth: 80,
                            }}>
                                <span style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{val}</span>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
                <StatCard label="Today's Appointments" value={todayAppts.length} icon="ti-calendar-event" accent="#2563EB" bg="#EFF6FF" />
                <StatCard label="Pending" value={pending} icon="ti-clock-pause" accent="#D97706" bg="#FFFBEB" />
                <StatCard label="Total Patients" value={totalPatients} icon="ti-users" accent="#0D9488" bg="#F0FDF9" />
                <StatCard label="Critical Cases" value={critical} icon="ti-urgent" accent="#DC2626" bg="#FEF2F2" />
            </div>

            {/* ── Charts Row  */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Appointments chart */}
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Appointments</p>
                            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{new Date().getFullYear()} overview</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 26, fontWeight: 700, color: "#2563EB", lineHeight: 1 }}>{appointments.length}</span>
                            <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>total</p>
                        </div>
                    </div>
                    <div style={{ position: "relative", height: 140 }}>
                        <canvas ref={apptRef} aria-label="Monthly appointments chart" />
                    </div>
                </div>

                {/* Patients chart */}
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Unique Patients</p>
                            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{new Date().getFullYear()} overview</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: 26, fontWeight: 700, color: "#0D9488", lineHeight: 1 }}>{totalPatients}</span>
                            <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>unique</p>
                        </div>
                    </div>
                    <div style={{ position: "relative", height: 140 }}>
                        <canvas ref={patRef} aria-label="Monthly patients chart" />
                    </div>
                </div>
            </div>

            {/* Donut + Today Schedule  */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Reason distribution */}
                <div style={card}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 18 }}>
                        Visit Reason Distribution
                    </p>

                    {reasonLabels.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: "#94A3B8" }}>
                            <span style={{ fontSize: 28 }}>📊</span>
                            <p style={{ fontSize: 13, margin: 0 }}>No appointment data yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                            {/* Donut */}
                            <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                                <canvas ref={donutRef} aria-label="Reason distribution chart" />
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                    <span style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>{totalReasons}</span>
                                    <span style={{ fontSize: 11, color: "#94A3B8" }}>visits</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                                {reasonLabels.map((label, i) => {
                                    const pct = Math.round((reasonData[i] / totalReasons) * 100);
                                    return (
                                        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: reasonColors[i], flexShrink: 0 }} />
                                                <span style={{ fontSize: 12, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                                                <div style={{ width: 52, height: 4, borderRadius: 99, background: "#F1F5F9", overflow: "hidden" }}>
                                                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: reasonColors[i] }} />
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

                {/* Today's schedule */}
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                            Today's Schedule
                        </p>
                        <span style={{ fontSize: 11, fontWeight: 600, background: "#EFF6FF", color: "#2563EB", borderRadius: 7, padding: "3px 10px", border: "0.5px solid #BFDBFE" }}>
                            {todayAppts.length} appts
                        </span>
                    </div>

                    {todayAppts.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: "#94A3B8" }}>
                            <span style={{ fontSize: 28 }}>🗓️</span>
                            <p style={{ fontSize: 13, margin: 0 }}>No appointments today</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 240, overflowY: "auto", marginRight: -4, paddingRight: 4 }}>
                            {todayAppts.map(a => <ApptRow key={a.id} a={a} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Patients */}
            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                        Recent Patients
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 600, background: "#F0FDF9", color: "#0F6E56", borderRadius: 7, padding: "3px 10px", border: "0.5px solid #99F6E4" }}>
                        {totalPatients} total
                    </span>
                </div>

                {patientList.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: "#94A3B8" }}>
                        <span style={{ fontSize: 28 }}>👥</span>
                        <p style={{ fontSize: 13, margin: 0 }}>No patients found</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {patientList.map(p => <PatientCard key={p.patientId} p={p} />)}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Dashboard;