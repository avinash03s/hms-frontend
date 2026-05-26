import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import {
    getAllAppointments,
    getAllDoctors,
    getAllPatients,
} from "../../../service/AdminService";

function pick(obj: any, ...keys: string[]): string {
    for (const k of keys) {
        const v = obj?.[k];

        if (
            v !== undefined &&
            v !== null &&
            v !== ""
        ) {
            return String(v);
        }
    }

    return "—";
}

function pickNum(
    obj: any,
    ...keys: string[]
): number {
    for (const k of keys) {
        const v = obj?.[k];

        if (
            v !== undefined &&
            v !== null &&
            !isNaN(Number(v))
        ) {
            return Number(v);
        }
    }

    return 0;
}

function safeArray(data: any) {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.data))
        return data.data;

    if (Array.isArray(data?.content))
        return data.content;

    return [];
}

// NORMALIZE
function normalizeAppointment(raw: any) {
    return {
        id: pickNum(
            raw,
            "id",
            "appointmentId",
            "appointment_id"
        ),

        patientName: pick(
            raw,
            "patientName",
            "patient_name",
            "patient",
            "patientFullName"
        ),

        doctorName: pick(
            raw,
            "doctorName",
            "doctor_name",
            "doctor",
            "doctorFullName"
        ),

        specialization: pick(
            raw,
            "specialization",
            "department",
            "doctorSpecialization"
        ),

        appointmentDate: pick(
            raw,
            "appointmentDate",
            "appointment_date",
            "date",
            "scheduledDate",
            "createdAt"
        ),

        appointmentTime: pick(
            raw,
            "appointmentTime",
            "appointment_time",
            "time",
            "scheduledTime"
        ),

        status: pick(
            raw,
            "status",
            "appointmentStatus",
            "state"
        ),
    };
}

function normalizePatient(raw: any) {
    return {
        patientId: pickNum(
            raw,
            "patientId",
            "id"
        ),

        fullName: pick(
            raw,
            "fullName",
            "name",
            "patientName"
        ),

        age: pickNum(raw, "age"),

        bloodGroup: pick(
            raw,
            "bloodGroup",
            "blood_type"
        ),

        disease: pick(
            raw,
            "disease",
            "diagnosis",
            "condition"
        ),

        doctorName: pick(
            raw,
            "doctorName",
            "doctor"
        ),

        email: pick(raw, "email"),

        address: pick(
            raw,
            "address",
            "city",
            "location"
        ),

        status: pick(raw, "status"),
    };
}

function normalizeDoctor(raw: any) {
    return {
        doctorId: pickNum(
            raw,
            "doctorId",
            "id"
        ),

        fullName: pick(
            raw,
            "fullName",
            "name",
            "doctorName"
        ),

        specialization: pick(
            raw,
            "specialization",
            "department"
        ),

        qualification: pick(
            raw,
            "qualification",
            "degree"
        ),

        experience: pick(
            raw,
            "experience",
            "exp"
        ),

        email: pick(raw, "email"),

        address: pick(
            raw,
            "address",
            "city"
        ),

        status: pick(raw, "status"),
    };
}

type NAppointment = ReturnType<
    typeof normalizeAppointment
>;

type NPatient = ReturnType<
    typeof normalizePatient
>;

type NDoctor = ReturnType<
    typeof normalizeDoctor
>;

