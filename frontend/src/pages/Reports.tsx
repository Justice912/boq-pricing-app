import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Eye,
  FolderOpen,
  Table2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { CURRENCY_SYMBOLS } from '@/data/constants';
import {
  exportBOQSummaryCSV,
  exportBOQDetailedCSV,
  downloadCSV,
  openPrintPreview,
} from '@/lib/exportUtils';
import type { Project } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type ExportFormat = 'summary-csv' | 'detailed-csv' | 'print-pdf';

interface ExportOptionDef {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
}

const EXPORT_OPTIONS: ExportOptionDef[] = [
  {
    id: 'summary-csv',
    label: 'Summary BOQ (CSV)',
    description: 'Item No, Description, Unit, Qty, Rate, Amount — grouped by section with subtotals.',
    icon: <FileSpreadsheet size={20} className="text-emerald-600" />,
    badge: 'CSV',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'detailed-csv',
    label: 'Detailed BOQ (CSV)',
    description: 'Full rate breakdown including Materials, Labour, Plant, Subcontract, OH%, Profit%, Confidence.',
    icon: <Table2 size={20} className="text-blue-600" />,
    badge: 'CSV',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'print-pdf',
    label: 'Professional Report (Print / PDF)',
    description: 'Formatted report with company letterhead, project details, and print-ready BOQ table. Opens in a new tab for browser Print to Save as PDF.',
    icon: <Printer size={20} className="text-navy-600" />,
    badge: 'PDF',
    badgeColor: 'bg-navy-100 text-navy-700 border-navy-200',
  },
];

// ── Report Preview Component ─────────────────────────────────────────────────

