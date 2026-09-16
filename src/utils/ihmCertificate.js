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
  // A trail entry can pass its own range and number (the ANNUAL certificate
  // spans several months).
  const from = opts.periodFrom ? new Date(opts.periodFrom) : firstOfMonth(periodBase);
  const till = opts.periodTill ? new Date(opts.periodTill) : lastOfMonth(periodBase);

  return {
    vesselName: vessel?.vesselName || "-",
    imoNumber: vessel?.imoNumber || "-",
    vesselType: vessel?.vesselType || "-",
    grt: vessel?.grossTonnageMT ?? "-",
    periodFrom: fmtDate(from),
    periodTill: fmtDate(till),
    issuedOn: fmtDate(issueDate),
    certificateNo: opts.certificateNo || buildCertificateNo(vessel?.imoNumber || "-", periodBase),
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
  const suffix = opts.fileSuffix ? `_${opts.fileSuffix}` : "";
  doc.save(`IHM_Maintenance_Certificate_${safeName}_${data.imoNumber}${suffix}.pdf`);
  return data;
}

// ---- certificate trail ---------------------------------------------------

// "01-Jul-2026", as in the certificate list.
export const fmtListDate = (d) => `${pad2(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;

const mmyy = (d) => `${pad2(d.getMonth() + 1)}${String(d.getFullYear()).slice(-2)}`;

/**
 * Every maintenance certificate a vessel has, newest first:
 * - one per calendar month from the Maintenance Start Date to the current month
 *   (number VS/HCS/{imo}/{MMYY}{MMYY}/M{month});
 * - an ANNUAL one for the initial IHM, from the IHM Survey Start Date to the end
 *   of the month before maintenance started (VS/HCS/{imo}/{MMYY}{MMYY}/ANNUAL).
 * `period` ("2026-07" / "ANNUAL") keys the saved active state.
 */
export function buildCertificateTrail(vessel, now = new Date()) {
  const imo = vessel?.imoNumber || "-";
  const trail = [];
  const maintStart = vessel?.maintenanceStartDate ? firstOfMonth(new Date(vessel.maintenanceStartDate)) : null;

  if (maintStart && !Number.isNaN(maintStart.getTime())) {
    const lastMonth = firstOfMonth(now);
    for (let d = new Date(maintStart); d <= lastMonth; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      trail.push({
        period: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`,
        kind: "monthly",
        certificateNo: buildCertificateNo(imo, d),
        from: firstOfMonth(d),
        till: lastOfMonth(d),
      });
    }
    trail.reverse();
  }

  const surveyStart = vessel?.ihmSurveyStartDate ? new Date(vessel.ihmSurveyStartDate) : null;
  if (surveyStart && maintStart && surveyStart < maintStart) {
    const till = new Date(maintStart.getFullYear(), maintStart.getMonth(), 0);
    if (surveyStart <= till) {
      trail.push({
        period: "ANNUAL",
        kind: "annual",
        certificateNo: `VS/HCS/${imo}/${mmyy(surveyStart)}${mmyy(till)}/ANNUAL`,
        from: surveyStart,
        till,
      });
    }
  }
  return trail;
}

/** Certificate PDF for one trail entry. */
export function downloadTrailCertificate(vessel, entry) {
  return downloadIHMMaintenanceCertificate(vessel, {
    periodDate: entry.from,
    periodFrom: entry.from,
    periodTill: entry.till,
    certificateNo: entry.certificateNo,
    fileSuffix: entry.period,
  });
}

// PO dates are stored as text, "DD/MM/YYYY" from the PO upload.
export const parsePoDate = (value) => {
  if (!value) return null;
  const m = String(value).trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  const d = m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// The month a PO was reviewed in: received date, else order date, else upload.
export const poReviewDate = (po) =>
  parsePoDate(po.orderRcvDate) || parsePoDate(po.orderDate) || (po.createdAt ? new Date(po.createdAt) : null);

/** POs reviewed within a trail entry's period. */
export const posForEntry = (pos, entry) =>
  (pos ?? []).filter((po) => {
    const d = poReviewDate(po);
    return d && d >= entry.from && d <= new Date(entry.till.getFullYear(), entry.till.getMonth(), entry.till.getDate(), 23, 59, 59);
  });

/** Appendix 1: the purchase orders reviewed in the certificate's period. */
export function downloadTrailAppendix(vessel, entry, pos) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const navy = [31, 55, 99];
  const black = [33, 33, 33];
  const grey = [110, 110, 110];

  const header = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...navy);
    doc.text("Appendix 1 - Purchase Orders Reviewed", margin, margin + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...black);
    doc.text(
      `${vessel?.vesselName || "-"} - IMO ${vessel?.imoNumber || "-"}   |   Certificate ${entry.certificateNo}   |   Period ${fmtListDate(entry.from)} to ${fmtListDate(entry.till)}`,
      margin,
      margin + 8
    );
    doc.setDrawColor(150);
    doc.line(margin, margin + 11, pageW - margin, margin + 11);
  };

  const cols = [
    ["PO No", 30], ["Supplier", 52], ["Order Date", 24], ["Received", 24], ["Reference No", 32],
    ["Items", 14], ["Hazmat Items", 22], ["MD/SDoC Status", 32], ["Items that may contain hazmat", 39],
  ];
  const drawRow = (cells, y, bold) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    let x = margin;
    let height = 6;
    const wrapped = cells.map((text, i) => doc.splitTextToSize(String(text ?? "-"), cols[i][1] - 2));
    wrapped.forEach((lines) => { height = Math.max(height, lines.length * 4 + 2); });
    wrapped.forEach((lines, i) => {
      doc.text(lines, x + 1, y + 4);
      x += cols[i][1];
    });
    doc.setDrawColor(215);
    doc.line(margin, y + height, pageW - margin, y + height);
    return y + height;
  };

  header();
  let y = margin + 15;
  doc.setFontSize(9);
  doc.setTextColor(...black);
  y = drawRow(cols.map((c) => c[0]), y, true);

  const isYes = (v) => String(v ?? "").toUpperCase() === "YES";
  pos.forEach((po) => {
    const items = po.items || [];
    const hazmatItems = items.filter((i) => isYes(i.canContainHazmat));
    const cells = [
      po.poNumber, po.supplier, po.orderDate, po.orderRcvDate, po.referenceNumber,
      items.length, hazmatItems.length,
      String(po.docStatus || "not_started").replace(/_/g, " "),
      hazmatItems.map((i) => i.product || i.partDescription).filter(Boolean).join(", ") || "-",
    ];
    if (y > pageH - margin - 14) {
      doc.addPage();
      header();
      y = drawRow(cols.map((c) => c[0]), margin + 15, true);
    }
    y = drawRow(cells, y, false);
  });

  doc.setFontSize(8.5);
  doc.setTextColor(...grey);
  doc.text(`${pos.length} purchase order${pos.length === 1 ? "" : "s"} reviewed. Generated ${fmtListDate(new Date())}.`, margin, pageH - 8);

  const safeName = String(vessel?.vesselName || "Vessel").replace(/[^\w]+/g, "_");
  doc.save(`IHM_Certificate_Appendix_${safeName}_${vessel?.imoNumber || ""}_${entry.period}.pdf`);
}
