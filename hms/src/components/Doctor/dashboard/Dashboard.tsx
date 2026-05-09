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

// ── Types ────────────────────────────────────────────────────────────────
interface DoctorDTO {
    id: number;
    name: string;
    email: string;
    dob: string;
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

// ── Constants ────────────────────────────────────────────────────────────
const REASON_COLORS = ["#2563EB", "#0D9488", "#D97706", "#DC2626", "#7C3AED", "#EC4899"];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    SCHEDULED: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
    COMPLETED: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
    CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
    PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BLOOD_COLORS: Record<string, string> = {
    "A_POSITIVE": "#DC2626",
    "A_NEGATIVE": "#F87171",
    "B_POSITIVE": "#2563EB",
    "B_NEGATIVE": "#818CF8",
    "O_POSITIVE": "#0D9488",
    "O_NEGATIVE": "#34D399",
    "AB_POSITIVE": "#D97706",
    "AB_NEGATIVE": "#FCD34D",
};

// ── Helpers ──────────────────────────────────────────────────────────────
const formatTime = (t: string): { hr: string; ampm: string } => {
    if (!t) return { hr: "—", ampm: "" };
    const d = new Date(t);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return { hr: `${h12}:${m}`, ampm };
};

const getDatePart = (t: string): string => {
    if (!t) return "";
    return new Date(t).toISOString().split("T")[0];
};

const formatBloodGroup = (bg: string): string => {
    if (!bg) return "—";
    return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "−");
};

const getInitials = (name: string): string =>
    name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "DR";

// ── Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({
    label, value, colorClass, iconClass, dotColor,
}: {
    label: string;
    value: number;
    colorClass: string;
    iconClass: string;
    dotColor: string;
}) => (
    <div className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${dotColor}`}>
            <i className={`ti ${iconClass}`} aria-hidden="true" />
        </div>
        <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-bold leading-none ${colorClass}`}>{value}</p>
        </div>
    </div>
);

