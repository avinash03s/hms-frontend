// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { getPrescriptionsByDoctor } from "../../../service/AppointmentService";
// import { getPatient } from "../../../service/PatientProfileService";

// interface MedicineDTO {
//   id: number;
//   medicineName: string;
//   dosage: string;
//   frequency: string;
//   duration: number;
//   routes: string;
//   type: string;
//   instructions?: string;
//   prescriptionId?: number;
// }

// interface PrescriptionDTO {
//   id: number;
//   patientId: number;
//   doctorId: number;
//   appointmentId: number;
//   prescriptionDate: string;
//   prescriptionNotes: string;
//   medicines: MedicineDTO[];
//   patientName?: string;
//   patientEmail?: string;
//   patientPhone?: string;
//   patientBloodGroup?: string;
//   patientAddress?: string;
// }

// const formatFrequency = (freq: string): string => {
//   const map: Record<string, string> = {
//     "1-0-0": "Morning only",
//     "0-1-0": "Afternoon only",
//     "0-0-1": "Night only",
//     "1-1-0": "Morning & Afternoon",
//     "1-0-1": "Morning & Night",
//     "0-1-1": "Afternoon & Night",
//     "1-1-1": "3x daily",
//   };
//   return map[freq] ?? freq;
// };

// const formatDate = (d: string) =>
//   new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// const formatBloodGroup = (bg: string) =>
//   bg?.replace("_POSITIVE", " +ve").replace("_NEGATIVE", " -ve") ?? "";


// const downloadPDF = (p: PrescriptionDTO, doctorName: string) => {
//   const win = window.open("", "_blank");
//   if (!win) return;

//   const rows = p.medicines
//     ?.map(
//       (m, i) => `
//       <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
//         <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">
//           <strong style="display:block;color:#111827">${m.medicineName}</strong>
//           <span style="font-size:12px;color:#6b7280">${m.type} · ${m.routes}</span>
//         </td>
//         <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.dosage}</td>
//         <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${formatFrequency(m.frequency)}</td>
//         <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.duration} days</td>
//         <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.instructions ?? "—"}</td>
//       </tr>`
//     )
//     .join("");

//   win.document.write(`<!DOCTYPE html><html><head><title>Prescription #${p.id}</title>
//   <style>
//     *{margin:0;padding:0;box-sizing:border-box}
//     body{font-family:'Segoe UI',sans-serif;color:#111827;padding:40px}
//     .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #1D9E75}
//     .logo{font-size:24px;font-weight:700;color:#1D9E75}.logo span{color:#111827}
//     .rx{background:#E1F5EE;color:#0F6E56;font-size:28px;font-weight:700;padding:4px 16px;border-radius:8px;display:inline-block;margin-bottom:6px}
//     .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px}
//     .info-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px}
//     .info-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
//     .info-value{font-size:15px;font-weight:600}
//     .patient-box{background:#f0fdf7;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:24px}
//     .patient-title{font-size:12px;color:#0F6E56;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px}
//     .patient-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
//     .notes{background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px}
//     table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px}
//     thead tr{background:#1D9E75}
//     thead th{padding:10px 12px;text-align:left;font-size:12px;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
//     .footer{margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-end}
//     .sign-box{text-align:center}
//     .sign-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:6px}
//     .sign-line{border-top:1px solid #111827;width:200px;padding-top:8px;font-size:12px;color:#6b7280;text-align:center}
//     .watermark{font-size:11px;color:#9ca3af}
//     @media print{body{padding:20px}}
//   </style></head><body>

//   <div class="header">
//     <div>
//       <div class="logo">Pulse<span>Care</span></div>
//       <div style="font-size:13px;color:#6b7280;margin-top:4px">Health Management System</div>
//     </div>
//     <div style="text-align:right">
//       <div class="rx">℞</div>
//       <div style="font-size:13px;color:#6b7280">Date: ${formatDate(p.prescriptionDate)}</div>
//       <div style="font-size:13px;color:#6b7280">Prescription ID: #${p.id}</div>
//     </div>
//   </div>

//   <div class="patient-box">
//     <div class="patient-title">Patient Information</div>
//     <div class="patient-grid">
//       <div>
//         <div class="info-label">Name</div>
//         <div class="info-value">${p.patientName ?? `Patient #${p.patientId}`}</div>
//       </div>
//       <div>
//         <div class="info-label">Email</div>
//         <div class="info-value" style="font-size:13px">${p.patientEmail ?? "—"}</div>
//       </div>
//       <div>
//         <div class="info-label">Phone</div>
//         <div class="info-value">${p.patientPhone ?? "—"}</div>
//       </div>
//       <div>
//         <div class="info-label">Blood Group</div>
//         <div class="info-value">${formatBloodGroup(p.patientBloodGroup ?? "") || "—"}</div>
//       </div>
//       <div>
//         <div class="info-label">Address</div>
//         <div class="info-value" style="font-size:13px">${p.patientAddress ?? "—"}</div>
//       </div>
//       <div>
//         <div class="info-label">Appointment ID</div>
//         <div class="info-value">#${p.appointmentId}</div>
//       </div>
//     </div>
//   </div>

