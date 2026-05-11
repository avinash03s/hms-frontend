import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPrescriptionsByDoctor } from "../../../service/AppointmentService";
import { getPatient } from "../../../service/PatientProfileService";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MedicineDTO {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: number;
  routes: string;
  type: string;
  instructions?: string;
  prescriptionId?: number;
}

interface PrescriptionDTO {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  prescriptionDate: string;
  prescriptionNotes: string;
  medicines: MedicineDTO[];
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientBloodGroup?: string;
  patientAddress?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFrequency = (freq: string): string => {
  const map: Record<string, string> = {
    "1-0-0": "Morning only",
    "0-1-0": "Afternoon only",
    "0-0-1": "Night only",
    "1-1-0": "Morning & Afternoon",
    "1-0-1": "Morning & Night",
    "0-1-1": "Afternoon & Night",
    "1-1-1": "3x daily",
  };
  return map[freq] ?? freq;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const formatBloodGroup = (bg: string) =>
  bg?.replace("_POSITIVE", " +ve").replace("_NEGATIVE", " -ve") ?? "";

// ─── PDF Download ─────────────────────────────────────────────────────────────
const downloadPDF = (p: PrescriptionDTO, doctorName: string) => {
  const win = window.open("", "_blank");
  if (!win) return;

  const rows = p.medicines
    ?.map(
      (m, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">
          <strong style="display:block;color:#111827">${m.medicineName}</strong>
          <span style="font-size:12px;color:#6b7280">${m.type} · ${m.routes}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.dosage}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${formatFrequency(m.frequency)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.duration} days</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.instructions ?? "—"}</td>
      </tr>`
    )
    .join("");

  win.document.write(`<!DOCTYPE html><html><head><title>Prescription #${p.id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',sans-serif;color:#111827;padding:40px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #1D9E75}
    .logo{font-size:24px;font-weight:700;color:#1D9E75}.logo span{color:#111827}
    .rx{background:#E1F5EE;color:#0F6E56;font-size:28px;font-weight:700;padding:4px 16px;border-radius:8px;display:inline-block;margin-bottom:6px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px}
    .info-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px}
    .info-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
    .info-value{font-size:15px;font-weight:600}
    .patient-box{background:#f0fdf7;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:24px}
    .patient-title{font-size:12px;color:#0F6E56;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px}
    .patient-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .notes{background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px}
    thead tr{background:#1D9E75}
    thead th{padding:10px 12px;text-align:left;font-size:12px;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
    .footer{margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-end}
    .sign-box{text-align:center}
    .sign-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:6px}
    .sign-line{border-top:1px solid #111827;width:200px;padding-top:8px;font-size:12px;color:#6b7280;text-align:center}
    .watermark{font-size:11px;color:#9ca3af}
    @media print{body{padding:20px}}
  </style></head><body>

  <div class="header">
    <div>
      <div class="logo">Pulse<span>Care</span></div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">Health Management System</div>
    </div>
    <div style="text-align:right">
      <div class="rx">℞</div>
      <div style="font-size:13px;color:#6b7280">Date: ${formatDate(p.prescriptionDate)}</div>
      <div style="font-size:13px;color:#6b7280">Prescription ID: #${p.id}</div>
    </div>
  </div>

  <div class="patient-box">
    <div class="patient-title">Patient Information</div>
    <div class="patient-grid">
      <div>
        <div class="info-label">Name</div>
        <div class="info-value">${p.patientName ?? `Patient #${p.patientId}`}</div>
      </div>
      <div>
        <div class="info-label">Email</div>
        <div class="info-value" style="font-size:13px">${p.patientEmail ?? "—"}</div>
      </div>
      <div>
        <div class="info-label">Phone</div>
        <div class="info-value">${p.patientPhone ?? "—"}</div>
      </div>
      <div>
        <div class="info-label">Blood Group</div>
        <div class="info-value">${formatBloodGroup(p.patientBloodGroup ?? "") || "—"}</div>
      </div>
      <div>
        <div class="info-label">Address</div>
        <div class="info-value" style="font-size:13px">${p.patientAddress ?? "—"}</div>
      </div>
      <div>
        <div class="info-label">Appointment ID</div>
        <div class="info-value">#${p.appointmentId}</div>
      </div>
    </div>
  </div>

  ${p.prescriptionNotes ? `
  <div class="notes">
    <div style="font-size:12px;color:#92400e;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Doctor's Notes</div>
    <div style="font-size:14px;line-height:1.6">${p.prescriptionNotes}</div>
  </div>` : ""}

  <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:10px">
    Prescribed Medicines (${p.medicines?.length ?? 0})
  </div>
  <table>
    <thead>
      <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <div class="watermark">Generated by PulseCare HMS · ${new Date().toLocaleString("en-IN")}</div>
    <div class="sign-box">
      <div class="sign-name">Dr. ${doctorName}</div>
      <div class="sign-line">Doctor's Signature</div>
    </div>
  </div>

  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const PrescriptionModal = ({
  prescription: p,
  onClose,
  doctorName,
}: {
  prescription: PrescriptionDTO;
  onClose: () => void;
  doctorName: string;
}) => (
  <div
    onClick={onClose}
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 660, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}
    >
      {/* Header */}
      <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1, borderRadius: "16px 16px 0 0" }}>
        <div>
          <span style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: 13, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>
            ℞ Prescription #{p.id}
          </span>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            {formatDate(p.prescriptionDate)} · Appointment #{p.appointmentId}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => downloadPDF(p, doctorName)}
            style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            ⬇ Download PDF
          </button>
          <button
            onClick={onClose}
            style={{ background: "#f5f5f5", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer", color: "#374151" }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 22px" }}>

        {/* Patient Info */}
        <div style={{ background: "#f0fdf7", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#0F6E56", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Patient Information
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              ["Name", p.patientName ?? `#${p.patientId}`],
              ["Email", p.patientEmail ?? "—"],
              ["Phone", p.patientPhone ?? "—"],
              ["Blood Group", formatBloodGroup(p.patientBloodGroup ?? "") || "—"],
              ["Address", p.patientAddress ?? "—"],
              ["Appointment", `#${p.appointmentId}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor info */}
        <div style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#1e40af", flexShrink: 0 }}>
            {doctorName?.charAt(0).toUpperCase()}
          </span>
          <div>
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Prescribed by</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>Dr. {doctorName}</p>
          </div>
        </div>

        {/* Notes */}
        {p.prescriptionNotes && (
          <div style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b", borderRadius: "0 8px 8px 0", padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#92400e", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Doctor's Notes
            </p>
            <p style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.6 }}>{p.prescriptionNotes}</p>
          </div>
        )}

        {/* Medicines Table */}
        <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 8 }}>
          Medicines ({p.medicines?.length ?? 0})
        </p>
        <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.3fr 0.7fr", padding: "8px 12px", background: "#1D9E75", fontSize: 11, color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", gap: 8 }}>
            <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Days</span>
          </div>
          {p.medicines?.map((m, i) => (
            <div key={m.id ?? i} style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.3fr 0.7fr", padding: "10px 12px", background: i % 2 === 0 ? "#f9fafb" : "#fff", borderTop: "1px solid #f0f0f0", fontSize: 13, gap: 8, alignItems: "start" }}>
              <div>
                <p style={{ fontWeight: 500, color: "#111827", marginBottom: 2 }}>{m.medicineName}</p>
                <span style={{ fontSize: 11, color: "#6b7280", background: "#e5e7eb", padding: "1px 7px", borderRadius: 99 }}>{m.type} · {m.routes}</span>
                {m.instructions && <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>⚠ {m.instructions}</p>}
              </div>
              <span style={{ color: "#374151", paddingTop: 2 }}>{m.dosage}</span>
              <span style={{ color: "#374151", paddingTop: 2 }}>{formatFrequency(m.frequency)}</span>
              <span style={{ color: "#374151", paddingTop: 2 }}>{m.duration}d</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => downloadPDF(p, doctorName)}
          style={{ marginTop: 18, width: "100%", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          ⬇ Download PDF
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Reports = () => {
  const [reports, setReports] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PrescriptionDTO | null>(null);
  const [search, setSearch] = useState("");

  const user = useSelector((state: any) => state.user);
  const doctorName: string = user?.name ?? "Doctor";
  // const doctorId = localStorage.getItem("doctorId") ?? user?.id;
  const doctorId = user?.profileId;

  console.log("user from redux:", JSON.stringify(user));

  useEffect(() => {
    if (!doctorId) {
      setError("Doctor ID not found. Please logout and login again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getPrescriptionsByDoctor(doctorId)
      .then(async (data: PrescriptionDTO[]) => {
        const enriched = await Promise.all(
          data.map(async (p) => {
            try {
              const patient = await getPatient(p.patientId);
              return {
                ...p,
                patientName: patient.name,
                patientEmail: patient.email,
                patientPhone: patient.phoneNo,
                patientBloodGroup: patient.bloodGroup,
                patientAddress: patient.address,
              };
            } catch {
              return { ...p, patientName: `Patient #${p.patientId}` };
            }
          })
        );
        setReports(enriched);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setError("Failed to load reports");
        setLoading(false);
      });
  }, [doctorId]);

  const filtered = reports.filter(
    (r) =>
      search === "" ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.patientId).includes(search) ||
      String(r.appointmentId).includes(search) ||
      r.prescriptionNotes?.toLowerCase().includes(search.toLowerCase()) ||
      r.medicines?.some((m) => m.medicineName?.toLowerCase().includes(search.toLowerCase()))
  );

  const thisMonth = reports.filter((r) => {
    const d = new Date(r.prescriptionDate), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 36, height: 36, background: "#E1F5EE", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</span>
          Prescription Reports
        </h2>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
          {[
            ["Total Prescriptions", reports.length],
            ["This Month", thisMonth],
            ["Unique Patients", new Set(reports.map((r) => r.patientId)).size],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 600, color: "#111827", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && !error && reports.length > 0 && (
        <input
          type="text"
          placeholder="🔍  Patient name, medicine, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #e5e7eb", fontSize: 14, marginBottom: 14, outline: "none", color: "#111827", background: "#fff", boxSizing: "border-box" }}
        />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
          <span style={{ width: 18, height: 18, border: "2px solid #1D9E75", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          Loading prescriptions...
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#dc2626", fontSize: 14 }}>
          ⚠ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af", fontSize: 14 }}>
          {search ? "No prescription find for this search." : "No any prescription."}
        </div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1D9E75"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(29,158,117,0.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#0F6E56", flexShrink: 0 }}>
                      {r.patientName ? r.patientName.charAt(0).toUpperCase() : "P"}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
                        {r.patientName ?? `Patient #${r.patientId}`}
                      </p>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                        {r.patientEmail ?? ""} · Appointment #{r.appointmentId}
                      </p>
                    </div>
                  </div>

                  {r.medicines?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {r.medicines.slice(0, 4).map((m, i) => (
                        <span key={i} style={{ fontSize: 11, background: "#f3f4f6", color: "#4b5563", padding: "2px 9px", borderRadius: 99, border: "1px solid #e5e7eb" }}>
                          {m.medicineName}
                        </span>
                      ))}
                      {r.medicines.length > 4 && (
                        <span style={{ fontSize: 11, color: "#9ca3af", padding: "2px 4px" }}>
                          +{r.medicines.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {r.prescriptionNotes && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f0f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 480 }}>
                      📝 {r.prescriptionNotes}
                    </p>
                  )}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 14 }}>
                  <span style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 500, display: "block", marginBottom: 4 }}>
                    {formatDate(r.prescriptionDate)}
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    {r.medicines?.length ?? 0} medicines
                  </span>
                  <br />
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPDF(r, doctorName); }}
                    style={{ marginTop: 6, background: "transparent", border: "1px solid #1D9E75", color: "#1D9E75", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 500 }}
                  >
                    ⬇ PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <PrescriptionModal
          prescription={selected}
          onClose={() => setSelected(null)}
          doctorName={doctorName}
        />
      )}
    </div>
  );
};

export default Reports;