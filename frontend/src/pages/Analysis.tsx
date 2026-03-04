import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  BarChart3,
  Play,
  FolderOpen,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatCurrency } from '@/lib/utils';
import type { AnalysisFlag, FlagSeverity, Project } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SectionIssue {
  sectionName: string;
  critical: number;
  warning: number;
  info: number;
  total: number;
}

interface AnalysisResult {
  flags: AnalysisFlag[];
  healthScore: number;
  sectionIssues: SectionIssue[];
  ranAt: string;
}

type FilterTab = 'all' | FlagSeverity;

// ── Severity Config ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  critical: {
    icon: ShieldAlert,
    label: 'Critical',
    rowBg: 'bg-red-50',
    iconColor: 'text-red-500',
    badgeBg: 'bg-red-100 text-red-700 border-red-200',
    tabActive: 'bg-red-500 text-white',
    tabHover: 'hover:bg-red-50 hover:text-red-700',
    cardBg: 'bg-red-50 border-red-200',
    cardText: 'text-red-700',
    cardValue: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    rowBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
    tabActive: 'bg-amber-500 text-white',
    tabHover: 'hover:bg-amber-50 hover:text-amber-700',
    cardBg: 'bg-amber-50 border-amber-200',
    cardText: 'text-amber-700',
    cardValue: 'text-amber-600',
  },
  info: {
    icon: Info,
    label: 'Info',
    rowBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
    tabActive: 'bg-blue-500 text-white',
    tabHover: 'hover:bg-blue-50 hover:text-blue-700',
    cardBg: 'bg-blue-50 border-blue-200',
    cardText: 'text-blue-700',
    cardValue: 'text-blue-600',
  },
} as const;

// ── Health Score Config ───────────────────────────────────────────────────────

function getScoreConfig(score: number) {
  if (score > 75) {
    return {
      color: 'text-emerald-600',
      trackColor: 'stroke-emerald-500',
      bgColor: 'bg-emerald-50 border-emerald-200',
      label: 'Excellent',
      sublabel: 'BOQ is well-structured',
    };
  }
  if (score > 50) {
    return {
      color: 'text-amber-600',
      trackColor: 'stroke-amber-500',
      bgColor: 'bg-amber-50 border-amber-200',
      label: 'Needs Attention',
      sublabel: 'Several issues to resolve',
    };
  }
  return {
    color: 'text-red-600',
    trackColor: 'stroke-red-500',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Poor',
    sublabel: 'Critical issues found',
  };
}

// ── Analysis Engine ───────────────────────────────────────────────────────────

