import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { getAppointmentsByDoctor } from "../../../service/AppointmentService";
import { getDoctor } from "../../../service/DoctorProfileService";
import { getPatient } from "../../../service/PatientProfileService";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend
);

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

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const REASON_COLORS = [
    "#2563EB",
    "#0D9488",
    "#D97706",
    "#DC2626",
    "#7C3AED",
    "#EC4899",
];

const STATUS_CONFIG: Record<
    string,
    { bg: string; color: string; border: string; dot: string }
> = {
    SCHEDULED: {
        bg: "#EEF2FF",
        color: "#4338CA",
        border: "#C7D2FE",
        dot: "#6366F1",
    },
    COMPLETED: {
        bg: "#F0FDF9",
        color: "#0F6E56",
        border: "#99F6E4",
        dot: "#0D9488",
    },
    CANCELLED: {
        bg: "#FEF2F2",
        color: "#B91C1C",
        border: "#FECACA",
        dot: "#EF4444",
    },
    PENDING: {
        bg: "#FFFBEB",
        color: "#92400E",
        border: "#FDE68A",
        dot: "#F59E0B",
    },
};

const BLOOD_COLORS: Record<string, string> = {
    A_POSITIVE: "#DC2626",
    A_NEGATIVE: "#F87171",
    B_POSITIVE: "#2563EB",
    B_NEGATIVE: "#818CF8",
    O_POSITIVE: "#0D9488",
    O_NEGATIVE: "#34D399",
    AB_POSITIVE: "#D97706",
    AB_NEGATIVE: "#FCD34D",
};

const getInitials = (name: string) =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? "DR";

const formatBloodGroup = (bg: string) =>
    bg ? bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") : "--";

const getDatePart = (t: string) =>
    t ? new Date(t).toISOString().split("T")[0] : "";

const formatTime = (t: string) => {
    if (!t) return { hr: "--", ampm: "" };

    const d = new Date(t);

    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");

    return {
        hr: `${h % 12 || 12}:${m}`,
        ampm: h >= 12 ? "PM" : "AM",
    };
};

const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #E2E8F0",
    padding: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    overflow: "hidden",
};

const StatCard = ({
    label,
    value,
    icon,
    accent,
    bg,
}: {
    label: string;
    value: number;
    icon: string;
    accent: string;
    bg: string;
}) => {
    return (
        <div
            style={{
                ...card,
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 0,
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <i
                    className={`ti ${icon}`}
                    style={{
                        color: accent,
                        fontSize: 20,
                    }}
                />
            </div>

            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: accent,
                        marginTop: 4,
                        wordBreak: "break-word",
                    }}
                >
                    {value}
                </div>
            </div>
        </div>
    );
};

const ApptRow = ({ a }: { a: AppointmentDTO }) => {
    const cfg =
        STATUS_CONFIG[a.status] ??
        STATUS_CONFIG.PENDING;

    const { hr, ampm } = formatTime(a.appointmentTime);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 14,
                border: "1px solid #E2E8F0",
                flexWrap: "wrap",
            }}
        >
            <div
                style={{
                    minWidth: 65,
                    textAlign: "center",
                    background: "#F8FAFC",
                    borderRadius: 10,
                    padding: "8px 10px",
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#2563EB",
                    }}
                >
                    {hr}
                </div>

                <div
                    style={{
                        fontSize: 10,
                        color: "#94A3B8",
                    }}
                >
                    {ampm}
                </div>
            </div>

            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563EB",
                    fontWeight: 700,
                    flexShrink: 0,
                }}
            >
                {getInitials(a.patientName ?? "")}
            </div>

            <div
                style={{
                    flex: 1,
                    minWidth: 140,
                }}
            >
                <div
                    style={{
                        fontWeight: 700,
                        color: "#1E293B",
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {a.patientName}
                </div>

                <div
                    style={{
                        color: "#94A3B8",
                        fontSize: 12,
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {a.reason}
                </div>
            </div>

            <div
                style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                    fontWeight: 700,
                    fontSize: 11,
                    whiteSpace: "nowrap",
                }}
            >
                {a.status}
            </div>
        </div>
    );
};

