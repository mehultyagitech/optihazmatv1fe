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

// Appendix reference: {ddmmyy}_{hhmmss}_{imo}
const buildAppendixRef = (issueDate, imo) => {
  const dd = pad2(issueDate.getDate());
  const mm = pad2(issueDate.getMonth() + 1);
  const yy = String(issueDate.getFullYear()).slice(-2);
  const hh = pad2(issueDate.getHours());
  const mi = pad2(issueDate.getMinutes());
  const ss = pad2(issueDate.getSeconds());
  return `${dd}${mm}${yy}_${hh}${mi}${ss}_${imo}`;
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
    appendixRef: buildAppendixRef(issueDate, vessel?.imoNumber || "-"),
  };
}

// OptiHazmat mark (ship in plan view with a hazmat placard pinned on it),
// drawn in the 64-unit grid of public/brand/optihazmat-mark.svg.
const drawBrandMark = (doc, x, y, size, hull, point) => {
  const k = size / 64;
  const X = (v) => x + v * k;
  const Y = (v) => y + v * k;
  doc.setLineCap("round");
  doc.setLineJoin("round");
  doc.setDrawColor(...hull);
  doc.setLineWidth(4 * k);
  // Hull: from the deck gap round the stern to the bow and back.
  doc.lines(
    [
      [-11, 0],
      [-3, 3],
      [0, 16],
      [3, 3],
      [27, 0],
      [11, 0, 19, -4, 24, -11],
      [-5, -7, -13, -11, -24, -11],
      [-4, 0],
    ].map((seg) => seg.map((v) => v * k)),
    X(20),
    Y(33),
    [1, 1],
    "S",
    false
  );
  doc.setFillColor(...point);
  doc.setDrawColor(...point);
  doc.setLineWidth(2 * k);
  doc.lines([[10, 10], [-10, 10], [-10, -10]].map((seg) => seg.map((v) => v * k)), X(26), Y(6), [1, 1], "FD", true);
  doc.setLineWidth(3 * k);
  doc.line(X(26), Y(26), X(26), Y(41));
  doc.circle(X(26), Y(44), 4 * k, "F");
};

/**
 * Build the IHM Maintenance Certificate as a jsPDF document (no download).
 * Landscape A4, laid out like the client's existing certificates.
 * Returns { doc, data }.
 */
export function buildCertificatePdf(vessel, opts = {}) {
  const d = buildCertificateData(vessel, opts);

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth(); // 297
  const H = doc.internal.pageSize.getHeight(); // 210

  const navy = [36, 52, 94];
  const ink = [40, 40, 40];
  const teal = [38, 110, 140];
  const frame = [176, 190, 214];

  const M = 18; // content margin
  const cx = W / 2;

  // --- Thin double frame ---
  doc.setDrawColor(...frame);
  doc.setLineWidth(0.35);
  doc.rect(4, 4, W - 8, H - 8);
  doc.setLineWidth(0.2);
  doc.rect(5.5, 5.5, W - 11, H - 11);

  // --- Header: logo (left), company block (right) ---
  drawBrandMark(doc, M - 4, 11, 20, [13, 71, 161], [245, 124, 0]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(13, 71, 161);
  doc.text("OptiHazmat", M + 18, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...teal);
  doc.text("shipping IHM services", M + 18.5, 28);

  const rx = W - M;
  doc.setFontSize(8);
  doc.setTextColor(...ink);
  doc.text("OPTIHAZMAT PTE LTD", rx, 15, { align: "right" });
  doc.text("16 Raffles Quay, #33-03 Hong Leong Building Singapore 048581", rx, 18.5, { align: "right" });
  doc.text("contact@optihazmat.com", rx, 24, { align: "right" });
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...teal);
  doc.text("www.optihazmat.com", rx, 29.5, { align: "right" });

  // --- Double rule ---
  doc.setDrawColor(...frame);
  doc.setLineWidth(0.3);
  doc.line(5.5, 40, W - 5.5, 40);
  doc.line(5.5, 41.2, W - 5.5, 41.2);

  // --- Certificate no. (left) and appendix reference (right) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...navy);
  doc.text(`Certificate No: ${d.certificateNo}`, M - 4, 49.5);
  doc.setFontSize(9.5);
  doc.text(`Please refer to appendix 1 (${d.appendixRef})`, W - M - 8, 49.5, { align: "right" });

  // --- Title ---
  doc.setFontSize(19);
  doc.text("IHM Maintenance Certificate", cx, 60, { align: "center" });

  // --- Issued by ---
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  {
    const a = "Issued by ";
    const b = "OPTIHAZMAT PTE LTD.";
    const c = "  to";
    doc.setFont("helvetica", "normal");
    const wa = doc.getTextWidth(a);
    const wc = doc.getTextWidth(c);
    doc.setFont("helvetica", "italic");
    const wb = doc.getTextWidth(b);
    const startX = cx - (wa + wb + wc) / 2;
    doc.setFont("helvetica", "normal");
    doc.text(a, startX, 72);
    doc.setFont("helvetica", "italic");
    doc.text(b, startX + wa, 72);
    doc.setFont("helvetica", "normal");
    doc.text(c, startX + wa + wb, 72);
  }

  // --- Vessel ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const vesselLine = `${d.vesselName} - IMO Number ${d.imoNumber}`;
  let vSize = 14;
  while (doc.getTextWidth(vesselLine) > W - 2 * M && vSize > 9) {
    vSize -= 0.5;
    doc.setFontSize(vSize);
  }
  doc.text(vesselLine, cx, 82, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(`Type of Ship: ${d.vesselType}, GRT: ${d.grt}`, cx, 89, { align: "center" });

  // --- Certification statement ---
  doc.setFontSize(13);
  doc.text("This is to certify that the maintenance of IHM Part 1 of this vessel from", cx, 103, { align: "center" });
  doc.text(`${d.periodFrom} till ${d.periodTill}`, cx, 110, { align: "center" });
  doc.text("is in conformity with the following regulations and guidelines:", cx, 117, { align: "center" });

  // --- Regulations (bullets, full width, wrapped lines share an indent) ---
  const bulletX = M - 1;
  const textX = M + 5;
  let y = 131;
  doc.setFontSize(12);
  [
    "Regulation (EU) No 1257/2013 of the European Parliament and of the council of 20 November 2013 on ship recycling and amending regulation (EC) No 1013/2006 and Directive 2009/16/EC",
    "IMO MEPC.379(80) - 2023 Guidelines for the development of the inventory of hazardous materials",
    "EMSA's Best Practice Guidance on the Inventory of Hazardous Materials.",
  ].forEach((text) => {
    const lines = doc.splitTextToSize(text, W - M - 6 - textX);
    doc.setFillColor(...navy);
    doc.circle(bulletX, y - 1.3, 0.8, "F");
    doc.text(lines, textX, y);
    y += lines.length * 6 + 1;
  });

  // --- Signature (left) and issue date (right) ---
  doc.setDrawColor(...frame);
  doc.setLineWidth(0.3);
  doc.line(M - 4, 177, M + 70, 177);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text("Julien Dufour", M - 4, 183);
  doc.text("CHAIRMAN, OPTIHAZMAT PTE LTD.", M - 4, 191);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12.5);
  doc.text(`Issued on: ${d.issuedOn}`, W - M - 10, 191, { align: "right" });

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