function runAnalysisChecks(project: Project): AnalysisResult {
  const flags: AnalysisFlag[] = [];
  const sections = project.boqSections;

  // Collect all descriptions globally for duplicate detection
  const descriptionMap = new Map<string, { count: number; sections: string[] }>();
  for (const section of sections) {
    for (const item of section.items) {
      const desc = item.description.trim().toLowerCase();
      if (desc.length > 0) {
        const existing = descriptionMap.get(desc);
        if (existing) {
          existing.count += 1;
          if (!existing.sections.includes(section.name)) {
            existing.sections.push(section.name);
          }
        } else {
          descriptionMap.set(desc, { count: 1, sections: [section.name] });
        }
      }
    }
  }

  // Per-section checks
  for (const section of sections) {
    const sectionLabel = `${section.sectionNo} – ${section.name}`;

    // Check 5: Empty Sections
    if (section.items.length === 0) {
      flags.push({
        id: crypto.randomUUID(),
        severity: 'warning',
        category: 'Empty Section',
        message: `Section "${sectionLabel}" has no items. Consider adding items or removing the section.`,
        sectionName: section.name,
      });
    }

    // Check 6: Single Item Sections
    if (section.items.length === 1) {
      flags.push({
        id: crypto.randomUUID(),
        severity: 'info',
        category: 'Thin Section',
        message: `Section "${sectionLabel}" has only 1 item. May need more detail or review.`,
        sectionName: section.name,
      });
    }

    // Per-item checks
    for (const item of section.items) {
      const itemLabel = item.description.trim() || item.itemNo;

      // Check 1: Unpriced Items
      if (item.quantity > 0 && item.totalRate === 0) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'critical',
          category: 'Unpriced Item',
          message: `Item "${itemLabel}" has quantity ${item.quantity} but zero rate. This will understate the BOQ total.`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }

      // Check 2: Zero Quantity
      if (item.quantity === 0) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'warning',
          category: 'Zero Quantity',
          message: `Item "${itemLabel}" has a quantity of 0. Confirm if this item is intentionally excluded.`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }

      // Check 3: High Rate Variance
      if (item.totalRate > 50000) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'warning',
          category: 'High Rate',
          message: `Item "${itemLabel}" has an unusually high unit rate of ${formatCurrency(item.totalRate, project.currency)}. Verify this is correct.`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }

      // Check 4: Missing Descriptions
      if (item.description.trim().length < 5) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'info',
          category: 'Missing Description',
          message: `Item "${item.itemNo}" in "${section.name}" has a very short or missing description ("${item.description || 'blank'}").`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }

      // Check 7: No Materials Cost
      if (item.materialsRate === 0 && item.labourRate > 0) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'info',
          category: 'Labour Only',
          message: `Item "${itemLabel}" has no materials cost (labour-only). Confirm this is intentional.`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }

      // Check 8: Large Amount Items
      if (item.totalAmount > 500000) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'warning',
          category: 'Large Amount',
          message: `Item "${itemLabel}" has a total amount of ${formatCurrency(item.totalAmount, project.currency)}, which exceeds the large-item threshold. Review for accuracy.`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }

      // Check 10: Low Overheads
      if (item.overheadsPct < 5) {
        flags.push({
          id: crypto.randomUUID(),
          severity: 'info',
          category: 'Low Overheads',
          message: `Item "${itemLabel}" has an overheads percentage of ${item.overheadsPct}%, which is below the typical minimum of 5%.`,
          affectedItemId: item.id,
          sectionName: section.name,
        });
      }
    }
  }

  // Check 9: Duplicate Descriptions (cross-section)
  for (const [desc, info] of descriptionMap.entries()) {
    if (info.count > 1) {
      flags.push({
        id: crypto.randomUUID(),
        severity: 'warning',
        category: 'Duplicate Description',
        message: `Description "${desc.slice(0, 60)}${desc.length > 60 ? '…' : ''}" appears ${info.count} times across sections: ${info.sections.join(', ')}.`,
        sectionName: info.sections[0],
      });
    }
  }

  // Calculate health score
  const criticalCount = flags.filter((f) => f.severity === 'critical').length;
  const warningCount = flags.filter((f) => f.severity === 'warning').length;
  const infoCount = flags.filter((f) => f.severity === 'info').length;
  const rawScore = 100 - criticalCount * 10 - warningCount * 3 - infoCount * 1;
  const healthScore = Math.max(0, Math.min(100, rawScore));

  // Section issues breakdown
  const sectionMap = new Map<string, SectionIssue>();
  for (const section of sections) {
    sectionMap.set(section.name, {
      sectionName: section.name,
      critical: 0,
      warning: 0,
      info: 0,
      total: 0,
    });
  }
  for (const flag of flags) {
    if (flag.sectionName) {
      const entry = sectionMap.get(flag.sectionName);
      if (entry) {
        entry[flag.severity] += 1;
        entry.total += 1;
      }
    }
  }
  const sectionIssues = Array.from(sectionMap.values())
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    flags,
    healthScore,
    sectionIssues,
    ranAt: new Date().toISOString(),
  };
}