//   ${p.prescriptionNotes ? `
//   <div class="notes">
//     <div style="font-size:12px;color:#92400e;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Doctor's Notes</div>
//     <div style="font-size:14px;line-height:1.6">${p.prescriptionNotes}</div>
//   </div>` : ""}

//   <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:10px">
//     Prescribed Medicines (${p.medicines?.length ?? 0})
//   </div>
//   <table>
//     <thead>
//       <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
//     </thead>
//     <tbody>${rows}</tbody>
//   </table>

//   <div class="footer">
//     <div class="watermark">Generated by PulseCare HMS · ${new Date().toLocaleString("en-IN")}</div>
//     <div class="sign-box">
//       <div class="sign-name">Dr. ${doctorName}</div>
//       <div class="sign-line">Doctor's Signature</div>
//     </div>
//   </div>

//   </body></html>`);
//   win.document.close();
//   win.focus();
//   setTimeout(() => { win.print(); win.close(); }, 500);
// };

// const PrescriptionModal = ({
//   prescription: p,
//   onClose,
//   doctorName,
// }: {
//   prescription: PrescriptionDTO;
//   onClose: () => void;
//   doctorName: string;
// }) => (
//   <div
//     onClick={onClose}
//     className="fixed inset-0 z-[1000] bg-black/55 flex items-center justify-center p-3 sm:p-4"
//   >
//     <div
//       onClick={(e) => e.stopPropagation()}
//       className="bg-white rounded-2xl w-full max-w-[660px] max-h-[88vh] overflow-y-auto shadow-2xl"
//     >
//       {/* Header */}
//       <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

//         <div>
//           <span className="bg-[#E1F5EE] text-[#0F6E56] text-xs sm:text-sm font-semibold px-3 py-1 rounded-md inline-block">
//             ℞ Prescription #{p.id}
//           </span>

//           <p className="text-[11px] sm:text-xs text-gray-400 mt-1 break-words">
//             {formatDate(p.prescriptionDate)} · Appointment #{p.appointmentId}
//           </p>
//         </div>

//         <div className="flex items-center gap-2 w-full sm:w-auto">
//           <button
//             onClick={() => downloadPDF(p, doctorName)}
//             className="flex-1 sm:flex-none bg-[#1D9E75] text-white border-none rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium cursor-pointer"
//           >
//             ⬇ Download PDF
//           </button>

//           <button
//             onClick={onClose}
//             className="bg-gray-100 border-none rounded-lg px-3 py-2 text-xs sm:text-sm cursor-pointer text-gray-700"
//           >
//             ✕
//           </button>
//         </div>
//       </div>

//       <div className="px-4 sm:px-6 py-5">

//         {/* Patient Info */}
//         <div className="bg-[#f0fdf7] border border-[#bbf7d0] rounded-xl p-4 mb-4">

//           <p className="text-[11px] text-[#0F6E56] font-semibold uppercase tracking-wider mb-3">
//             Patient Information
//           </p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//             {[
//               ["Name", p.patientName ?? `#${p.patientId}`],
//               ["Email", p.patientEmail ?? "—"],
//               ["Phone", p.patientPhone ?? "—"],
//               ["Blood Group", formatBloodGroup(p.patientBloodGroup ?? "") || "—"],
//               ["Address", p.patientAddress ?? "—"],
//               ["Appointment", `#${p.appointmentId}`],
//             ].map(([label, value]) => (
//               <div key={label}>
//                 <p className="text-[11px] text-gray-500 mb-1">
//                   {label}
//                 </p>

//                 <p className="text-sm font-medium text-gray-900 break-words">
//                   {value}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Doctor info */}
//         <div className="bg-[#f8faff] border border-[#dbeafe] rounded-xl p-4 mb-4 flex items-center gap-3">

//           <span className="w-9 h-9 rounded-full bg-[#dbeafe] flex items-center justify-center text-sm font-bold text-[#1e40af] shrink-0">
//             {doctorName?.charAt(0).toUpperCase()}
//           </span>

//           <div className="min-w-0">
//             <p className="text-[11px] text-gray-500">
//               Prescribed by
//             </p>

//             <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
//               Dr. {doctorName}
//             </p>
//           </div>
//         </div>

//         {/* Notes */}
//         {p.prescriptionNotes && (
//           <div className="bg-[#fffbeb] border-l-[3px] border-[#f59e0b] rounded-r-lg p-3 sm:p-4 mb-4">

//             <p className="text-[11px] text-[#92400e] mb-1 font-semibold uppercase tracking-wide">
//               Doctor's Notes
//             </p>

//             <p className="text-sm text-[#1a1a1a] leading-6 break-words">
//               {p.prescriptionNotes}
//             </p>
//           </div>
//         )}

//         {/* Medicines Heading */}
//         <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
//           Medicines ({p.medicines?.length ?? 0})
//         </p>

//         {/* Desktop Table */}
//         <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">

//           <div className="grid grid-cols-[2fr_0.8fr_1.3fr_0.7fr] gap-2 bg-[#1D9E75] text-white text-[11px] uppercase tracking-wide font-semibold px-3 py-2">
//             <span>Medicine</span>
//             <span>Dosage</span>
//             <span>Frequency</span>
//             <span>Days</span>
//           </div>