// ── Component ────────────────────────────────────────────────────────────
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

    // ── Fetch ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!profileId || !userId) return;

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                const docRes: DoctorDTO = await getDoctor(profileId);
                setDoctor(docRes);

                const apptRes: AppointmentDTO[] = await getAppointmentsByDoctor(userId);

                const enriched: AppointmentDTO[] = await Promise.all(
                    apptRes.map(async (appt) => {
                        try {
                            const patient: PatientDTO = await getPatient(appt.patientId);
                            return {
                                ...appt,
                                patientName: patient.name,
                                patientEmail: patient.email,
                                bloodGroup: patient.bloodGroup,
                                address: patient.address,
                            };
                        } catch {
                            return { ...appt, patientName: "Unknown", patientEmail: "" };
                        }
                    })
                );

                setAppointments(enriched);
            } catch (err: any) {
                setError("Failed to load dashboard data.");
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [profileId, userId]);

    // ── Derived ────────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const todayAppts = appointments.filter((a) => getDatePart(a.appointmentTime) === today && a.status !== "CANCELLED");
    const totalPatients = new Set(appointments.map((a) => a.patientId)).size;
    const pending = appointments.filter((a) => a.status === "PENDING").length;
    const critical = appointments.filter((a) => a.reason?.toLowerCase().includes("emergency")).length;

    const apptByMonth = Array(12).fill(0);
    const patByMonth: Record<number, Set<any>> = {};
    MONTHS.forEach((_, i) => (patByMonth[i] = new Set()));

    appointments.forEach((a) => {
        if (!a.appointmentTime) return;
        const m = new Date(a.appointmentTime).getMonth();
        apptByMonth[m]++;
        patByMonth[m].add(a.patientId);
    });

    const patCountByMonth = Object.values(patByMonth).map((s) => s.size);

    const reasonMap: Record<string, number> = {};
    appointments.forEach((a) => {
        const r = a.reason || "Consult";
        reasonMap[r] = (reasonMap[r] || 0) + 1;
    });
    const reasonLabels = Object.keys(reasonMap);
    const reasonData = Object.values(reasonMap);
    const totalReasons = reasonData.reduce((a, b) => a + b, 0);
    const reasonColors = reasonLabels.map((_, i) => REASON_COLORS[i % REASON_COLORS.length]);

    const patientMap = new Map<any, AppointmentDTO>();
    appointments.forEach((a) => {
        if (!patientMap.has(a.patientId)) patientMap.set(a.patientId, a);
    });
    const patientList = Array.from(patientMap.values()).slice(0, 6);

    // ── Chart options factory ──────────────────────────────────────
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index" as const, intersect: false } },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, family: "inherit" }, color: "#94A3B8" },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(148,163,184,0.1)", drawTicks: false },
                ticks: { font: { size: 10, family: "inherit" }, color: "#94A3B8", padding: 8 },
                border: { display: false },
            },
        },
    };

    // ── Appointments chart ─────────────────────────────────────────
    useEffect(() => {
        if (loading || !apptRef.current) return;
        apptChartRef.current?.destroy();
        apptChartRef.current = new Chart(apptRef.current, {
            type: "line",
            data: {
                labels: MONTHS,
                datasets: [{
                    data: apptByMonth,
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37,99,235,0.07)",
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.45,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#2563EB",
                    pointHoverBorderColor: "#fff",
                    pointHoverBorderWidth: 2,
                }],
            },
            options: lineOptions,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, appointments]);

    // ── Patients chart ─────────────────────────────────────────────
    useEffect(() => {
        if (loading || !patRef.current) return;
        patChartRef.current?.destroy();
        patChartRef.current = new Chart(patRef.current, {
            type: "line",
            data: {
                labels: MONTHS,
                datasets: [{
                    data: patCountByMonth,
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
            options: lineOptions,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, appointments]);

    // ── Donut chart ────────────────────────────────────────────────
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, appointments]);

    // ── Cleanup ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            apptChartRef.current?.destroy();
            patChartRef.current?.destroy();
            donutChartRef.current?.destroy();
        };
    }, []);

    // ── Loading ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-4">
                    <div className="relative w-14 h-14 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
                    <p className="text-slate-600 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="p-5 space-y-5  min-h-screen">

            {/* ── Hero Header ──────────────────────────────────────── */}
            <div className="relative bg-blue-500 rounded-3xl overflow-hidden shadow-lg shadow-blue-200/50">
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-16 left-[38%] w-48 h-48 rounded-full bg-white/[0.04] pointer-events-none" />

                <div className="relative p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    {/* Doctor info */}
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-[68px] h-[68px] rounded-[16px] bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {getInitials(doctor?.name ?? "")}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-[14px] h-[14px] bg-teal-400 rounded-full border-2 border-blue-600" title="Online" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">Welcome Back</p>
                            <h1 className="text-[22px] font-bold text-white leading-tight">Dr. {doctor?.name}</h1>
                            <p className="text-[13px] text-white/75">
                                {doctor?.specialization}
                                <span className="mx-2 text-white/40">·</span>
                                {doctor?.department}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <span className="flex items-center gap-1.5 text-[12px] text-white/70">
                                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                    {doctor?.totalExperience} yrs experience
                                </span>
                                <span className="flex items-center gap-1.5 text-[12px] text-white/70">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                                    {doctor?.phoneNo}
                                </span>
                                <span className="text-[11px] bg-white/15 border border-white/25 text-white font-semibold px-2.5 py-1 rounded-lg">
                                    {doctor?.licenseNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary badges */}
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { val: appointments.length, lbl: "Total Appts" },
                            { val: totalPatients, lbl: "Patients" },
                            { val: todayAppts.length, lbl: "Today" },
                        ].map(({ val, lbl }) => (
                            <div
                                key={lbl}
                                className="flex flex-col items-center justify-center bg-white/12 border border-white/20 rounded-2xl px-6 py-4 min-w-[90px] backdrop-blur-sm"
                            >
                                <span className="text-2xl font-bold text-white">{val}</span>
                                <span className="text-[11px] text-white/60 font-semibold mt-0.5 uppercase tracking-wide">{lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Today's Appointments" value={todayAppts.length} colorClass="text-blue-600" iconClass="ti-calendar-event" dotColor="bg-blue-50" />
                <StatCard label="Pending" value={pending} colorClass="text-amber-600" iconClass="ti-clock-pause" dotColor="bg-amber-50" />
                <StatCard label="Total Patients" value={totalPatients} colorClass="text-teal-600" iconClass="ti-users" dotColor="bg-teal-50" />
                <StatCard label="Critical Cases" value={critical} colorClass="text-red-600" iconClass="ti-urgent" dotColor="bg-red-50" />
            </div>

            {/* ── Charts Row ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Appointments chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Appointments</p>
                            <p className="text-[13px] text-slate-500">{new Date().getFullYear()} overview</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[28px] font-bold text-blue-600 leading-none">{appointments.length}</span>
                            <p className="text-[11px] text-slate-400">total</p>
                        </div>
                    </div>
                    <div className="relative h-40">
                        <canvas ref={apptRef} aria-label="Monthly appointments chart" />
                    </div>
                </div>

                {/* Patients chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Unique Patients</p>
                            <p className="text-[13px] text-slate-500">{new Date().getFullYear()} overview</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[28px] font-bold text-teal-600 leading-none">{totalPatients}</span>
                            <p className="text-[11px] text-slate-400">unique</p>
                        </div>
                    </div>
                    <div className="relative h-40">
                        <canvas ref={patRef} aria-label="Monthly patients chart" />
                    </div>
                </div>
            </div>

            {/* ── Donut + Today's Schedule ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Reason distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-5">Visit Reason Distribution</p>

                    {reasonLabels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                            <span className="text-3xl">📊</span>
                            <p className="text-sm">No appointment data yet</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            {/* Donut */}
                            <div className="relative w-[150px] h-[150px] flex-shrink-0">
                                <canvas ref={donutRef} aria-label="Reason distribution chart" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[22px] font-bold text-slate-700 leading-none">{totalReasons}</span>
                                    <span className="text-[11px] text-slate-400">total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-col gap-2.5 flex-1">
                                {reasonLabels.map((label, i) => {
                                    const pct = Math.round((reasonData[i] / totalReasons) * 100);
                                    return (
                                        <div key={label} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ background: reasonColors[i] }}
                                                />
                                                <span className="text-[13px] text-slate-600 truncate">{label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="w-14 h-[5px] rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${pct}%`, background: reasonColors[i] }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-500 w-7 text-right">{pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's schedule */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Today's Schedule</p>
                        <span className="text-[11px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">
                            {todayAppts.length} appts
                        </span>
                    </div>

                    {todayAppts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                            <span className="text-3xl">🗓️</span>
                            <p className="text-sm">No appointments scheduled today</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                            {todayAppts.map((a) => {
                                const cfg = STATUS_CONFIG[a.status] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
                                const { hr, ampm } = formatTime(a.appointmentTime);
                                return (
                                    <div
                                        key={a.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 hover:bg-blue-50 transition-colors border border-slate-100 hover:border-blue-100"
                                    >
                                        {/* Time box */}
                                        <div className="flex flex-col items-center min-w-[52px] bg-white rounded-lg px-2 py-1.5 border border-slate-100 shadow-sm flex-shrink-0">
                                            <span className="text-[12px] font-bold text-blue-600 leading-tight">{hr}</span>
                                            <span className="text-[10px] text-slate-400">{ampm}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-slate-700 truncate">{a.patientName}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{a.reason}</p>
                                        </div>

                                        {/* Status badge */}
                                        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                            {a.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Patient List ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Recent Patients</p>
                    <span className="text-[11px] bg-teal-50 text-teal-600 font-semibold px-2.5 py-1 rounded-lg">
                        {totalPatients} total
                    </span>
                </div>

                {patientList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                        <span className="text-3xl">👥</span>
                        <p className="text-sm">No patients found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {patientList.map((p) => {
                            const bgColor = BLOOD_COLORS[p.bloodGroup ?? ""] ?? "#94A3B8";
                            return (
                                <div
                                    key={p.patientId}
                                    className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer"
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[13px] flex-shrink-0 group-hover:bg-blue-200 group-hover:text-blue-700 transition-all">
                                        {getInitials(p.patientName ?? "")}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-700 truncate group-hover:text-blue-700 transition-colors">
                                            {p.patientName}
                                        </p>
                                        <p className="text-[11px] text-slate-400 truncate">{p.patientEmail}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{p.address}</p>
                                    </div>

                                    {/* Blood group */}
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm"
                                        style={{ background: bgColor }}
                                        title={`Blood Group: ${formatBloodGroup(p.bloodGroup ?? "")}`}
                                    >
                                        {formatBloodGroup(p.bloodGroup ?? "")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Dashboard;