function ReportPreview({
  project,
  vatRate,
}: {
  project: Project;
  vatRate: number;
}) {
  const sym = CURRENCY_SYMBOLS[project.currency] || project.currency;
  const subtotal = project.totalValue;
  const vat = subtotal * (vatRate / 100);
  const grandTotal = subtotal + vat;
  const totalItems = project.boqSections.reduce((s, sec) => s + sec.items.length, 0);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Project info bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Client', value: project.client || '—' },
          { label: 'Location', value: project.location || '—' },
          { label: 'Contract', value: project.contractType },
          { label: 'Period', value: `${project.contractPeriodMonths} months` },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="text-sm font-medium text-navy-900 mt-0.5 truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* BOQ Summary Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-navy-800 text-white">
              <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide w-[7%]">Item</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide w-[43%]">Description</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide w-[6%]">Unit</th>
              <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide w-[10%]">Qty</th>
              <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide w-[14%]">Rate</th>
              <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide w-[20%]">Amount</th>
            </tr>
          </thead>
          {project.boqSections.map((section) => {
            const isCollapsed = collapsedSections.has(section.id);
            const sectionTotal = section.items.reduce((s, it) => s + it.totalAmount, 0);
            return (
              <tbody key={section.id}>
                <tr
                  className="bg-slate-100 cursor-pointer hover:bg-slate-200/70 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <td colSpan={5} className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight size={14} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400" />
                      )}
                      <span className="font-bold text-xs text-navy-800">
                        Section {section.sectionNo}: {section.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({section.items.length} item{section.items.length !== 1 ? 's' : ''})
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-xs text-navy-800 font-financial tabular-nums">
                    {sym} {sectionTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                {!isCollapsed &&
                  section.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-b border-slate-100',
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                      )}
                    >
                      <td className="px-3 py-1.5 text-xs text-slate-500">{item.itemNo}</td>
                      <td className="px-3 py-1.5 text-xs text-slate-700">{item.description}</td>
                      <td className="px-3 py-1.5 text-xs text-center text-slate-500">{item.unit}</td>
                      <td className="px-3 py-1.5 text-xs text-right font-financial tabular-nums text-slate-600">
                        {item.quantity.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-right font-financial tabular-nums text-slate-600">
                        {sym} {item.totalRate.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-right font-financial tabular-nums font-semibold text-navy-900">
                        {sym} {item.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            );
          })}
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <td colSpan={5} className="px-3 py-2 text-right text-xs font-semibold text-slate-600">
                Subtotal (excl. VAT)
              </td>
              <td className="px-3 py-2 text-right text-sm font-financial font-bold tabular-nums text-navy-900">
                {formatCurrency(subtotal, project.currency)}
              </td>
            </tr>
            <tr>
              <td colSpan={5} className="px-3 py-1.5 text-right text-xs font-semibold text-slate-500">
                VAT @ {vatRate}%
              </td>
              <td className="px-3 py-1.5 text-right text-sm font-financial font-semibold tabular-nums text-slate-600">
                {formatCurrency(vat, project.currency)}
              </td>
            </tr>
            <tr className="bg-navy-800">
              <td colSpan={5} className="px-3 py-3 text-right text-xs font-bold text-white uppercase tracking-wide">
                Grand Total (incl. VAT)
              </td>
              <td className="px-3 py-3 text-right text-base font-financial font-bold tabular-nums text-amber-400">
                {formatCurrency(grandTotal, project.currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>{project.boqSections.length} sections, {totalItems} items</span>
        <span>Generated {new Date().toLocaleDateString('en-ZA')}</span>
      </div>
    </div>
  );
}

// ── Export History Entry ──────────────────────────────────────────────────────

interface ExportEntry {
  id: string;
  format: ExportFormat;
  projectName: string;
  timestamp: string;
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function Reports() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const settings = useSettingsStore((s) => s.settings);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || '',
  );
  const [exportHistory, setExportHistory] = useState<ExportEntry[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [lastExported, setLastExported] = useState<ExportFormat | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const vatRate = settings.defaultVatRate;

  function handleExport(format: ExportFormat) {
    if (!selectedProject) return;

    const safeName = selectedProject.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const dateStamp = new Date().toISOString().slice(0, 10);

    switch (format) {
      case 'summary-csv': {
        const csv = exportBOQSummaryCSV(selectedProject, vatRate);
        downloadCSV(csv, `BOQ_Summary_${safeName}_${dateStamp}.csv`);
        break;
      }
      case 'detailed-csv': {
        const csv = exportBOQDetailedCSV(selectedProject, vatRate);
        downloadCSV(csv, `BOQ_Detailed_${safeName}_${dateStamp}.csv`);
        break;
      }
      case 'print-pdf': {
        openPrintPreview(selectedProject, settings);
        break;
      }
    }

    const entry: ExportEntry = {
      id: crypto.randomUUID(),
      format,
      projectName: selectedProject.name,
      timestamp: new Date().toISOString(),
    };
    setExportHistory((prev) => [entry, ...prev].slice(0, 10));
    setLastExported(format);

    // Reset success indicator after 3s
    setTimeout(() => setLastExported(null), 3000);
  }

  // ── No projects state ──
  if (projects.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-navy-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Export BOQs as CSV, PDF, and professional reports</p>
        </div>
        <Card padding="lg">
          <EmptyState
            icon={<FolderOpen size={28} />}
            title="No projects found"
            description="Create a project from the Dashboard first, then return here to generate reports."
          />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Export BOQs as CSV, PDF, and professional reports</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setShowPreview(false);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 max-w-[260px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Button
            variant={showPreview ? 'primary' : 'secondary'}
            size="md"
            icon={<Eye size={15} />}
            onClick={() => setShowPreview(!showPreview)}
            disabled={!selectedProject}
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Project Summary Bar */}
      {selectedProject && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Value', value: formatCurrency(selectedProject.totalValue, selectedProject.currency), accent: 'text-navy-900' },
            { label: 'Sections', value: String(selectedProject.boqSections.length), accent: 'text-slate-700' },
            { label: 'Items', value: String(selectedProject.boqSections.reduce((s, sec) => s + sec.items.length, 0)), accent: 'text-slate-700' },
            { label: 'Status', value: selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1), accent: 'text-slate-700' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className={cn('text-lg font-financial font-bold mt-0.5', item.accent)}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EXPORT_OPTIONS.map((opt) => {
          const isSuccess = lastExported === opt.id;
          return (
            <motion.div
              key={opt.id}
              initial={false}
              animate={isSuccess ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Card
                padding="md"
                className={cn(
                  'relative transition-all duration-200',
                  isSuccess && 'ring-2 ring-emerald-400 border-emerald-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {isSuccess ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      opt.icon
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-heading font-bold text-navy-900">{opt.label}</h3>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border',
                          opt.badgeColor,
                        )}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    variant={isSuccess ? 'secondary' : 'primary'}
                    size="sm"
                    icon={
                      isSuccess ? (
                        <CheckCircle2 size={14} />
                      ) : opt.id === 'print-pdf' ? (
                        <Printer size={14} />
                      ) : (
                        <Download size={14} />
                      )
                    }
                    onClick={() => handleExport(opt.id)}
                    disabled={!selectedProject || selectedProject.boqSections.length === 0}
                    className="w-full"
                  >
                    {isSuccess
                      ? 'Exported!'
                      : opt.id === 'print-pdf'
                        ? 'Open Print Preview'
                        : 'Download'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Section */}
      {showPreview && selectedProject && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card padding="none">
            <div className="px-5 pt-5 pb-3">
              <CardHeader
                title="Report Preview"
                subtitle={`${selectedProject.name} — ${formatDate(selectedProject.updatedAt)}`}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Printer size={14} />}
                    onClick={() => handleExport('print-pdf')}
                  >
                    Print
                  </Button>
                }
              />
            </div>
            <div className="px-5 pb-5">
              <ReportPreview project={selectedProject} vatRate={vatRate} />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Export History */}
      {exportHistory.length > 0 && (
        <Card padding="md">
          <CardHeader title="Recent Exports" subtitle="Your export activity this session" />
          <div className="space-y-2">
            {exportHistory.map((entry) => {
              const optDef = EXPORT_OPTIONS.find((o) => o.id === entry.format);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg"
                >
                  <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {optDef?.icon || <FileText size={14} className="text-slate-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-navy-900 truncate">{entry.projectName}</p>
                    <p className="text-[10px] text-slate-400">{optDef?.label}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleTimeString('en-ZA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