//           {p.medicines?.map((m, i) => (
//             <div
//               key={m.id ?? i}
//               className={`grid grid-cols-[2fr_0.8fr_1.3fr_0.7fr] gap-2 px-3 py-3 text-sm border-t border-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
//                 }`}
//             >
//               <div>
//                 <p className="font-medium text-gray-900 mb-1 break-words">
//                   {m.medicineName}
//                 </p>

//                 <span className="text-[11px] text-gray-500 bg-gray-200 px-2 py-[2px] rounded-full inline-block">
//                   {m.type} · {m.routes}
//                 </span>

//                 {m.instructions && (
//                   <p className="text-[11px] text-amber-500 mt-1 break-words">
//                     ⚠ {m.instructions}
//                   </p>
//                 )}
//               </div>

//               <span className="text-gray-700">
//                 {m.dosage}
//               </span>

//               <span className="text-gray-700 break-words">
//                 {formatFrequency(m.frequency)}
//               </span>

//               <span className="text-gray-700">
//                 {m.duration}d
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Mobile Cards */}
//         <div className="flex flex-col gap-3 md:hidden">
//           {p.medicines?.map((m, i) => (
//             <div
//               key={m.id ?? i}
//               className="border border-gray-200 rounded-xl p-4 bg-white"
//             >
//               <div className="flex items-start justify-between gap-3 mb-2">

//                 <div className="min-w-0">
//                   <p className="font-semibold text-gray-900 break-words">
//                     {m.medicineName}
//                   </p>

//                   <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
//                     {m.type} · {m.routes}
//                   </span>
//                 </div>

//                 <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                   {m.duration}d
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-3 mt-3">

//                 <div>
//                   <p className="text-[11px] text-gray-500 mb-1">
//                     Dosage
//                   </p>

//                   <p className="text-sm text-gray-800">
//                     {m.dosage}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-[11px] text-gray-500 mb-1">
//                     Frequency
//                   </p>

//                   <p className="text-sm text-gray-800 break-words">
//                     {formatFrequency(m.frequency)}
//                   </p>
//                 </div>
//               </div>

//               {m.instructions && (
//                 <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
//                   <p className="text-[11px] text-amber-700 break-words">
//                     ⚠ {m.instructions}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <button
//           onClick={() => downloadPDF(p, doctorName)}
//           className="mt-5 w-full bg-[#1D9E75] text-white border-none rounded-xl py-3 text-sm font-medium cursor-pointer"
//         >
//           ⬇ Download PDF
//         </button>
//       </div>
//     </div>
//   </div>
// );


// const Reports = () => {
//   const [reports, setReports] = useState<PrescriptionDTO[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selected, setSelected] = useState<PrescriptionDTO | null>(null);
//   const [search, setSearch] = useState("");

//   const user = useSelector((state: any) => state.user);
//   const doctorName: string = user?.name ?? "Doctor";
//   // const doctorId = localStorage.getItem("doctorId") ?? user?.id;
//   const doctorId = user?.profileId;

//   console.log("user from redux:", JSON.stringify(user));

//   useEffect(() => {
//     if (!doctorId) {
//       setError("Doctor ID not found. Please logout and login again.");
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     getPrescriptionsByDoctor(doctorId)
//       .then(async (data: PrescriptionDTO[]) => {
//         const enriched = await Promise.all(
//           data.map(async (p) => {
//             try {
//               const patient = await getPatient(p.patientId);
//               return {
//                 ...p,
//                 patientName: patient.name,
//                 patientEmail: patient.email,
//                 patientPhone: patient.phoneNo,
//                 patientBloodGroup: patient.bloodGroup,
//                 patientAddress: patient.address,
//               };
//             } catch {
//               return { ...p, patientName: `Patient #${p.patientId}` };
//             }
//           })
//         );
//         setReports(enriched);
//         setLoading(false);
//       })
//       .catch((err: any) => {
//         console.error(err);
//         setError("Failed to load reports");
//         setLoading(false);
//       });
//   }, [doctorId]);

//   const filtered = reports.filter(
//     (r) =>
//       search === "" ||
//       r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
//       String(r.patientId).includes(search) ||
//       String(r.appointmentId).includes(search) ||
//       r.prescriptionNotes?.toLowerCase().includes(search.toLowerCase()) ||
//       r.medicines?.some((m) => m.medicineName?.toLowerCase().includes(search.toLowerCase()))
//   );

//   const thisMonth = reports.filter((r) => {
//     const d = new Date(r.prescriptionDate), now = new Date();
//     return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//   }).length;

//   return (
//     <div
//       style={{
//         padding: window.innerWidth < 640 ? 14 : 24,
//         fontFamily: "'Segoe UI', sans-serif",
//         width: "100%",
//         boxSizing: "border-box",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           marginBottom: 22,
//         }}
//       >
//         <h2
//           style={{
//             fontSize: window.innerWidth < 640 ? 18 : 22,
//             fontWeight: 600,
//             color: "#111827",
//             margin: 0,
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//             flexWrap: "wrap",
//           }}
//         >
//           <span
//             style={{
//               width: 36,
//               height: 36,
//               background: "#E1F5EE",
//               borderRadius: 8,
//               display: "inline-flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 18,
//               flexShrink: 0,
//             }}
//           >
//             📋
//           </span>

//           <span>Prescription Reports</span>
//         </h2>
//       </div>

