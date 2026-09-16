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
 * Returns { doc, data }.
 */
export function buildCertificatePdf(vessel, opts = {}) {
  const d = buildCertificateData(vessel, opts);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297

  const navy = [13, 71, 161];
  const ink = [33, 43, 54];
  const muted = [110, 120, 132];
  const orange = [245, 124, 0];
  const pale = [240, 245, 252];
  const line = [205, 214, 226];

  const M = 22; // content margin
  const CW = W - M * 2; // content width
  const cx = W / 2;

  // --- Frame: navy outer rule, thin inner rule, orange corner accents ---
  doc.setDrawColor(...navy);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.25);
  doc.rect(11, 11, W - 22, H - 22);
  doc.setDrawColor(...orange);
  doc.setLineWidth(1.2);
  [
    [11, 11, 1, 1],
    [W - 11, 11, -1, 1],
    [11, H - 11, 1, -1],
    [W - 11, H - 11, -1, -1],
  ].forEach(([x, y, sx, sy]) => {
    doc.line(x, y, x + 14 * sx, y);
    doc.line(x, y, x, y + 14 * sy);
  });

  // --- Header: mark + company (left), contact (right) ---
  let y = 20;
  drawBrandMark(doc, M, y, 15, navy, orange);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...navy);
  doc.text("OPTIHAZMAT PTE LTD", M + 19, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text("Inventory of Hazardous Materials Services", M + 19, y + 12);

  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  const rx = W - M;
  doc.text("16 Raffles Quay, #33-03 Hong Leong Building", rx, y + 3.5, { align: "right" });
  doc.text("Singapore 048581", rx, y + 7.5, { align: "right" });
  doc.setTextColor(...navy);
  doc.text("contact@optihazmat.com  |  www.optihazmat.com", rx, y + 11.5, { align: "right" });

  y += 19;
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.5);
  doc.line(M, y, W - M, y);

  // --- Reference boxes: certificate no. and appendix reference ---
  y += 6;
  const gap = 5;
  const boxW = (CW - gap) / 2;
  const boxH = 16;
  const refBox = (x, label, value, valueSize) => {
    doc.setFillColor(...pale);
    doc.setDrawColor(...line);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, boxW, boxH, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), x + 4, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(valueSize);
    doc.setTextColor(...navy);
    // Keep references on one line: shrink rather than wrap mid-code.
    let size = valueSize;
    while (doc.getTextWidth(value) > boxW - 8 && size > 5.5) {
      size -= 0.25;
      doc.setFontSize(size);
    }
    doc.text(value, x + 4, y + 11.8);
  };
  refBox(M, "Certificate No.", d.certificateNo, 11);
  refBox(M + boxW + gap, "Appendix 1 Reference", d.appendixRef, 8);

  // --- Title ---
  y += boxH + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.setTextColor(...navy);
  doc.text("IHM Maintenance Certificate", cx, y, { align: "center" });
  y += 5;
  doc.setDrawColor(...orange);
  doc.setLineWidth(1);
  doc.line(cx - 22, y, cx + 22, y);

  y += 9;
  doc.setFontSize(10.5);
  doc.setTextColor(...ink);
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

  // --- Vessel particulars grid ---
  y += 10;
  const cells = [
    ["Name of Ship", d.vesselName],
    ["IMO Number", d.imoNumber],
    ["Type of Ship", d.vesselType],
    ["Gross Tonnage (GRT)", String(d.grt)],
  ];
  const cellW = CW / 2;
  const cellH = 15;
  doc.setDrawColor(...line);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, cellH * 2, 1.5, 1.5, "S");
  doc.line(M + cellW, y, M + cellW, y + cellH * 2);
  doc.line(M, y + cellH, W - M, y + cellH);
  cells.forEach(([label, value], i) => {
    const cx0 = M + (i % 2) * cellW + 5;
    const cy0 = y + Math.floor(i / 2) * cellH;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), cx0, cy0 + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    // Shrink long values (ship names) to fit the cell instead of cutting them.
    const text = String(value ?? "-");
    let size = 11;
    doc.setFontSize(size);
    while (doc.getTextWidth(text) > cellW - 10 && size > 7) {
      size -= 0.25;
      doc.setFontSize(size);
    }
    doc.text(doc.splitTextToSize(text, cellW - 10)[0], cx0, cy0 + 11.5);
  });

  // --- Certification statement with the period highlighted ---
  y += cellH * 2 + 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("This is to certify that the maintenance of IHM Part 1 of this vessel for the period", cx, y, {
    align: "center",
  });
  y += 5;
  const periodText = `${d.periodFrom}   to   ${d.periodTill}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const pw = doc.getTextWidth(periodText) + 20;
  doc.setFillColor(...navy);
  doc.roundedRect(cx - pw / 2, y, pw, 11, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(periodText, cx, y + 7.6, { align: "center" });
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("is in conformity with the following regulations and guidelines:", cx, y, { align: "center" });

  // --- Regulations: numbered, text aligned on a common indent ---
  y += 10;
  const regulations = [
    "Regulation (EU) No 1257/2013 of the European Parliament and of the Council of 20 November 2013 on ship recycling and amending Regulation (EC) No 1013/2006 and Directive 2009/16/EC",
    "IMO MEPC.379(80) - 2023 Guidelines for the development of the Inventory of Hazardous Materials",
    "EMSA's Best Practice Guidance on the Inventory of Hazardous Materials",
  ];
  const numX = M + 4;
  const textX = M + 13;
  doc.setFontSize(10);
  regulations.forEach((text, i) => {
    const lines = doc.splitTextToSize(text, W - M - 4 - textX);
    const blockH = lines.length * 4.8 + 4;
    doc.setFillColor(...pale);
    doc.roundedRect(M, y - 4.5, CW, blockH, 1.5, 1.5, "F");
    doc.setFillColor(...navy);
    doc.circle(numX + 1.5, y - 1.2, 2.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), numX + 1.5, y + 0.1, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    doc.text(lines, textX, y);
    y += blockH + 3;
  });

  // --- Signature (left) and issue date (right), anchored to the bottom ---
  const sigY = H - 58;
  doc.setDrawColor(...ink);
  doc.setLineWidth(0.3);
  doc.line(M, sigY, M + 70, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...navy);
  doc.text("Julien Dufour", M, sigY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("Chairman, OPTIHAZMAT PTE LTD", M, sigY + 11);

  // Issue date on the same baselines as the signature name and title.
  doc.setFontSize(7.5);
  doc.text("ISSUED ON", W - M, sigY - 1.5, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text(d.issuedOn, W - M, sigY + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("Singapore", W - M, sigY + 11, { align: "right" });

  // --- Footer ---
  doc.setDrawColor(...line);
  doc.setLineWidth(0.3);
  doc.line(M, H - 32, W - M, H - 32);
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  const footer = doc.splitTextToSize(
    `This certificate refers to Appendix 1 (${d.appendixRef}) and is valid only for the vessel and period stated above. Issued electronically by OPTIHAZMAT PTE LTD.`,
    CW
  );
  doc.text(footer, cx, H - 26.5, { align: "center" });

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
