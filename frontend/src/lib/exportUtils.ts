import type { Project, AppSettings } from '@/types';
import { CURRENCY_SYMBOLS } from '@/data/constants';

// ── CSV Export ───────────────────────────────────────────────────────────────

function escCsv(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Export BOQ as a summary CSV (Section → Items with totals) */
export function exportBOQSummaryCSV(project: Project, vatRate: number): string {
  const sym = CURRENCY_SYMBOLS[project.currency] || project.currency;
  const rows: string[] = [];

  rows.push(
    ['Item No', 'Description', 'Unit', 'Qty', `Rate (${sym})`, `Amount (${sym})`]
      .map(escCsv)
      .join(','),
  );

  for (const section of project.boqSections) {
    // Section header
    rows.push(
      ['', `SECTION ${section.sectionNo}: ${section.name.toUpperCase()}`, '', '', '', '']
        .map(escCsv)
        .join(','),
    );

    for (const item of section.items) {
      rows.push(
        [
          item.itemNo,
          item.description,
          item.unit,
          item.quantity,
          item.totalRate.toFixed(2),
          item.totalAmount.toFixed(2),
        ]
          .map(escCsv)
          .join(','),
      );
    }

    // Section subtotal
    const sectionTotal = section.items.reduce((sum, it) => sum + it.totalAmount, 0);
    rows.push(
      ['', `Subtotal: ${section.name}`, '', '', '', sectionTotal.toFixed(2)]
        .map(escCsv)
        .join(','),
    );
    rows.push('');
  }

  // Grand totals
  const subtotal = project.totalValue;
  const vat = subtotal * (vatRate / 100);
  rows.push(['', '', '', '', '', ''].join(','));
  rows.push(['', 'SUBTOTAL (excl. VAT)', '', '', '', subtotal.toFixed(2)].map(escCsv).join(','));
  rows.push(['', `VAT @ ${vatRate}%`, '', '', '', vat.toFixed(2)].map(escCsv).join(','));
  rows.push(
    ['', 'GRAND TOTAL (incl. VAT)', '', '', '', (subtotal + vat).toFixed(2)]
      .map(escCsv)
      .join(','),
  );

  return rows.join('\n');
}

/** Export BOQ as a detailed CSV with full rate breakdown */
export function exportBOQDetailedCSV(project: Project, vatRate: number): string {
  const sym = CURRENCY_SYMBOLS[project.currency] || project.currency;
  const rows: string[] = [];

  rows.push(
    [
      'Item No',
      'Description',
      'Unit',
      'Qty',
      `Materials (${sym})`,
      `Labour (${sym})`,
      `Plant (${sym})`,
      `Subcontract (${sym})`,
      'OH %',
      'Profit %',
      `Total Rate (${sym})`,
      `Amount (${sym})`,
      'Confidence',
      'Notes',
    ]
      .map(escCsv)
      .join(','),
  );

  for (const section of project.boqSections) {
    rows.push(
      [
        '',
        `SECTION ${section.sectionNo}: ${section.name.toUpperCase()}`,
        '', '', '', '', '', '', '', '', '', '', '', '',
      ]
        .map(escCsv)
        .join(','),
    );

    for (const item of section.items) {
      rows.push(
        [
          item.itemNo,
          item.description,
          item.unit,
          item.quantity,
          item.materialsRate.toFixed(2),
          item.labourRate.toFixed(2),
          item.plantRate.toFixed(2),
          item.subcontractRate.toFixed(2),
          item.overheadsPct.toFixed(1),
          item.profitPct.toFixed(1),
          item.totalRate.toFixed(2),
          item.totalAmount.toFixed(2),
          item.confidence,
          item.notes || '',
        ]
          .map(escCsv)
          .join(','),
      );
    }

    const sectionTotal = section.items.reduce((sum, it) => sum + it.totalAmount, 0);
    rows.push(
      [
        '', `Subtotal: ${section.name}`,
        '', '', '', '', '', '', '', '', '', sectionTotal.toFixed(2), '', '',
      ]
        .map(escCsv)
        .join(','),
    );
    rows.push('');
  }

  const subtotal = project.totalValue;
  const vat = subtotal * (vatRate / 100);
  rows.push(new Array(14).fill('').join(','));
  rows.push(
    ['', 'SUBTOTAL (excl. VAT)', '', '', '', '', '', '', '', '', '', subtotal.toFixed(2), '', '']
      .map(escCsv)
      .join(','),
  );
  rows.push(
    ['', `VAT @ ${vatRate}%`, '', '', '', '', '', '', '', '', '', vat.toFixed(2), '', '']
      .map(escCsv)
      .join(','),
  );
  rows.push(
    [
      '',
      'GRAND TOTAL (incl. VAT)',
      '', '', '', '', '', '', '', '', '',
      (subtotal + vat).toFixed(2),
      '', '',
    ]
      .map(escCsv)
      .join(','),
  );

  return rows.join('\n');
}

// ── File Download ────────────────────────────────────────────────────────────

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Print View HTML ─────────────────────────────────────────────────────────

export function generatePrintHTML(
  project: Project,
  settings: AppSettings,
): string {
  const sym = CURRENCY_SYMBOLS[project.currency] || project.currency;
  const vatRate = settings.defaultVatRate;
  const company = settings.companyProfile;
  const subtotal = project.totalValue;
  const vat = subtotal * (vatRate / 100);
  const grandTotal = subtotal + vat;

  function fmtAmt(n: number): string {
    return n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const sectionRows = project.boqSections
    .map((section) => {
      const sectionTotal = section.items.reduce((s, it) => s + it.totalAmount, 0);
      const itemRows = section.items
        .map(
          (item) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#475569;">${item.itemNo}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#1e293b;">${item.description}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;color:#475569;">${item.unit}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:right;font-variant-numeric:tabular-nums;color:#475569;">${fmtAmt(item.quantity)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:right;font-variant-numeric:tabular-nums;color:#475569;">${sym} ${fmtAmt(item.totalRate)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:#1e293b;">${sym} ${fmtAmt(item.totalAmount)}</td>
        </tr>`,
        )
        .join('');

      return `
        <tr style="background:#f8fafc;">
          <td colspan="5" style="padding:10px 8px;font-weight:700;font-size:13px;color:#1e3a5f;border-bottom:2px solid #cbd5e1;">
            Section ${section.sectionNo}: ${section.name}
          </td>
          <td style="padding:10px 8px;font-weight:700;font-size:13px;color:#1e3a5f;border-bottom:2px solid #cbd5e1;text-align:right;font-variant-numeric:tabular-nums;">
            ${sym} ${fmtAmt(sectionTotal)}
          </td>
        </tr>
        ${itemRows}`;
    })
    .join('');

  const totalItems = project.boqSections.reduce((s, sec) => s + sec.items.length, 0);
  const dateStr = new Date().toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>BOQ Report – ${project.name}</title>
<style>
  @page { margin: 20mm 15mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.5; }
  @media print {
    .no-print { display: none !important; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <!-- Print button -->
  <div class="no-print" style="position:fixed;top:16px;right:16px;z-index:100;">
    <button onclick="window.print()" style="background:#1e3a5f;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
      Print / Save PDF
    </button>
    <button onclick="window.close()" style="background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-left:8px;">
      Close
    </button>
  </div>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #1e3a5f;">
    <div>
      <h1 style="font-size:24px;font-weight:800;color:#1e3a5f;letter-spacing:-0.5px;">
        ${company.name || 'BOQ Pricing System'}
      </h1>
      ${company.registrationNo ? `<p style="font-size:11px;color:#64748b;margin-top:2px;">Reg: ${company.registrationNo}</p>` : ''}
      ${company.vatNo ? `<p style="font-size:11px;color:#64748b;">VAT: ${company.vatNo}</p>` : ''}
    </div>
    <div style="text-align:right;">
      <p style="font-size:11px;color:#64748b;">Date: ${dateStr}</p>
      <p style="font-size:11px;color:#64748b;">Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</p>
      <p style="font-size:11px;color:#64748b;">Currency: ${project.currency}</p>
    </div>
  </div>

  <!-- Title Block -->
  <div style="background:#f0f4f8;border:1px solid #cbd5e1;border-radius:8px;padding:20px;margin-bottom:28px;">
    <h2 style="font-size:20px;font-weight:700;color:#1e3a5f;margin-bottom:4px;">BILL OF QUANTITIES</h2>
    <p style="font-size:16px;color:#334155;font-weight:600;">${project.name}</p>
    <div style="display:flex;gap:32px;margin-top:12px;font-size:12px;color:#64748b;">
      <span><strong>Client:</strong> ${project.client || '—'}</span>
      <span><strong>Location:</strong> ${project.location || '—'}</span>
      <span><strong>Contract:</strong> ${project.contractType}</span>
      <span><strong>Period:</strong> ${project.contractPeriodMonths} months</span>
    </div>
    <div style="display:flex;gap:32px;margin-top:6px;font-size:12px;color:#64748b;">
      <span><strong>Sections:</strong> ${project.boqSections.length}</span>
      <span><strong>Items:</strong> ${totalItems}</span>
    </div>
  </div>

  <!-- BOQ Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;" cellspacing="0">
    <thead>
      <tr style="background:#1e3a5f;">
        <th style="padding:8px;font-size:11px;font-weight:700;color:white;text-align:left;text-transform:uppercase;letter-spacing:0.5px;width:8%;">Item No</th>
        <th style="padding:8px;font-size:11px;font-weight:700;color:white;text-align:left;text-transform:uppercase;letter-spacing:0.5px;width:38%;">Description</th>
        <th style="padding:8px;font-size:11px;font-weight:700;color:white;text-align:center;text-transform:uppercase;letter-spacing:0.5px;width:7%;">Unit</th>
        <th style="padding:8px;font-size:11px;font-weight:700;color:white;text-align:right;text-transform:uppercase;letter-spacing:0.5px;width:12%;">Qty</th>
        <th style="padding:8px;font-size:11px;font-weight:700;color:white;text-align:right;text-transform:uppercase;letter-spacing:0.5px;width:15%;">Rate</th>
        <th style="padding:8px;font-size:11px;font-weight:700;color:white;text-align:right;text-transform:uppercase;letter-spacing:0.5px;width:20%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${sectionRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;">
    <table style="width:340px;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">Subtotal (excl. VAT)</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;color:#1e293b;border-bottom:1px solid #e2e8f0;font-variant-numeric:tabular-nums;">${sym} ${fmtAmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">VAT @ ${vatRate}%</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;color:#1e293b;border-bottom:1px solid #e2e8f0;font-variant-numeric:tabular-nums;">${sym} ${fmtAmt(vat)}</td>
      </tr>
      <tr style="background:#1e3a5f;">
        <td style="padding:10px 12px;font-size:14px;font-weight:700;color:white;">GRAND TOTAL (incl. VAT)</td>
        <td style="padding:10px 12px;font-size:14px;text-align:right;font-weight:700;color:#f59e0b;font-variant-numeric:tabular-nums;">${sym} ${fmtAmt(grandTotal)}</td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;">
    <span>Generated by BOQ Pricing System</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
}

/** Open the print-ready HTML in a new window */
export function openPrintPreview(project: Project, settings: AppSettings): void {
  const html = generatePrintHTML(project, settings);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