// ── Score Gauge (SVG circular) ────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const cfg = getScoreConfig(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  // Only draw the top 270 degrees (start at 135 deg, sweep 270)
  const arcLength = circumference * 0.75;
  const filled = arcLength * (score / 100);
  const gap = arcLength - filled;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full -rotate-[135deg]"
          aria-label={`Health score: ${score}%`}
        >
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            className={cfg.trackColor}
            strokeWidth="10"
            strokeDasharray={`${filled} ${gap + (circumference - arcLength)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-financial font-bold', cfg.color)}>{score}</span>
          <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={cn('text-sm font-heading font-bold', cfg.color)}>{cfg.label}</p>
        <p className="text-xs text-slate-500">{cfg.sublabel}</p>
      </div>
    </div>
  );
}

// ── Severity Icon Component ───────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: FlagSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
        severity === 'critical' ? 'bg-red-100' : severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100',
      )}
      aria-label={cfg.label}
    >
      <Icon size={14} className={cfg.iconColor} />
    </span>
  );
}

// ── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  colorClasses: string;
  valueColorClass: string;
}

function SummaryCard({ label, value, icon, colorClasses, valueColorClass }: SummaryCardProps) {
  return (
    <div className={cn('rounded-xl border p-5 flex items-center gap-4', colorClasses)}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={cn('text-3xl font-financial font-bold mt-0.5', valueColorClass)}>{value}</p>
      </div>
    </div>
  );
}

// ── Filter Tab ────────────────────────────────────────────────────────────────

interface FilterTabProps {
  tab: FilterTab;
  active: FilterTab;
  count: number;
  onClick: (t: FilterTab) => void;
}

function FilterTabButton({ tab, active, count, onClick }: FilterTabProps) {
  const isActive = tab === active;
  const isAll = tab === 'all';

  const activeClasses = isAll
    ? 'bg-navy-800 text-white'
    : SEVERITY_CONFIG[tab as FlagSeverity].tabActive;

  const idleClasses = isAll
    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
    : SEVERITY_CONFIG[tab as FlagSeverity].tabHover;

  return (
    <button
      onClick={() => onClick(tab)}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
        isActive ? activeClasses : idleClasses,
      )}
    >
      <span className="capitalize">{tab === 'all' ? 'All' : SEVERITY_CONFIG[tab as FlagSeverity].label}</span>
      <span
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
          isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600',
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export function Analysis() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || '',
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleProjectChange = useCallback((id: string) => {
    setSelectedProjectId(id);
    setResult(null);
    setActiveFilter('all');
  }, []);

  const handleRunAnalysis = useCallback(() => {
    if (!selectedProject) return;
    setIsRunning(true);
    // Use a short timeout to allow the button state to render before computation
    setTimeout(() => {
      const analysisResult = runAnalysisChecks(selectedProject);
      setResult(analysisResult);
      setActiveFilter('all');
      setIsRunning(false);
    }, 120);
  }, [selectedProject]);

  // ── Derived counts ──────────────────────────────────
  const criticalCount = result?.flags.filter((f) => f.severity === 'critical').length ?? 0;
  const warningCount = result?.flags.filter((f) => f.severity === 'warning').length ?? 0;
  const infoCount = result?.flags.filter((f) => f.severity === 'info').length ?? 0;
  const totalCount = result?.flags.length ?? 0;

  const filteredFlags =
    result?.flags.filter((f) => activeFilter === 'all' || f.severity === activeFilter) ?? [];

  // ── Render ──────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Analysis & Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated devil's advocate health checks on your BOQ data
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Project selector */}
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 max-w-[260px]"
              aria-label="Select project to analyse"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Run Analysis button */}
          <Button
            variant="primary"
            icon={<Play size={15} />}
            onClick={handleRunAnalysis}
            disabled={!selectedProject || isRunning}
          >
            {isRunning ? 'Analysing…' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {/* No Projects at all */}
      {projects.length === 0 && (
        <Card padding="lg">
          <EmptyState
            icon={<FolderOpen size={28} />}
            title="No projects found"
            description="Create a project from the Dashboard first, then return here to run health checks."
          />
        </Card>
      )}

      {/* Projects exist but no analysis run yet */}
      {projects.length > 0 && !result && (
        <Card padding="lg">
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="No analysis run yet"
            description={
              selectedProject
                ? `Select a project and click "Run Analysis" to check "${selectedProject.name}" for BOQ issues.`
                : 'Select a project above and click "Run Analysis" to begin.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={14} />}
                onClick={handleRunAnalysis}
                disabled={!selectedProject || isRunning}
              >
                {isRunning ? 'Analysing…' : 'Run Analysis Now'}
              </Button>
            }
          />
        </Card>
      )}

      {/* Analysis Results */}
      {result && selectedProject && (
        <motion.div
          key={result.ranAt}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Score Card */}
            <SummaryCard
              label="Health Score"
              value={`${result.healthScore}%`}
              icon={
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    result.healthScore > 75
                      ? 'bg-emerald-100'
                      : result.healthScore > 50
                        ? 'bg-amber-100'
                        : 'bg-red-100',
                  )}
                >
                  <CheckCircle2
                    size={20}
                    className={
                      result.healthScore > 75
                        ? 'text-emerald-600'
                        : result.healthScore > 50
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }
                  />
                </div>
              }
              colorClasses={
                result.healthScore > 75
                  ? 'bg-emerald-50 border-emerald-200'
                  : result.healthScore > 50
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
              }
              valueColorClass={
                result.healthScore > 75
                  ? 'text-emerald-600'
                  : result.healthScore > 50
                    ? 'text-amber-600'
                    : 'text-red-600'
              }
            />

            {/* Critical */}
            <SummaryCard
              label="Critical Flags"
              value={criticalCount}
              icon={
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <ShieldAlert size={20} className="text-red-500" />
                </div>
              }
              colorClasses="bg-white border-slate-200"
              valueColorClass={criticalCount > 0 ? 'text-red-600' : 'text-slate-400'}
            />

            {/* Warnings */}
            <SummaryCard
              label="Warnings"
              value={warningCount}
              icon={
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-500" />
                </div>
              }
              colorClasses="bg-white border-slate-200"
              valueColorClass={warningCount > 0 ? 'text-amber-600' : 'text-slate-400'}
            />

            {/* Info */}
            <SummaryCard
              label="Info Notes"
              value={infoCount}
              icon={
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Info size={20} className="text-blue-500" />
                </div>
              }
              colorClasses="bg-white border-slate-200"
              valueColorClass={infoCount > 0 ? 'text-blue-600' : 'text-slate-400'}
            />
          </div>

          {/* Zero flags = all clear */}
          {totalCount === 0 && (
            <Card padding="lg">
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-base font-heading font-bold text-navy-900">
                  BOQ looks great!
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  No issues were detected in "{selectedProject.name}". All checks passed.
                </p>
              </div>
            </Card>
          )}

          {/* Main content grid */}
          {totalCount > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left: Flags Table — takes 2 cols */}
              <div className="xl:col-span-2">
                <Card padding="none">
                  <div className="px-5 pt-5 pb-3">
                    <CardHeader
                      title="Analysis Flags"
                      subtitle={`${totalCount} issue${totalCount !== 1 ? 's' : ''} found across ${selectedProject.boqSections.length} section${selectedProject.boqSections.length !== 1 ? 's' : ''}`}
                    />

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <FilterTabButton
                        tab="all"
                        active={activeFilter}
                        count={totalCount}
                        onClick={setActiveFilter}
                      />
                      <FilterTabButton
                        tab="critical"
                        active={activeFilter}
                        count={criticalCount}
                        onClick={setActiveFilter}
                      />
                      <FilterTabButton
                        tab="warning"
                        active={activeFilter}
                        count={warningCount}
                        onClick={setActiveFilter}
                      />
                      <FilterTabButton
                        tab="info"
                        active={activeFilter}
                        count={infoCount}
                        onClick={setActiveFilter}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    {filteredFlags.length === 0 ? (
                      <div className="px-5 pb-5">
                        <p className="text-sm text-slate-400 text-center py-8">
                          No{' '}
                          {activeFilter !== 'all'
                            ? SEVERITY_CONFIG[activeFilter as FlagSeverity].label.toLowerCase()
                            : ''}{' '}
                          flags found.
                        </p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-t border-slate-100">
                            <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-8">
                              {/* Icon */}
                            </th>
                            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                              Category
                            </th>
                            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                              Issue
                            </th>
                            <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                              Section
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredFlags.map((flag, idx) => {
                            const cfg = SEVERITY_CONFIG[flag.severity];
                            return (
                              <motion.tr
                                key={flag.id}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.025, duration: 0.2 }}
                                className={cn(
                                  'align-top transition-colors',
                                  idx % 2 === 0 ? '' : 'bg-slate-50/50',
                                  'hover:' + cfg.rowBg,
                                )}
                              >
                                {/* Severity icon */}
                                <td className="pl-5 pr-2 py-3">
                                  <SeverityIcon severity={flag.severity} />
                                </td>

                                {/* Category badge */}
                                <td className="px-2 py-3 whitespace-nowrap">
                                  <span
                                    className={cn(
                                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                                      cfg.badgeBg,
                                    )}
                                  >
                                    {flag.category}
                                  </span>
                                </td>

                                {/* Message */}
                                <td className="px-2 py-3 text-slate-700 leading-snug">
                                  {flag.message}
                                </td>

                                {/* Section */}
                                <td className="px-5 py-3 whitespace-nowrap">
                                  {flag.sectionName ? (
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                      {flag.sectionName}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-300">—</span>
                                  )}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Table footer */}
                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Showing {filteredFlags.length} of {totalCount} flags
                    </p>
                    <p className="text-xs text-slate-400">
                      Analysed at{' '}
                      {new Date(result.ranAt).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-6">
                {/* Score Gauge Card */}
                <Card padding="lg">
                  <CardHeader title="BOQ Health Score" subtitle="Based on flag severity deductions" />

                  <div className="flex flex-col items-center pt-2 pb-4">
                    <ScoreGauge score={result.healthScore} />
                  </div>

                  {/* Deduction breakdown */}
                  <div className="mt-2 space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                      Deductions
                    </p>

                    {/* Starting score */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Base score</span>
                      <span className="font-financial font-semibold text-slate-700">100</span>
                    </div>

                    {criticalCount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-red-600">
                          <ShieldAlert size={13} />
                          {criticalCount} critical × −10
                        </span>
                        <span className="font-financial font-semibold text-red-600">
                          −{criticalCount * 10}
                        </span>
                      </div>
                    )}

                    {warningCount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <AlertTriangle size={13} />
                          {warningCount} warning{warningCount !== 1 ? 's' : ''} × −3
                        </span>
                        <span className="font-financial font-semibold text-amber-600">
                          −{warningCount * 3}
                        </span>
                      </div>
                    )}

                    {infoCount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-blue-600">
                          <Info size={13} />
                          {infoCount} info × −1
                        </span>
                        <span className="font-financial font-semibold text-blue-600">
                          −{infoCount * 1}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm font-bold border-t border-slate-100 pt-2 mt-1">
                      <span className="text-navy-900">Final Score</span>
                      <span
                        className={cn(
                          'font-financial',
                          getScoreConfig(result.healthScore).color,
                        )}
                      >
                        {result.healthScore}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Section Issues Breakdown */}
                {result.sectionIssues.length > 0 && (
                  <Card padding="lg">
                    <CardHeader
                      title="Section Breakdown"
                      subtitle="Sections with the most issues"
                    />

                    <div className="space-y-3">
                      {result.sectionIssues.map((sec) => {
                        const pct = Math.round((sec.total / totalCount) * 100);
                        return (
                          <div key={sec.sectionName}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-700 truncate max-w-[160px]" title={sec.sectionName}>
                                {sec.sectionName}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {sec.critical > 0 && (
                                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                    {sec.critical}C
                                  </span>
                                )}
                                {sec.warning > 0 && (
                                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                    {sec.warning}W
                                  </span>
                                )}
                                {sec.info > 0 && (
                                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {sec.info}I
                                  </span>
                                )}
                                <span className="text-xs font-financial font-bold text-slate-500 w-6 text-right">
                                  {sec.total}
                                </span>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className={cn(
                                  'h-full rounded-full',
                                  sec.critical > 0
                                    ? 'bg-red-400'
                                    : sec.warning > 0
                                      ? 'bg-amber-400'
                                      : 'bg-blue-400',
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