// CHART HELPERS
function buildMonthlyData(
    appointments: NAppointment[]
) {
    const months = [
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

    const counts: Record<
        string,
        number
    > = {};

    appointments.forEach((a) => {
        if (a.appointmentDate === "—")
            return;

        const d = new Date(
            a.appointmentDate.replace(
                " ",
                "T"
            )
        );

        if (isNaN(d.getTime())) return;

        const k = months[d.getMonth()];

        counts[k] = (counts[k] || 0) + 1;
    });

    return months
        .filter((m) => counts[m])
        .map((m) => ({
            month: m,
            value: counts[m],
        }));
}

function buildDiseaseData(
    patients: NPatient[]
) {
    const counts: Record<
        string,
        number
    > = {};

    patients.forEach((p) => {
        const key =
            p.disease === "—"
                ? "Other"
                : p.disease;

        counts[key] =
            (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(
        ([name, value]) => ({
            name,
            value,
        })
    );
}

function buildSpecData(
    doctors: NDoctor[]
) {
    const counts: Record<
        string,
        number
    > = {};

    doctors.forEach((d) => {
        const key =
            d.specialization === "—"
                ? "Other"
                : d.specialization;

        counts[key] =
            (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(
        ([name, value]) => ({
            name,
            value,
        })
    );
}

function fmtDateTime(raw: string) {
    if (!raw || raw === "—") {
        return {
            date: "—",
            time: "",
        };
    }

    const d = new Date(
        raw.replace(" ", "T")
    );

    if (isNaN(d.getTime())) {
        return {
            date: raw,
            time: "",
        };
    }

    return {
        date: d.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ),

        time: d.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        ),
    };
}

// COLORS
const PIE_COLORS = [
    "#7c6fde",
    "#e8724a",
    "#4caf8e",
    "#5ba8f5",
    "#f5a623",
    "#9575cd",
    "#66bb6a",
];

// SKELETON
const Skeleton = ({
    h = 50,
}: {
    h?: number;
}) => (
    <div
        style={{
            height: h,
            borderRadius: 12,
            background:
                "linear-gradient(90deg,#f3f4f6 25%,#e9ebee 50%,#f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation:
                "shimmer 1.5s infinite",
            marginBottom: 10,
        }}
    />
);

// TOOLTIP
const CustomTooltip = ({
    active,
    payload,
    label,
}: any) => {
    if (
        !active ||
        !payload?.length
    )
        return null;

    return (
        <div
            style={{
                background: "#fff",
                border:
                    "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
            }}
        >
            <p
                style={{
                    fontWeight: 700,
                    marginBottom: 4,
                }}
            >
                {label}
            </p>

            {payload.map(
                (p: any, i: number) => (
                    <div key={i}>
                        {p.value}
                    </div>
                )
            )}
        </div>
    );
};

// MINI AREA
const MiniArea = ({
    data,
    color,
    gradId,
}: any) => (
    <ResponsiveContainer
        width="100%"
        height={70}
    >
        <AreaChart data={data}>
            <defs>
                <linearGradient
                    id={gradId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="5%"
                        stopColor={color}
                        stopOpacity={0.4}
                    />

                    <stop
                        offset="95%"
                        stopColor={color}
                        stopOpacity={0}
                    />
                </linearGradient>
            </defs>

            <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradId})`}
            />
        </AreaChart>
    </ResponsiveContainer>
);

// STATUS BADGE
function statusBadge(
    status = ""
) {
    const s = status.toLowerCase();

    if (
        [
            "confirmed",
            "active",
            "completed",
        ].includes(s)
    ) {
        return {
            bg: "#dcfce7",
            color: "#16a34a",
        };
    }

    if (
        [
            "pending",
            "scheduled",
        ].includes(s)
    ) {
        return {
            bg: "#eff6ff",
            color: "#2563eb",
        };
    }

    return {
        bg: "#f3f4f6",
        color: "#6b7280",
    };
}

// STAT CARD
const StatCard = ({
    label,
    count,
    chartData,
    color,
    bgColor,
    iconBg,
    icon,
    gradId,
}: any) => (
    <div
        style={{
            background: bgColor,
            borderRadius: 20,
            padding:
                "18px 20px 0 20px",
            overflow: "hidden",
            width: "100%",
        }}
    >
        <div
            style={{
                display: "flex",
                justifyContent:
                    "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
            }}
        >
            <div
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>

            <div
                style={{
                    textAlign: "right",
                    minWidth: 0,
                    flex: 1,
                }}
            >
                <div
                    style={{
                        fontSize: 12,
                        color: "#6b7280",
                        wordBreak: "break-word",
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        fontSize: 32,
                        fontWeight: 800,
                        wordBreak: "break-word",
                    }}
                >
                    {count}
                </div>
            </div>
        </div>

        <MiniArea
            data={chartData}
            color={color}
            gradId={gradId}
        />
    </div>
);

// SECTION CARD
const SectionCard = ({
    title,
    children,
}: any) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 20,
            padding: 18,
            boxShadow:
                "0 1px 4px rgba(0,0,0,0.05)",
            width: "100%",
            overflow: "hidden",
        }}
    >
        <div
            style={{
                fontWeight: 700,
                marginBottom: 14,
                wordBreak: "break-word",
            }}
        >
            {title}
        </div>

        {children}
    </div>
);

// APPOINTMENT ROW
const AppointRow = ({
    a,
}: {
    a: NAppointment;
}) => {
    const sb = statusBadge(
        a.status
    );

    const { date, time } =
        fmtDateTime(
            a.appointmentDate
        );

    return (
        <div
            style={{
                display: "flex",
                justifyContent:
                    "space-between",
                flexWrap: "wrap",
                gap: 10,
                padding: 12,
                borderRadius: 12,
                background: "#fdf6ee",
                marginBottom: 8,
            }}
        >
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: 13,
                        wordBreak: "break-word",
                    }}
                >
                    {a.patientName}
                </div>

                <div
                    style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        wordBreak: "break-word",
                    }}
                >
                    {a.doctorName}
                </div>
            </div>

            <div
                style={{
                    textAlign: "right",
                    minWidth: 110,
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                    }}
                >
                    {date}
                </div>

                <div
                    style={{
                        fontSize: 11,
                        color: "#9ca3af",
                    }}
                >
                    {time}
                </div>

                <span
                    style={{
                        display:
                            "inline-block",
                        marginTop: 3,
                        padding:
                            "2px 8px",
                        borderRadius: 99,
                        background: sb.bg,
                        color: sb.color,
                        fontSize: 10,
                        fontWeight: 700,
                    }}
                >
                    {a.status}
                </span>
            </div>
        </div>
    );
};

// DASHBOARD
const AdminDashboard = () => {
    const [
        appointments,
        setAppointments,
    ] = useState<
        NAppointment[]
    >([]);

    const [
        patients,
        setPatients,
    ] = useState<NPatient[]>([]);

    const [
        doctors,
        setDoctors,
    ] = useState<NDoctor[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadData =
        useCallback(async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    aRes,
                    pRes,
                    dRes,
                ] = await Promise.all([
                    getAllAppointments(),
                    getAllPatients(),
                    getAllDoctors(),
                ]);

                const rawA = safeArray(
                    aRes.data
                );

                const rawP = safeArray(
                    pRes.data
                );

                const rawD = safeArray(
                    dRes.data
                );

                setAppointments(
                    rawA.map(
                        normalizeAppointment
                    )
                );

                setPatients(
                    rawP.map(
                        normalizePatient
                    )
                );

                setDoctors(
                    rawD.map(
                        normalizeDoctor
                    )
                );
            } catch (err) {
                console.error(err);

                setError(
                    "Failed to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadData();

        const interval =
            setInterval(() => {
                loadData();
            }, 30000);

        return () =>
            clearInterval(interval);
    }, [loadData]);

    const monthlyData =
        useMemo(
            () =>
                buildMonthlyData(
                    appointments
                ),
            [appointments]
        );

    const diseaseData =
        useMemo(
            () =>
                buildDiseaseData(
                    patients
                ),
            [patients]
        );

    const specData = useMemo(
        () =>
            buildSpecData(doctors),
        [doctors]
    );

    const fallback = [
        { value: 0 },
        { value: 2 },
        { value: 4 },
        { value: 2 },
        { value: 1 },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        *{
          box-sizing:border-box;
        }

        body {
          margin: 0;
          background: #f0f2f7;
          font-family: 'DM Sans', sans-serif;
        }

        ::-webkit-scrollbar{
          width:4px;
          height:4px;
        }

        ::-webkit-scrollbar-thumb{
          background:#d1d5db;
          border-radius:20px;
        }
      `}</style>

            {/* MAIN WRAPPER */}
            <div
                style={{
                    background: "#f0f2f7",
                    minHeight: "100vh",
                    marginLeft: "0px",
                    width: "100%",
                    overflowX: "hidden",
                }}
            >
                <div
                    style={{
                        padding:
                            window.innerWidth <
                            768
                                ? "12px"
                                : "22px",
                    }}
                >
                    {error && (
                        <div
                            style={{
                                background:
                                    "#fee2e2",
                                color:
                                    "#dc2626",
                                padding:
                                    "12px 16px",
                                borderRadius: 12,
                                marginBottom: 18,
                                fontSize: 13,
                                fontWeight: 600,
                                wordBreak:
                                    "break-word",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
                        <StatCard
                            label="Appointments"
                            count={
                                appointments.length
                            }
                            chartData={
                                monthlyData.length
                                    ? monthlyData
                                    : fallback
                            }
                            color="#7c6fde"
                            bgColor="#ede9fb"
                            iconBg="#d8d3f8"
                            icon="📅"
                            gradId="g1"
                        />

                        <StatCard
                            label="Patients"
                            count={
                                patients.length
                            }
                            chartData={
                                fallback
                            }
                            color="#e8724a"
                            bgColor="#fef0e9"
                            iconBg="#fdd9c9"
                            icon="🏥"
                            gradId="g2"
                        />

                        <StatCard
                            label="Doctors"
                            count={
                                doctors.length
                            }
                            chartData={
                                fallback
                            }
                            color="#4caf8e"
                            bgColor="#e8f7f2"
                            iconBg="#c5ece0"
                            icon="👨‍⚕️"
                            gradId="g3"
                        />
                    </div>

                    {/* CHARTS */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
                        {/* PIE */}
                        <SectionCard title="Reason Distribution">
                            {loading ? (
                                <>
                                    <Skeleton h={240} />
                                </>
                            ) : diseaseData.length ===
                              0 ? (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    No Data
                                </div>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height={250}
                                >
                                    <PieChart>
                                        <Pie
                                            data={
                                                diseaseData
                                            }
                                            dataKey="value"
                                            innerRadius={
                                                60
                                            }
                                            outerRadius={
                                                90
                                            }
                                        >
                                            {diseaseData.map(
                                                (
                                                    _,
                                                    i
                                                ) => (
                                                    <Cell
                                                        key={
                                                            i
                                                        }
                                                        fill={
                                                            PIE_COLORS[
                                                                i %
                                                                    PIE_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip
                                            content={
                                                <CustomTooltip />
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </SectionCard>

                        {/* APPOINTMENTS */}
                        <SectionCard title="Appointments">
                            {loading ? (
                                <>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                </>
                            ) : (
                                appointments
                                    .slice(
                                        0,
                                        6
                                    )
                                    .map(
                                        (
                                            a,
                                            i
                                        ) => (
                                            <AppointRow
                                                key={`${a.id}-${i}`}
                                                a={
                                                    a
                                                }
                                            />
                                        )
                                    )
                            )}
                        </SectionCard>

                        {/* SPECIALIZATION */}
                        <SectionCard title="Doctor Specializations">
                            {loading ? (
                                <>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                </>
                            ) : (
                                <div className="space-y-3">
                                    {specData
                                        .slice(
                                            0,
                                            6
                                        )
                                        .map(
                                            (
                                                s,
                                                i
                                            ) => (
                                                <div
                                                    key={
                                                        i
                                                    }
                                                    className="flex flex-wrap items-center justify-between gap-3 bg-[#fff7ed] border border-orange-100 px-4 py-3 rounded-xl"
                                                >
                                                    <div
                                                        style={{
                                                            minWidth: 0,
                                                            flex: 1,
                                                        }}
                                                    >
                                                        <div className="font-semibold text-sm break-words">
                                                            {
                                                                s.name
                                                            }
                                                        </div>

                                                        <div className="text-xs text-slate-400">
                                                            Department
                                                        </div>
                                                    </div>

                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                                        style={{
                                                            background:
                                                                PIE_COLORS[
                                                                    i %
                                                                        PIE_COLORS.length
                                                                ] +
                                                                "22",

                                                            color:
                                                                PIE_COLORS[
                                                                    i %
                                                                        PIE_COLORS.length
                                                                ],
                                                        }}
                                                    >
                                                        {
                                                            s.value
                                                        }
                                                    </span>
                                                </div>
                                            )
                                        )}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {/* PATIENTS */}
                        <div
                            style={{
                                background:
                                    "#f5efe6",
                                borderRadius: 20,
                                padding: 16,
                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.06)",
                                maxHeight: 360,
                                overflowY:
                                    "auto",
                                overflowX:
                                    "hidden",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    marginBottom: 14,
                                    fontSize: 18,
                                    fontWeight: 800,
                                }}
                            >
                                Patients
                            </h3>

                            {loading ? (
                                <>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                </>
                            ) : (
                                patients
                                    .slice(
                                        0,
                                        8
                                    )
                                    .map(
                                        (
                                            p,
                                            i
                                        ) => (
                                            <div
                                                key={
                                                    i
                                                }
                                                style={{
                                                    background:
                                                        "#fff7ed",
                                                    border:
                                                        "2px solid #f97316",
                                                    borderRadius: 16,
                                                    padding:
                                                        "14px 16px",
                                                    marginBottom: 12,
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "flex-start",
                                                    flexWrap:
                                                        "wrap",
                                                    gap: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 800,
                                                            fontSize: 16,
                                                            marginBottom: 4,
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            p.fullName
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            color: "#6b7280",
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            p.email
                                                        }
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        textAlign:
                                                            "right",
                                                        minWidth: 120,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            color: "#6b7280",
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            p.address
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                            marginTop: 4,
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        Blood
                                                        Group:{" "}
                                                        {
                                                            p.bloodGroup
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                            )}
                        </div>

                        {/* DOCTORS */}
                        <div
                            style={{
                                background:
                                    "#efedf7",
                                borderRadius: 20,
                                padding: 16,
                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.06)",
                                maxHeight: 360,
                                overflowY:
                                    "auto",
                                overflowX:
                                    "hidden",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    marginBottom: 14,
                                    fontSize: 18,
                                    fontWeight: 800,
                                }}
                            >
                                Doctors
                            </h3>

                            {loading ? (
                                <>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                </>
                            ) : (
                                doctors
                                    .slice(
                                        0,
                                        8
                                    )
                                    .map(
                                        (
                                            d,
                                            i
                                        ) => (
                                            <div
                                                key={
                                                    i
                                                }
                                                style={{
                                                    background:
                                                        "#f5f3ff",
                                                    border:
                                                        "2px solid #8b5cf6",
                                                    borderRadius: 16,
                                                    padding:
                                                        "14px 16px",
                                                    marginBottom: 12,
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "flex-start",
                                                    flexWrap:
                                                        "wrap",
                                                    gap: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 800,
                                                            fontSize: 16,
                                                            marginBottom: 4,
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            d.fullName
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            color: "#6b7280",
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            d.email
                                                        }
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        textAlign:
                                                            "right",
                                                        minWidth: 120,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            color: "#6b7280",
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            d.address
                                                        }
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                            marginTop: 4,
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {
                                                            d.specialization
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;