//       {/* Stats */}
//       {!loading && !error && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns:
//               window.innerWidth < 640
//                 ? "1fr"
//                 : window.innerWidth < 900
//                   ? "repeat(2,1fr)"
//                   : "repeat(3,1fr)",
//             gap: 12,
//             marginBottom: 18,
//           }}
//         >
//           {[
//             ["Total Prescriptions", reports.length],
//             ["This Month", thisMonth],
//             ["Unique Patients", new Set(reports.map((r) => r.patientId)).size],
//           ].map(([label, value]) => (
//             <div
//               key={String(label)}
//               style={{
//                 background: "#f9fafb",
//                 borderRadius: 10,
//                 padding: window.innerWidth < 640 ? "12px 14px" : "14px 16px",
//                 border: "1px solid #f0f0f0",
//                 minWidth: 0,
//               }}
//             >
//               <p
//                 style={{
//                   fontSize: 12,
//                   color: "#9ca3af",
//                   marginBottom: 6,
//                 }}
//               >
//                 {label}
//               </p>

//               <p
//                 style={{
//                   fontSize: window.innerWidth < 640 ? 22 : 26,
//                   fontWeight: 600,
//                   color: "#111827",
//                   margin: 0,
//                   wordBreak: "break-word",
//                 }}
//               >
//                 {value}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Search */}
//       {!loading && !error && reports.length > 0 && (
//         <input
//           type="text"
//           placeholder="🔍 Patient name, medicine, or notes..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{
//             width: "100%",
//             padding: window.innerWidth < 640 ? "11px 12px" : "10px 14px",
//             borderRadius: 9,
//             border: "1px solid #e5e7eb",
//             fontSize: 14,
//             marginBottom: 14,
//             outline: "none",
//             color: "#111827",
//             background: "#fff",
//             boxSizing: "border-box",
//           }}
//         />
//       )}

//       {/* Loading */}
//       {loading && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//             color: "#6b7280",
//             fontSize: 14,
//             flexWrap: "wrap",
//           }}
//         >
//           <span
//             style={{
//               width: 18,
//               height: 18,
//               border: "2px solid #1D9E75",
//               borderTopColor: "transparent",
//               borderRadius: "50%",
//               display: "inline-block",
//               animation: "spin 0.7s linear infinite",
//             }}
//           />

//           Loading prescriptions...

//           <style>
//             {`
//             @keyframes spin{
//               to{
//                 transform:rotate(360deg)
//               }
//             }
//           `}
//           </style>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div
//           style={{
//             background: "#fef2f2",
//             border: "1px solid #fecaca",
//             borderRadius: 8,
//             padding: "12px 16px",
//             color: "#dc2626",
//             fontSize: 14,
//             wordBreak: "break-word",
//           }}
//         >
//           ⚠ {error}
//         </div>
//       )}

//       {/* Empty */}
//       {!loading && !error && filtered.length === 0 && (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "48px 16px",
//             color: "#9ca3af",
//             fontSize: 14,
//           }}
//         >
//           {search
//             ? "No prescription find for this search."
//             : "No any prescription."}
//         </div>
//       )}

//       {/* Cards */}
//       {!loading && !error && (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 10,
//           }}
//         >
//           {filtered.map((r) => (
//             <div
//               key={r.id}
//               onClick={() => setSelected(r)}
//               style={{
//                 background: "#fff",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: 12,
//                 padding: window.innerWidth < 640 ? "14px" : "14px 18px",
//                 cursor: "pointer",
//                 transition: "border-color 0.15s, box-shadow 0.15s",
//                 width: "100%",
//                 boxSizing: "border-box",
//                 overflow: "hidden",
//               }}
//               onMouseEnter={(e) => {
//                 (e.currentTarget as HTMLDivElement).style.borderColor =
//                   "#1D9E75";
//                 (e.currentTarget as HTMLDivElement).style.boxShadow =
//                   "0 2px 12px rgba(29,158,117,0.1)";
//               }}
//               onMouseLeave={(e) => {
//                 (e.currentTarget as HTMLDivElement).style.borderColor =
//                   "#e5e7eb";
//                 (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection:
//                     window.innerWidth < 768 ? "column" : "row",
//                   justifyContent: "space-between",
//                   alignItems:
//                     window.innerWidth < 768 ? "stretch" : "flex-start",
//                   gap: 14,
//                 }}
//               >
//                 {/* Left */}
//                 <div
//                   style={{
//                     flex: 1,
//                     minWidth: 0,
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "flex-start",
//                       gap: 10,
//                       marginBottom: 8,
//                       minWidth: 0,
//                     }}
//                   >
//                     <span
//                       style={{
//                         width: 36,
//                         height: 36,
//                         borderRadius: "50%",
//                         background: "#E1F5EE",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: 13,
//                         fontWeight: 600,
//                         color: "#0F6E56",
//                         flexShrink: 0,
//                       }}
//                     >
//                       {r.patientName
//                         ? r.patientName.charAt(0).toUpperCase()
//                         : "P"}
//                     </span>

//                     <div
//                       style={{
//                         minWidth: 0,
//                         width: "100%",
//                       }}
//                     >
//                       <p
//                         style={{
//                           fontSize: 14,
//                           fontWeight: 600,
//                           color: "#111827",
//                           margin: 0,
//                           wordBreak: "break-word",
//                         }}
//                       >
//                         {r.patientName ?? `Patient #${r.patientId}`}
//                       </p>