const PatientCard = ({ p }: { p: AppointmentDTO }) => {
    const bloodColor =
        BLOOD_COLORS[p.bloodGroup ?? ""] ?? "#94A3B8";

    return (
        <div
            style={{
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                padding: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
                flexWrap: "wrap",
            }}
        >
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#334155",
                    flexShrink: 0,
                }}
            >
                {getInitials(p.patientName ?? "")}
            </div>

            <div
                style={{
                    flex: 1,
                    minWidth: 140,
                }}
            >
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1E293B",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {p.patientName}
                </div>

                <div
                    style={{
                        fontSize: 12,
                        color: "#94A3B8",
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {p.patientEmail}
                </div>
            </div>

            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: bloodColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                }}
            >
                {formatBloodGroup(p.bloodGroup ?? "")}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const user: any = useSelector((state: any) => state.user);

    const profileId = user?.profileId;
    const userId = user?.id;

    const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
    const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apptRef = useRef<HTMLCanvasElement>(null);
    const donutRef = useRef<HTMLCanvasElement>(null);

    const apptChartRef = useRef<Chart | null>(null);
    const donutChartRef = useRef<Chart | null>(null);

    useEffect(() => {
        const style = document.createElement("style");

        style.innerHTML = `
            *{
                box-sizing:border-box;
            }

            .dashboard-container{
                width:100%;
                min-height:100vh;
                background:#F1F5F9;
                padding:20px;
                display:flex;
                flex-direction:column;
                gap:18px;
                overflow-x:hidden;
            }

            .hero{
                width:100%;
                border-radius:22px;
                padding:24px;
                background:linear-gradient(135deg,#0F6E56 0%,#1D9E75 45%,#2563EB 100%);
                overflow:hidden;
            }

            .hero-inner{
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:20px;
                flex-wrap:wrap;
            }

            .hero-left{
                display:flex;
                align-items:center;
                gap:16px;
                flex-wrap:wrap;
                min-width:0;
            }

            .hero-stats{
                display:flex;
                gap:12px;
                flex-wrap:wrap;
                width:100%;
                max-width:420px;
                justify-content:flex-end;
            }

            .hero-stat-box{
                flex:1 1 110px;
                min-width:100px;
            }

            .stats-grid{
                display:grid;
                grid-template-columns:repeat(5,minmax(0,1fr));
                gap:16px;
            }

            .chart-grid{
                display:grid;
                grid-template-columns:repeat(2,minmax(0,1fr));
                gap:16px;
            }

            .bottom-grid{
                display:grid;
                grid-template-columns:repeat(2,minmax(0,1fr));
                gap:16px;
            }

            .patient-grid{
                display:grid;
                grid-template-columns:repeat(2,minmax(0,1fr));
                gap:14px;
            }

            .chart-box{
                width:100%;
                height:300px;
                position:relative;
            }

            @media(max-width:1200px){
                .stats-grid{
                    grid-template-columns:repeat(3,minmax(0,1fr));
                }
            }

            @media(max-width:900px){

                .dashboard-container{
                    padding:16px;
                }

                .stats-grid{
                    grid-template-columns:repeat(2,minmax(0,1fr));
                }

                .chart-grid{
                    grid-template-columns:1fr;
                }

                .bottom-grid{
                    grid-template-columns:1fr;
                }

                .patient-grid{
                    grid-template-columns:1fr;
                }

                .hero-inner{
                    flex-direction:column;
                    align-items:flex-start;
                }

                .hero-stats{
                    width:100%;
                    max-width:100%;
                    justify-content:flex-start;
                }
            }

            @media(max-width:600px){

                .dashboard-container{
                    padding:12px;
                }

                .hero{
                    padding:18px;
                }

                .stats-grid{
                    grid-template-columns:1fr;
                }

                .hero-left{
                    flex-direction:column;
                    align-items:flex-start;
                }

                .hero-stats{
                    flex-direction:column;
                }

                .hero-stat-box{
                    width:100%;
                }

                .chart-box{
                    height:240px;
                }
            }
        `;

        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        if (!profileId || !userId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const doctorRes: DoctorDTO =
                    await getDoctor(profileId);

                setDoctor(doctorRes);

                const apptRes: AppointmentDTO[] =
                    await getAppointmentsByDoctor(profileId);

                const enriched = await Promise.all(
                    apptRes.map(async (appt) => {
                        try {
                            const patient: PatientDTO =
                                await getPatient(appt.patientId);

                            return {
                                ...appt,
                                patientName: patient.name,
                                patientEmail: patient.email,
                                bloodGroup: patient.bloodGroup,
                                address: patient.address,
                            };
                        } catch {
                            return {
                                ...appt,
                                patientName: "Unknown",
                                patientEmail: "",
                            };
                        }
                    })
                );

                setAppointments(enriched);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profileId, userId]);

    const today = new Date().toISOString().split("T")[0];

    const todayAppts = appointments.filter(
        (a) =>
            getDatePart(a.appointmentTime) === today &&
            a.status !== "CANCELLED"
    );

    const totalPatients = new Set(
        appointments.map((a) => a.patientId)
    ).size;

    const completed = appointments.filter(
        (a) => a.status === "COMPLETED"
    ).length;

    const pending = appointments.filter(
        (a) => a.status === "PENDING"
    ).length;

    const critical = appointments.filter((a) =>
        a.reason?.toLowerCase().includes("emergency")
    ).length;

    const apptByMonth = Array(12).fill(0);

    appointments.forEach((a) => {
        if (!a.appointmentTime) return;

        const m = new Date(a.appointmentTime).getMonth();

        apptByMonth[m]++;
    });

    const reasonMap: Record<string, number> = {};

    appointments.forEach((a) => {
        const r = a.reason || "Consult";
        reasonMap[r] = (reasonMap[r] || 0) + 1;
    });

    const reasonLabels = Object.keys(reasonMap);
    const reasonData = Object.values(reasonMap);

    useEffect(() => {
        if (!apptRef.current) return;

        apptChartRef.current?.destroy();

        apptChartRef.current = new Chart(apptRef.current, {
            type: "line",
            data: {
                labels: MONTHS,
                datasets: [
                    {
                        data: apptByMonth,
                        borderColor: "#2563EB",
                        backgroundColor: "rgba(37,99,235,0.08)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        });

        return () => {
            apptChartRef.current?.destroy();
        };
    }, [appointments]);

    useEffect(() => {
        if (!donutRef.current || reasonLabels.length === 0) return;

        donutChartRef.current?.destroy();

        donutChartRef.current = new Chart(donutRef.current, {
            type: "doughnut",
            data: {
                labels: reasonLabels,
                datasets: [
                    {
                        data: reasonData,
                        backgroundColor: REASON_COLORS,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });

        return () => {
            donutChartRef.current?.destroy();
        };
    }, [appointments]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {error}
            </div>
        );
    }

    return (
        <div className="dashboard-container">

            {/* HERO */}

            <div className="hero">
                <div className="hero-inner">

                    <div className="hero-left">

                        <div
                            style={{
                                width: 78,
                                height: 78,
                                borderRadius: 20,
                                overflow: "hidden",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 24,
                                flexShrink: 0,
                            }}
                        >
                            {doctor?.profilePictureId ? (
                                <img
                                    src={`http://localhost:9000/profile/files/${doctor.profilePictureId}`}
                                    alt="doctor"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                getInitials(doctor?.name ?? "")
                            )}
                        </div>

                        <div
                            style={{
                                minWidth: 0,
                            }}
                        >
                            <div
                                style={{
                                    color: "rgba(255,255,255,0.7)",
                                    fontSize: 12,
                                    marginBottom: 6,
                                }}
                            >
                                Welcome back
                            </div>

                            <div
                                style={{
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: 28,
                                    lineHeight: 1.2,
                                    wordBreak: "break-word",
                                }}
                            >
                                Dr. {doctor?.name}
                            </div>

                            <div
                                style={{
                                    marginTop: 6,
                                    color: "rgba(255,255,255,0.8)",
                                    fontSize: 14,
                                    wordBreak: "break-word",
                                }}
                            >
                                {doctor?.specialization} •{" "}
                                {doctor?.department}
                            </div>
                        </div>
                    </div>

                    <div className="hero-stats">

                        {[
                            {
                                val: appointments.length,
                                lbl: "Appointments",
                            },
                            {
                                val: totalPatients,
                                lbl: "Patients",
                            },
                            {
                                val: todayAppts.length,
                                lbl: "Today",
                            },
                        ].map((item) => (
                            <div
                                key={item.lbl}
                                className="hero-stat-box"
                                style={{
                                    background:
                                        "rgba(255,255,255,0.12)",
                                    border:
                                        "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: 16,
                                    padding: "14px 18px",
                                    textAlign: "center",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: 26,
                                    }}
                                >
                                    {item.val}
                                </div>

                                <div
                                    style={{
                                        color: "rgba(255,255,255,0.75)",
                                        fontSize: 11,
                                        marginTop: 4,
                                    }}
                                >
                                    {item.lbl}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* STATS */}

            <div className="stats-grid">
                <StatCard
                    label="Today's Appointments"
                    value={todayAppts.length}
                    icon="ti-calendar-event"
                    accent="#2563EB"
                    bg="#EFF6FF"
                />

                <StatCard
                    label="Completed"
                    value={completed}
                    icon="ti-check"
                    accent="#16A34A"
                    bg="#F0FDF4"
                />

                <StatCard
                    label="Pending"
                    value={pending}
                    icon="ti-clock"
                    accent="#D97706"
                    bg="#FFFBEB"
                />

                <StatCard
                    label="Total Patients"
                    value={totalPatients}
                    icon="ti-users"
                    accent="#0D9488"
                    bg="#F0FDF9"
                />

                <StatCard
                    label="Critical Cases"
                    value={critical}
                    icon="ti-alert-circle"
                    accent="#DC2626"
                    bg="#FEF2F2"
                />
            </div>

            {/* CHARTS */}

            <div className="chart-grid">

                <div style={card}>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 18,
                        }}
                    >
                        Monthly Appointments
                    </div>

                    <div className="chart-box">
                        <canvas ref={apptRef} />
                    </div>
                </div>

                <div style={card}>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 18,
                        }}
                    >
                        Visit Distribution
                    </div>

                    <div className="chart-box">
                        <canvas ref={donutRef} />
                    </div>
                </div>
            </div>

            <div className="bottom-grid">

                <div style={card}>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 16,
                        }}
                    >
                        Today's Schedule
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            maxHeight: 420,
                            overflowY: "auto",
                        }}
                    >
                        {todayAppts.length === 0 ? (
                            <div>No appointments today</div>
                        ) : (
                            todayAppts.map((a) => (
                                <ApptRow
                                    key={a.id}
                                    a={a}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div style={card}>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 16,
                        }}
                    >
                        Recent Patients
                    </div>

                    <div className="patient-grid">
                        {appointments.length === 0 ? (
                            <div>No patients found</div>
                        ) : (
                            appointments
                                .slice(0, 6)
                                .map((p) => (
                                    <PatientCard
                                        key={p.id}
                                        p={p}
                                    />
                                ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;