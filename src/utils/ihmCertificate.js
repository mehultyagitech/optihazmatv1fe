import { jsPDF } from "jspdf";

// ---- helpers -------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad2 = (n) => String(n).padStart(2, "0");

// "01 Jan 2026"
const fmtDate = (d) => `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// Certificate number: VS/HCS/{imo}/{MMYY}{MMYY}/M{month}
const buildCertificateNo = (imo, periodDate) => {
  const mmYY = `${pad2(periodDate.getMonth() + 1)}${String(periodDate.getFullYear()).slice(-2)}`;
  const monthNo = periodDate.getMonth() + 1;
  return `VS/HCS/${imo}/${mmYY}${mmYY}/M${monthNo}`;
};

// Appendix reference: {ddmmyy}_{hhmmss}_{uuid}
const buildAppendixRef = (issueDate) => {
  const dd = pad2(issueDate.getDate());
  const mm = pad2(issueDate.getMonth() + 1);
  const yy = String(issueDate.getFullYear()).slice(-2);
  const hh = pad2(issueDate.getHours());
  const mi = pad2(issueDate.getMinutes());
  const ss = pad2(issueDate.getSeconds());
  const uuid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Math.random().toString(16).slice(2, 10)}-xxxx`;
  return `${dd}${mm}${yy}_${hh}${mi}${ss}_${uuid}`;
};

// ---- public API ----------------------------------------------------------

/**
 * Build the dynamic field-set for the certificate from a vessel record.
 * Every highlighted (dynamic) field in the template is derived here.
 */
export function buildCertificateData(vessel, opts = {}) {
  const issueDate = opts.issueDate ? new Date(opts.issueDate) : new Date();
  // The certificate covers a single calendar month. Default = current month.
  const periodBase = opts.periodDate ? new Date(opts.periodDate) : issueDate;
  const from = firstOfMonth(periodBase);
  const till = lastOfMonth(periodBase);

  return {
    vesselName: vessel?.vesselName || "-",
    imoNumber: vessel?.imoNumber || "-",
    vesselType: vessel?.vesselType || "-",
    grt: vessel?.grossTonnageMT ?? "-",
    periodFrom: fmtDate(from),
    periodTill: fmtDate(till),
    issuedOn: fmtDate(issueDate),
    certificateNo: buildCertificateNo(vessel?.imoNumber || "-", periodBase),
    appendixRef: buildAppendixRef(issueDate),
  };
}

/**
 * Build the IHM Maintenance Certificate as a jsPDF document (no download).
 * Returns { doc, data }.
 */
export function buildCertificatePdf(vessel, opts = {}) {
  const d = buildCertificateData(vessel, opts);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const navy = [31, 55, 99];
  const blue = [25, 118, 210];
  const black = [33, 33, 33];

  const margin = 18;
  const contentW = pageW - margin * 2;
  const cx = pageW / 2;

  // Outer border
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.rect(margin - 6, margin - 6, contentW + 12, pageH - (margin - 6) * 2);

  let y = margin + 2;

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text("OPTIHAZMAT PTE LTD", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...black);
  doc.text("16 Raffles Quay, #33-03 Hong Leong Building Singapore 048581", margin, y);

  y += 5;
  doc.setTextColor(...blue);
  doc.text("contact@optihazmat.com", margin, y);
  y += 5;
  doc.text("www.optihazmat.com", margin, y);

  y += 4;
  doc.setDrawColor(120);
  doc.line(margin, y, pageW - margin, y);

  // --- Certificate No / appendix row ---
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...black);
  doc.text("Certificate No:", margin, y);
  // appendix note (right column)
  const apLabelX = cx + 4;
  doc.text("Please refer to appendix 1", apLabelX, y);

  y += 5;
  doc.setTextColor(...blue);
  doc.setFont("helvetica", "normal");
  doc.text(d.certificateNo, margin, y);

  // appendix ref wraps under the note, right column
  doc.setTextColor(...black);
  const apLines = doc.splitTextToSize(`(${d.appendixRef})`, pageW - margin - apLabelX);
  doc.text(apLines, apLabelX, y);

  y += 4 + (apLines.length - 1) * 4;
  doc.setDrawColor(120);
  doc.line(margin, y, pageW - margin, y);

  // --- Title ---
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...navy);
  doc.text("IHM Maintenance Certificate", cx, y, { align: "center" });

  // --- Issued by ---
  y += 12;
  doc.setFontSize(11);
  doc.setTextColor(...black);
  // "Issued by OPTIHAZMAT PTE LTD" — centered, with the org name in bold.
  {
    const a = "Issued by ";
    const b = "OPTIHAZMAT PTE LTD";
    doc.setFont("helvetica", "normal");
    const wa = doc.getTextWidth(a);
    doc.setFont("helvetica", "bold");
    const wb = doc.getTextWidth(b);
    const startX = cx - (wa + wb) / 2;
    doc.setFont("helvetica", "normal");
    doc.text(a, startX, y);
    doc.setFont("helvetica", "bold");
    doc.text(b, startX + wa, y);
  }

  // --- Vessel name + IMO (bold, dynamic) ---
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text(`${d.vesselName} – IMO Number ${d.imoNumber}`, cx, y, { align: "center" });

  // --- Type of ship / GRT ---
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text(`Type of Ship: ${d.vesselType}, GRT: ${d.grt}`, cx, y, { align: "center" });

  // --- Certify line ---
  y += 10;
  doc.text(
    "This is to certify that the maintenance of IHM Part 1 of this vessel from",
    cx,
    y,
    { align: "center" }
  );
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`${d.periodFrom} till ${d.periodTill}`, cx, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("is in conformity with the following regulations and guidelines:", cx, y, {
    align: "center",
  });

  // --- Regulations bullet list (static) ---
  y += 12;
  doc.setFontSize(10);
  const bullets = [
    "Regulation (EU) No 1257/2013 of the European Parliament and of the council of 20 November 2013 on ship recycling and amending regulation (EC) No 1013/2006 and Directive 2009/16/EC",
    "IMO MEPC.379(80) – 2023 Guidelines for the development of the inventory of hazardous materials",
    "EMSA’s Best Practice Guidance on the Inventory of Hazardous Materials.",
  ];
  const bulletIndent = margin + 6;
  bullets.forEach((text) => {
    const lines = doc.splitTextToSize(text, contentW - 6);
    doc.text("•", margin + 1, y);
    doc.text(lines, bulletIndent, y);
    y += lines.length * 5 + 3;
  });

  // --- Signature block ---
  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text("Julien Dufour", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text("CHAIRMAN, OPTIHAZMAT PTE LTD.", margin, y);

  // --- Issued on ---
  y += 12;
  doc.text(`Issued on: ${d.issuedOn}`, margin, y);

  return { doc, data: d };
}

/**
 * Generate the IHM Maintenance Certificate PDF for a vessel and trigger a
 * browser download. Returns the computed dynamic data.
 */
export function downloadIHMMaintenanceCertificate(vessel, opts = {}) {
  const { doc, data } = buildCertificatePdf(vessel, opts);
  const safeName = String(data.vesselName).replace(/[^\w]+/g, "_");
  doc.save(`IHM_Maintenance_Certificate_${safeName}_${data.imoNumber}.pdf`);
  return data;
}