//                       <p
//                         style={{
//                           fontSize: 12,
//                           color: "#9ca3af",
//                           margin: 0,
//                           wordBreak: "break-word",
//                           lineHeight: 1.5,
//                         }}
//                       >
//                         {r.patientEmail ?? ""} · Appointment #
//                         {r.appointmentId}
//                       </p>
//                     </div>
//                   </div>

//                   {r.medicines?.length > 0 && (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: 5,
//                       }}
//                     >
//                       {r.medicines.slice(0, 4).map((m, i) => (
//                         <span
//                           key={i}
//                           style={{
//                             fontSize: 11,
//                             background: "#f3f4f6",
//                             color: "#4b5563",
//                             padding: "4px 9px",
//                             borderRadius: 99,
//                             border: "1px solid #e5e7eb",
//                             maxWidth: "100%",
//                             wordBreak: "break-word",
//                           }}
//                         >
//                           {m.medicineName}
//                         </span>
//                       ))}

//                       {r.medicines.length > 4 && (
//                         <span
//                           style={{
//                             fontSize: 11,
//                             color: "#9ca3af",
//                             padding: "4px",
//                           }}
//                         >
//                           +{r.medicines.length - 4} more
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   {r.prescriptionNotes && (
//                     <p
//                       style={{
//                         fontSize: 12,
//                         color: "#6b7280",
//                         marginTop: 8,
//                         paddingTop: 8,
//                         borderTop: "1px solid #f0f0f0",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         display: "-webkit-box",
//                         WebkitLineClamp:
//                           window.innerWidth < 640 ? 3 : 1,
//                         WebkitBoxOrient: "vertical",
//                         lineHeight: 1.5,
//                         wordBreak: "break-word",
//                       }}
//                     >
//                       📝 {r.prescriptionNotes}
//                     </p>
//                   )}
//                 </div>

//                 {/* Right */}
//                 <div
//                   style={{
//                     textAlign:
//                       window.innerWidth < 768 ? "left" : "right",
//                     flexShrink: 0,
//                     minWidth:
//                       window.innerWidth < 768 ? "100%" : 130,
//                     display: "flex",
//                     flexDirection:
//                       window.innerWidth < 768 ? "row" : "column",
//                     justifyContent:
//                       window.innerWidth < 768
//                         ? "space-between"
//                         : "flex-start",
//                     alignItems:
//                       window.innerWidth < 768
//                         ? "center"
//                         : "flex-end",
//                     gap: window.innerWidth < 768 ? 10 : 0,
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <div>
//                     <span
//                       style={{
//                         background: "#E1F5EE",
//                         color: "#0F6E56",
//                         fontSize: 12,
//                         padding: "4px 10px",
//                         borderRadius: 6,
//                         fontWeight: 500,
//                         display: "inline-block",
//                         marginBottom: 4,
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {formatDate(r.prescriptionDate)}
//                     </span>

//                     <div
//                       style={{
//                         fontSize: 12,
//                         color: "#9ca3af",
//                       }}
//                     >
//                       {r.medicines?.length ?? 0} medicines
//                     </div>
//                   </div>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       downloadPDF(r, doctorName);
//                     }}
//                     style={{
//                       marginTop:
//                         window.innerWidth < 768 ? 0 : 6,
//                       background: "transparent",
//                       border: "1px solid #1D9E75",
//                       color: "#1D9E75",
//                       borderRadius: 6,
//                       padding: "7px 12px",
//                       fontSize: 11,
//                       cursor: "pointer",
//                       fontWeight: 500,
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     ⬇ PDF
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selected && (
//         <PrescriptionModal
//           prescription={selected}
//           onClose={() => setSelected(null)}
//           doctorName={doctorName}
//         />
//       )}
//     </div>
//   );
// };

// export default Reports;
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { downloadPrescriptionPdf, getPrescriptionsByDoctor } from "../../../service/AppointmentService";
import { getPatient } from "../../../service/PatientProfileService";
import { IconReceipt } from "@tabler/icons-react";

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
  archived: boolean;
  s3Key?: string;
}

const formatFrequency = (freq: string): string => {
  const map: Record<string, string> = {
    "1-0-0": "Morning only", "0-1-0": "Afternoon only", "0-0-1": "Night only",
    "1-1-0": "Morning & Afternoon", "1-0-1": "Morning & Night",
    "0-1-1": "Afternoon & Night", "1-1-1": "3x daily",
  };
  return map[freq] ?? freq;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const formatBloodGroup = (bg: string) =>
  bg?.replace("_POSITIVE", " +ve").replace("_NEGATIVE", " -ve") ?? "";

type DateFilter = "all" | "1m";



const downloadPDF = async (
  prescriptionId: number,
  patientName: string
): Promise<void> => {
  try {
    const blob: Blob = await downloadPrescriptionPdf(prescriptionId);

    const url = window.URL.createObjectURL(blob);

    const link: HTMLAnchorElement = document.createElement("a");

    link.href = url;

    const safeName: string = patientName
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    link.download = `Prescription-${safeName}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error("PDF download failed:", error);
    alert("Failed to download prescription PDF");
  }
};
// const downloadPDF = (p: PrescriptionDTO, doctorName: string) => {
//   const win = window.open("", "_blank");
//   if (!win) return;
//   const rows = p.medicines?.map((m, i) => `
//     <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
//       <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">
//         <strong style="display:block;color:#111827">${m.medicineName}</strong>
//         <span style="font-size:12px;color:#6b7280">${m.type} · ${m.routes}</span>
//       </td>
//       <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.dosage}</td>
//       <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${formatFrequency(m.frequency)}</td>
//       <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.duration} days</td>
//       <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.instructions ?? "—"}</td>
//     </tr>`).join("");

//   win.document.write(`<!DOCTYPE html><html><head><title>Prescription #${p.id}</title>
//   <style>
//     *{margin:0;padding:0;box-sizing:border-box}
//     body{font-family:'Segoe UI',sans-serif;color:#111827;padding:40px}
//     .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #1D9E75}
//     .logo{font-size:24px;font-weight:700;color:#1D9E75}.logo span{color:#111827}
//     .rx{background:#E1F5EE;color:#0F6E56;font-size:28px;font-weight:700;padding:4px 16px;border-radius:8px;display:inline-block;margin-bottom:6px}
//     .patient-box{background:#f0fdf7;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:24px}
//     .patient-title{font-size:12px;color:#0F6E56;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px}
//     .patient-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
//     .info-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
//     .info-value{font-size:15px;font-weight:600}
//     .notes{background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px}
//     table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px}
//     thead tr{background:#1D9E75}
//     thead th{padding:10px 12px;text-align:left;font-size:12px;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
//     .footer{margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-end}
//     .sign-box{text-align:center}.sign-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:6px}
//     .sign-line{border-top:1px solid #111827;width:200px;padding-top:8px;font-size:12px;color:#6b7280;text-align:center}
//     .watermark{font-size:11px;color:#9ca3af}
//     @media print{body{padding:20px}}
//   </style></head><body>
//   <div class="header">
//     <div><div class="logo">Pulse<span>Care</span></div><div style="font-size:13px;color:#6b7280;margin-top:4px">Health Management System</div></div>
//     <div style="text-align:right"><div class="rx">℞</div>
//       <div style="font-size:13px;color:#6b7280">Date: ${formatDate(p.prescriptionDate)}</div>
//       <div style="font-size:13px;color:#6b7280">Prescription ID: #${p.id}</div>
//     </div>
//   </div>
//   <div class="patient-box">
//     <div class="patient-title">Patient Information</div>
//     <div class="patient-grid">
//       <div><div class="info-label">Name</div><div class="info-value">${p.patientName ?? `Patient #${p.patientId}`}</div></div>
//       <div><div class="info-label">Email</div><div class="info-value" style="font-size:13px">${p.patientEmail ?? "—"}</div></div>
//       <div><div class="info-label">Phone</div><div class="info-value">${p.patientPhone ?? "—"}</div></div>
//       <div><div class="info-label">Blood Group</div><div class="info-value">${formatBloodGroup(p.patientBloodGroup ?? "") || "—"}</div></div>
//       <div><div class="info-label">Address</div><div class="info-value" style="font-size:13px">${p.patientAddress ?? "—"}</div></div>
//       <div><div class="info-label">Appointment ID</div><div class="info-value">#${p.appointmentId}</div></div>
//     </div>
//   </div>
//   ${p.prescriptionNotes ? `<div class="notes"><div style="font-size:12px;color:#92400e;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Doctor's Notes</div><div style="font-size:14px;line-height:1.6">${p.prescriptionNotes}</div></div>` : ""}
//   <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:10px">Prescribed Medicines (${p.medicines?.length ?? 0})</div>
//   <table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead><tbody>${rows}</tbody></table>
//   <div class="footer">
//     <div class="watermark">Generated by PulseCare HMS · ${new Date().toLocaleString("en-IN")}</div>
//     <div class="sign-box"><div class="sign-name">Dr. ${doctorName}</div><div class="sign-line">Doctor's Signature</div></div>
//   </div>
//   </body></html>`);
//   win.document.close();
//   win.focus();
//   setTimeout(() => { win.print(); win.close(); }, 500);
// };

const PrescriptionModal = ({
  prescription: p, onClose, doctorName,
}: {
  prescription: PrescriptionDTO;
  onClose: () => void;
  doctorName: string;
}) => (
  <div onClick={onClose} className="fixed inset-0 z-[1000] bg-black/55 flex items-center justify-center p-3 sm:p-4">
    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-[660px] max-h-[88vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="bg-[#E1F5EE] text-[#0F6E56] text-xs sm:text-sm font-semibold px-3 py-1 rounded-md inline-block">
              ℞ Prescription #{p.id}
            </span>
            {p.archived && (
              <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>
                📦 S3 Archived
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 break-words">
            {formatDate(p.prescriptionDate)} · Appointment #{p.appointmentId}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* <button onClick={() => downloadPDF(p, doctorName)} className="flex-1 sm:flex-none bg-[#1D9E75] text-white border-none rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium cursor-pointer">
            ⬇ Download PDF
          </button> */}
          <button
            onClick={() =>
              downloadPDF(
                p.id,
                p.patientName ?? `Patient-${p.patientId}`
              )
            }
          >
            ⬇ Download PDF
          </button>
          <button onClick={onClose} className="bg-gray-100 border-none rounded-lg px-3 py-2 text-xs sm:text-sm cursor-pointer text-gray-700">✕</button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5">
        <div className="bg-[#f0fdf7] border border-[#bbf7d0] rounded-xl p-4 mb-4">
          <p className="text-[11px] text-[#0F6E56] font-semibold uppercase tracking-wider mb-3">Patient Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["Name", p.patientName ?? `#${p.patientId}`],
              ["Email", p.patientEmail ?? "—"],
              ["Phone", p.patientPhone ?? "—"],
              ["Blood Group", formatBloodGroup(p.patientBloodGroup ?? "") || "—"],
              ["Address", p.patientAddress ?? "—"],
              ["Appointment", `#${p.appointmentId}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#f8faff] border border-[#dbeafe] rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#dbeafe] flex items-center justify-center text-sm font-bold text-[#1e40af] shrink-0">
            {doctorName?.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500">Prescribed by</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">Dr. {doctorName}</p>
          </div>
        </div>

        {p.prescriptionNotes && (
          <div className="bg-[#fffbeb] border-l-[3px] border-[#f59e0b] rounded-r-lg p-3 sm:p-4 mb-4">
            <p className="text-[11px] text-[#92400e] mb-1 font-semibold uppercase tracking-wide">Doctor's Notes</p>
            <p className="text-sm text-[#1a1a1a] leading-6 break-words">{p.prescriptionNotes}</p>
          </div>
        )}

        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Medicines ({p.medicines?.length ?? 0})
        </p>

        <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[2fr_0.8fr_1.3fr_0.7fr] gap-2 bg-[#1D9E75] text-white text-[11px] uppercase tracking-wide font-semibold px-3 py-2">
            <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Days</span>
          </div>
          {p.medicines?.map((m, i) => (
            <div key={m.id ?? i} className={`grid grid-cols-[2fr_0.8fr_1.3fr_0.7fr] gap-2 px-3 py-3 text-sm border-t border-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
              <div>
                <p className="font-medium text-gray-900 mb-1 break-words">{m.medicineName}</p>
                <span className="text-[11px] text-gray-500 bg-gray-200 px-2 py-[2px] rounded-full inline-block">{m.type} · {m.routes}</span>
                {m.instructions && <p className="text-[11px] text-amber-500 mt-1 break-words">⚠ {m.instructions}</p>}
              </div>
              <span className="text-gray-700">{m.dosage}</span>
              <span className="text-gray-700 break-words">{formatFrequency(m.frequency)}</span>
              <span className="text-gray-700">{m.duration}d</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {p.medicines?.map((m, i) => (
            <div key={m.id ?? i} className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 break-words">{m.medicineName}</p>
                  <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">{m.type} · {m.routes}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{m.duration}d</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><p className="text-[11px] text-gray-500 mb-1">Dosage</p><p className="text-sm text-gray-800">{m.dosage}</p></div>
                <div><p className="text-[11px] text-gray-500 mb-1">Frequency</p><p className="text-sm text-gray-800 break-words">{formatFrequency(m.frequency)}</p></div>
              </div>
              {m.instructions && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-[11px] text-amber-700 break-words">⚠ {m.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* <button onClick={() => downloadPDF(p, doctorName)} className="mt-5 w-full bg-[#1D9E75] text-white border-none rounded-xl py-3 text-sm font-medium cursor-pointer">
          ⬇ Download PDF
        </button> */}
        <button
          onClick={() =>
            downloadPDF(
              p.id,
              p.patientName ?? `Patient-${p.patientId}`
            )
          }
        >
          ⬇ Download PDF
        </button>
      </div>
    </div>
  </div>
);

const Reports = () => {
  const [reports, setReports] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PrescriptionDTO | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const user = useSelector((state: any) => state.user);
  const doctorName: string = user?.name ?? "Doctor";
  const doctorId = user?.profileId;

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

  const filtered = reports.filter((r) => {
    const matchSearch =
      search === "" ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.patientId).includes(search) ||
      String(r.appointmentId).includes(search) ||
      r.prescriptionNotes?.toLowerCase().includes(search.toLowerCase()) ||
      r.medicines?.some((m) => m.medicineName?.toLowerCase().includes(search.toLowerCase()));

    const matchArchived = dateFilter === "1m" ? r.archived : !r.archived;

    return matchSearch && matchArchived;
  });

  const currentCount = reports.filter((r) => !r.archived).length;
  const archivedCount = reports.filter((r) => r.archived).length;
  const uniquePatients = new Set(reports.filter((r) => !r.archived).map((r) => r.patientId)).size;

  return (
    <div style={{ padding: window.innerWidth < 640 ? 14 : 24, fontFamily: "'Segoe UI', sans-serif", width: "100%", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: window.innerWidth < 640 ? 18 : 22, fontWeight: 600, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ width: 36, height: 36, background: "#E1F5EE", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            <IconReceipt />
          </span>
          <span>Prescription Reports</span>
        </h2>
      </div>

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 640 ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
          {[
            ["Total", reports.length, "#111827"],
            ["Current", currentCount, "#1D9E75"],
            ["Archived (S3)", archivedCount, "#92400E"],
            ["Unique Patients", uniquePatients, "#111827"],
          ].map(([label, value, color]) => (
            <div key={String(label)} style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #f0f0f0", minWidth: 0 }}>
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: window.innerWidth < 640 ? 22 : 26, fontWeight: 600, color: color as string, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div style={{ marginBottom: 14 }}>

          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input
              type="text"
              placeholder="🔍 Patient name, medicine, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", paddingRight: search ? 36 : 14, borderRadius: 9, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", color: "#111827", background: "#fff", boxSizing: "border-box" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16 }}
              >✕</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f9fafb", borderRadius: 8, padding: "4px 6px", border: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 12, color: "#9ca3af", padding: "0 4px" }}></span>
              {(["all", "1m"] as DateFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  style={{
                    background: dateFilter === f ? "#1D9E75" : "transparent",
                    color: dateFilter === f ? "#fff" : "#6b7280",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: dateFilter === f ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f === "all" ? "All Time" : "Last 1 Month"}
                </button>
              ))}
            </div>

            {/* {dateFilter === "1m" ? (
              <span style={{ fontSize: 11, color: "#92400E", background: "#FEF3C7", padding: "4px 10px", borderRadius: 6, fontWeight: 500 }}>
                 Showing S3 archived records
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "#0F6E56", background: "#E1F5EE", padding: "4px 10px", borderRadius: 6, fontWeight: 500 }}>
                🗂 Showing current records
              </span>
            )} */}

            {/* Clear search */}
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 12, cursor: "pointer", padding: "6px 4px", whiteSpace: "nowrap" }}
              >
                ✕ Clear
              </button>
            )}

            {/* Result count */}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
              {filtered.length} prescription{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
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
          {dateFilter === "1m"
            ? "No archived prescriptions found."
            : search
              ? "No prescriptions match your search."
              : "No prescriptions found yet."}
        </div>
      )}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              style={{
                background: r.archived ? "#FFFBEB" : "#fff",
                border: r.archived ? "1px solid #FCD34D" : "1px solid #e5e7eb",
                borderRadius: 12,
                padding: window.innerWidth < 640 ? "14px" : "14px 18px",
                cursor: "pointer",
                transition: "border-color 0.15s, box-shadow 0.15s",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = r.archived ? "#F59E0B" : "#1D9E75";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = r.archived ? "#FCD34D" : "#e5e7eb";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", flexDirection: window.innerWidth < 768 ? "column" : "row", justifyContent: "space-between", alignItems: window.innerWidth < 768 ? "stretch" : "flex-start", gap: 14 }}>

                {/* Left */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", background: r.archived ? "#FEF3C7" : "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: r.archived ? "#92400E" : "#0F6E56", flexShrink: 0 }}>
                      {r.patientName ? r.patientName.charAt(0).toUpperCase() : "P"}
                    </span>
                    <div style={{ minWidth: 0, width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, wordBreak: "break-word" }}>
                          {r.patientName ?? `Patient #${r.patientId}`}
                        </p>
                        {r.archived && (
                          <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99 }}>
                            {/* 📦 S3 */}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, wordBreak: "break-word" }}>
                        {r.patientEmail ?? ""} · Appointment #{r.appointmentId}
                      </p>
                    </div>
                  </div>

                  {r.medicines?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {r.medicines.slice(0, 4).map((m, i) => (
                        <span key={i} style={{ fontSize: 11, background: "#f3f4f6", color: "#4b5563", padding: "4px 9px", borderRadius: 99, border: "1px solid #e5e7eb", wordBreak: "break-word" }}>
                          {m.medicineName}
                        </span>
                      ))}
                      {r.medicines.length > 4 && (
                        <span style={{ fontSize: 11, color: "#9ca3af", padding: "4px" }}>
                          +{r.medicines.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {r.prescriptionNotes && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f0f0", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: window.innerWidth < 640 ? 3 : 1, WebkitBoxOrient: "vertical", wordBreak: "break-word" }}>
                      📝 {r.prescriptionNotes}
                    </p>
                  )}
                </div>

                {/* Right */}
                <div style={{ textAlign: window.innerWidth < 768 ? "left" : "right", flexShrink: 0, minWidth: window.innerWidth < 768 ? "100%" : 130, display: "flex", flexDirection: window.innerWidth < 768 ? "row" : "column", justifyContent: window.innerWidth < 768 ? "space-between" : "flex-start", alignItems: window.innerWidth < 768 ? "center" : "flex-end", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <span style={{ background: r.archived ? "#FEF3C7" : "#E1F5EE", color: r.archived ? "#92400E" : "#0F6E56", fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 500, display: "inline-block", marginBottom: 4, whiteSpace: "nowrap" }}>
                      {formatDate(r.prescriptionDate)}
                    </span>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {r.medicines?.length ?? 0} medicines
                    </div>
                  </div>
                  {/* <button
                    onClick={(e) => { e.stopPropagation(); downloadPDF(r, doctorName); }}
                    style={{ background: "transparent", border: "1px solid #1D9E75", color: "#1D9E75", borderRadius: 6, padding: "7px 12px", fontSize: 11, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}
                  >
                    ⬇ PDF
                  </button> */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPDF(
                        r.id,
                        r.patientName ?? `Patient-${r.patientId}`
                      );
                    }}
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