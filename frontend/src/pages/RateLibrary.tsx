import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Filter,
} from 'lucide-react';

import { useRateLibraryStore } from '@/stores/rateLibraryStore';
import { INDUSTRIES } from '@/data/industries';
import { MEASUREMENT_UNITS } from '@/data/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatNumber, computeTotalRate } from '@/lib/utils';
import type { RateEntry, ConfidenceLevel } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = keyof Pick<
  RateEntry,
  'description' | 'tradeSection' | 'unit' | 'materialsRate' | 'labourRate' | 'plantRate' | 'subcontractRate' | 'totalRate' | 'confidence'
>;
type SortDir = 'asc' | 'desc';

interface FormValues {
  description: string;
  industryId: string;
  tradeSection: string;
  unit: string;
  materialsRate: string;
  labourRate: string;
  plantRate: string;
  subcontractRate: string;
  region: string;
  confidence: ConfidenceLevel;
  source: RateEntry['source'];
}

const EMPTY_FORM: FormValues = {
  description: '',
  industryId: 'building-construction',
  tradeSection: '',
  unit: 'm²',
  materialsRate: '0',
  labourRate: '0',
  plantRate: '0',
  subcontractRate: '0',
  region: 'Gauteng',
  confidence: 'Estimated',
  source: 'user',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseNum(s: string): number {
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className={cn('flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4', 'flex-1 min-w-0')}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-financial font-bold text-navy-900 leading-tight">{value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

interface ConfidenceBadgeProps {
  value: ConfidenceLevel;
}

function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const styles: Record<ConfidenceLevel, string> = {
    Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Estimated: 'bg-amber-100 text-amber-700 border-amber-200',
    Budget: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', styles[value])}>
      {value}
    </span>
  );
}

interface SourceBadgeProps {
  value: RateEntry['source'];
}

function SourceBadge({ value }: SourceBadgeProps) {
  const styles: Record<RateEntry['source'], string> = {
    user: 'bg-blue-100 text-blue-700 border-blue-200',
    imported: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    historical: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  const labels: Record<RateEntry['source'], string> = {
    user: 'User',
    imported: 'Imported',
    historical: 'Historical',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', styles[value])}>
      {labels[value]}
    </span>
  );
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}

function SortHeader({ label, sortKey, currentKey, currentDir, onSort, className }: SortHeaderProps) {
  const isActive = currentKey === sortKey;
  return (
    <th
      className={cn(
        'px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none',
        'hover:text-navy-700 hover:bg-slate-50 transition-colors',
        className,
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === 'asc' ? <ChevronUp size={12} className="text-navy-700" /> : <ChevronDown size={12} className="text-navy-700" />
        ) : (
          <ChevronsUpDown size={12} className="text-slate-300" />
        )}
      </span>
    </th>
  );
}

// ── Add/Edit Modal Form ───────────────────────────────────────────────────────

interface RateFormModalProps {
  open: boolean;
  editingRate: RateEntry | null;
  onClose: () => void;
  onSave: (values: FormValues) => void;
}

function RateFormModal({ open, editingRate, onClose, onSave }: RateFormModalProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);

  // Sync form values when modal opens or editingRate changes
  const handleOpen = useCallback(() => {
    if (editingRate) {
      setValues({
        description: editingRate.description,
        industryId: editingRate.industryId,
        tradeSection: editingRate.tradeSection,
        unit: editingRate.unit,
        materialsRate: String(editingRate.materialsRate),
        labourRate: String(editingRate.labourRate),
        plantRate: String(editingRate.plantRate),
        subcontractRate: String(editingRate.subcontractRate),
        region: editingRate.region,
        confidence: editingRate.confidence,
        source: editingRate.source,
      });
    } else {
      setValues(EMPTY_FORM);
    }
  }, [editingRate]);

  // Reset when modal opens
  useState(() => {
    if (open) handleOpen();
  });

  // Keep form in sync with open/editingRate changes via key prop on Modal
  const formKey = open ? (editingRate?.id ?? 'new') : 'closed';

  const mat = parseNum(values.materialsRate);
  const lab = parseNum(values.labourRate);
  const plant = parseNum(values.plantRate);
  const sub = parseNum(values.subcontractRate);
  const computedTotal = computeTotalRate(mat, lab, plant, sub, 10, 10);

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(values);
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1';

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose} type="button">
        Cancel
      </Button>
      <Button variant="primary" size="sm" type="submit" form="rate-form">
        {editingRate ? 'Save Changes' : 'Add Rate'}
      </Button>
    </>
  );

  return (
    <Modal
      key={formKey}
      open={open}
      onClose={onClose}
      title={editingRate ? 'Edit Rate' : 'Add New Rate'}
      size="lg"
      footer={footer}
    >
      <form id="rate-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            type="text"
            required
            placeholder="e.g. 25MPa/19mm concrete strip footings"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {/* Industry + Trade Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Industry</label>
            <select
              className={inputClass}
              value={values.industryId}
              onChange={(e) => set('industryId', e.target.value)}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Trade Section</label>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. Concrete & Formwork"
              value={values.tradeSection}
              onChange={(e) => set('tradeSection', e.target.value)}
            />
          </div>
        </div>

        {/* Unit + Region */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Unit</label>
            <select
              className={inputClass}
              value={values.unit}
              onChange={(e) => set('unit', e.target.value)}
            >
              {MEASUREMENT_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Region</label>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. Gauteng"
              value={values.region}
              onChange={(e) => set('region', e.target.value)}
            />
          </div>
        </div>

        {/* Rate Breakdown */}
        <div>
          <p className={cn(labelClass, 'mb-2')}>Rate Breakdown (R / unit)</p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: 'materialsRate', label: 'Materials' },
                { key: 'labourRate', label: 'Labour' },
                { key: 'plantRate', label: 'Plant' },
                { key: 'subcontractRate', label: 'Subcontract' },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className={cn(labelClass, 'font-medium')}>{label}</label>
                <input
                  className={cn(inputClass, 'font-financial text-right')}
                  type="number"
                  min="0"
                  step="0.01"
                  value={values[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Computed Total */}
        <div className="rounded-lg bg-navy-900 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">
            Total Rate <span className="text-xs font-normal text-slate-400">(incl. 10% OH + 10% Profit)</span>
          </span>
          <span className="text-lg font-financial font-bold text-amber-400">R {fmt(computedTotal)}</span>
        </div>

        {/* Confidence + Source */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Confidence</label>
            <select
              className={inputClass}
              value={values.confidence}
              onChange={(e) => set('confidence', e.target.value as ConfidenceLevel)}
            >
              <option value="Verified">Verified</option>
              <option value="Estimated">Estimated</option>
              <option value="Budget">Budget</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <select
              className={inputClass}
              value={values.source}
              onChange={(e) => set('source', e.target.value as RateEntry['source'])}
            >
              <option value="user">User</option>
              <option value="imported">Imported</option>
              <option value="historical">Historical</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────

interface DeleteModalProps {
  open: boolean;
  rateName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteModal({ open, rateName, onClose, onConfirm }: DeleteModalProps) {
  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" size="sm" onClick={onConfirm} icon={<Trash2 size={14} />}>
        Delete Rate
      </Button>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} title="Delete Rate" size="sm" footer={footer}>
      <div className="flex flex-col items-center text-center py-2 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm text-slate-700 font-medium">Are you sure you want to delete this rate?</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-xs">
            &ldquo;{rateName}&rdquo;
          </p>
        </div>
        <p className="text-xs text-red-500 font-medium">This action cannot be undone.</p>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function RateLibrary() {
  const {
    rates,
    searchQuery,
    filterIndustry,
    filterTrade,
    setSearchQuery,
    setFilterIndustry,
    setFilterTrade,
    addRate,
    updateRate,
    deleteRate,
    getFilteredRates,
  } = useRateLibraryStore();

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<RateEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RateEntry | null>(null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey | null>('description');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // ── Derived data ────────────────────────────────────

  const filteredRates = getFilteredRates();

  const sortedRates = useMemo(() => {
    if (!sortKey) return filteredRates;
    return [...filteredRates].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sortDir === 'asc' ? -1 : 1;
      if (as > bs) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRates, sortKey, sortDir]);

  // Unique trade sections for the trade filter dropdown (from ALL rates, not just filtered)
  const allTrades = useMemo(() => {
    const set = new Set(rates.map((r) => r.tradeSection).filter(Boolean));
    return Array.from(set).sort();
  }, [rates]);

  // Stats
  const totalCount = rates.length;
  const verifiedCount = rates.filter((r) => r.confidence === 'Verified').length;
  const estimatedCount = rates.filter((r) => r.confidence === 'Estimated').length;

  const hasActiveFilters = Boolean(searchQuery || filterIndustry || filterTrade);

  // ── Handlers ────────────────────────────────────────

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function handleOpenAdd() {
    setEditingRate(null);
    setShowForm(true);
  }

  function handleOpenEdit(rate: RateEntry) {
    setEditingRate(rate);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingRate(null);
  }

  function handleSave(values: FormValues) {
    const payload = {
      description: values.description.trim(),
      industryId: values.industryId,
      tradeSection: values.tradeSection.trim(),
      unit: values.unit,
      materialsRate: parseNum(values.materialsRate),
      labourRate: parseNum(values.labourRate),
      plantRate: parseNum(values.plantRate),
      subcontractRate: parseNum(values.subcontractRate),
      region: values.region.trim() || 'Gauteng',
      confidence: values.confidence,
      source: values.source,
    };

    if (editingRate) {
      updateRate(editingRate.id, payload);
    } else {
      addRate(payload);
    }
    handleCloseForm();
  }

  function handleDeleteRequest(rate: RateEntry) {
    setDeleteTarget(rate);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteRate(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  function handleClearFilters() {
    setSearchQuery('');
    setFilterIndustry('');
    setFilterTrade('');
  }

  // ── Sort header shorthand ────────────────────────────

  const sortProps = { currentKey: sortKey, currentDir: sortDir, onSort: handleSort };

  // ── Render ───────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Rate Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            Searchable database of unit rates by industry and trade section
          </p>
        </div>
        <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Rate
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="flex gap-4">
        <StatCard
          label="Total Rates"
          value={totalCount}
          icon={<BookOpen size={18} className="text-navy-600" />}
          accent="bg-navy-100"
        />
        <StatCard
          label="Verified Rates"
          value={verifiedCount}
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          accent="bg-emerald-100"
        />
        <StatCard
          label="Estimated Rates"
          value={estimatedCount}
          icon={<AlertCircle size={18} className="text-amber-600" />}
          accent="bg-amber-100"
        />
        <StatCard
          label="Budget Rates"
          value={totalCount - verifiedCount - estimatedCount}
          icon={<DollarSign size={18} className="text-slate-500" />}
          accent="bg-slate-100"
        />
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search description, trade, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white',
              'placeholder-slate-400 text-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors',
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Industry filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className={cn(
              'pl-8 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white appearance-none',
              'text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors',
              filterIndustry ? 'border-amber-400 text-navy-800 font-medium' : '',
            )}
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trade filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className={cn(
              'pl-8 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white appearance-none',
              'text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors',
              filterTrade ? 'border-amber-400 text-navy-800 font-medium' : '',
            )}
          >
            <option value="">All Trades</option>
            {allTrades.map((trade) => (
              <option key={trade} value={trade}>
                {trade}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}

        {/* Result count */}
        <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">
          {sortedRates.length === totalCount
            ? `${totalCount} rate${totalCount !== 1 ? 's' : ''}`
            : `${sortedRates.length} of ${totalCount} rate${totalCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* ── Table Card ── */}
      <Card padding="none" className="overflow-hidden">
        {sortedRates.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title={hasActiveFilters ? 'No Matching Rates' : 'No Rates Yet'}
            description={
              hasActiveFilters
                ? 'No rates match your current search or filters. Try broadening your criteria.'
                : 'Start building your rate library by adding your first unit rate.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" size="sm" icon={<X size={14} />} onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={handleOpenAdd}>
                  Add First Rate
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              {/* Table Head */}
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <SortHeader label="Description" sortKey="description" {...sortProps} className="text-left w-[28%] pl-4" />
                  <SortHeader label="Trade" sortKey="tradeSection" {...sortProps} className="text-left w-[12%]" />
                  <SortHeader label="Unit" sortKey="unit" {...sortProps} className="text-left w-[5%]" />
                  <SortHeader label="Materials" sortKey="materialsRate" {...sortProps} className="text-right w-[8%]" />
                  <SortHeader label="Labour" sortKey="labourRate" {...sortProps} className="text-right w-[8%]" />
                  <SortHeader label="Plant" sortKey="plantRate" {...sortProps} className="text-right w-[8%]" />
                  <SortHeader label="Subcon" sortKey="subcontractRate" {...sortProps} className="text-right w-[8%]" />
                  <SortHeader label="Total Rate" sortKey="totalRate" {...sortProps} className="text-right w-[9%]" />
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left w-[7%]">Source</th>
                  <SortHeader label="Confidence" sortKey="confidence" {...sortProps} className="text-left w-[8%]" />
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right w-[9%] pr-4">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {sortedRates.map((rate, idx) => (
                  <RateRow
                    key={rate.id}
                    rate={rate}
                    isEven={idx % 2 === 0}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Add/Edit Modal ── */}
      <RateFormModal
        open={showForm}
        editingRate={editingRate}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      {/* ── Delete Confirmation Modal ── */}
      <DeleteModal
        open={deleteTarget !== null}
        rateName={deleteTarget?.description ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </motion.div>
  );
}

// ── Rate Row (extracted to avoid re-renders) ──────────────────────────────────

interface RateRowProps {
  rate: RateEntry;
  isEven: boolean;
  onEdit: (rate: RateEntry) => void;
  onDelete: (rate: RateEntry) => void;
}

function RateRow({ rate, isEven, onEdit, onDelete }: RateRowProps) {
  const [hovered, setHovered] = useState(false);

  const cellNum = 'px-3 py-2.5 text-right font-financial text-xs text-slate-700 tabular-nums';
  const cellText = 'px-3 py-2.5 text-left text-xs text-slate-700';

  return (
    <tr
      className={cn(
        'border-b border-slate-100 transition-colors duration-100',
        isEven ? 'bg-white' : 'bg-slate-50/60',
        hovered && 'bg-amber-50/40',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Description */}
      <td className={cn(cellText, 'pl-4 font-medium text-navy-900 max-w-[240px]')}>
        <span className="line-clamp-2 leading-tight">{rate.description}</span>
      </td>

      {/* Trade */}
      <td className={cn(cellText, 'text-slate-600')}>
        <span className="line-clamp-1">{rate.tradeSection || '—'}</span>
      </td>

      {/* Unit */}
      <td className={cn(cellText, 'font-financial text-slate-600 whitespace-nowrap')}>
        {rate.unit}
      </td>

      {/* Materials */}
      <td className={cellNum}>{fmt(rate.materialsRate)}</td>

      {/* Labour */}
      <td className={cellNum}>{fmt(rate.labourRate)}</td>

      {/* Plant */}
      <td className={cellNum}>{fmt(rate.plantRate)}</td>

      {/* Subcon */}
      <td className={cellNum}>{fmt(rate.subcontractRate)}</td>

      {/* Total Rate */}
      <td className={cn(cellNum, 'font-bold text-navy-900')}>
        R {fmt(rate.totalRate)}
      </td>

      {/* Source */}
      <td className={cn(cellText)}>
        <SourceBadge value={rate.source} />
      </td>

      {/* Confidence */}
      <td className={cn(cellText)}>
        <ConfidenceBadge value={rate.confidence} />
      </td>

      {/* Actions */}
      <td className="px-3 py-2.5 pr-4 text-right">
        <div
          className={cn(
            'inline-flex items-center gap-1 transition-opacity duration-150',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <button
            onClick={() => onEdit(rate)}
            className={cn(
              'p-1.5 rounded-md text-slate-400 hover:text-navy-700 hover:bg-navy-100/60 transition-colors',
            )}
            title="Edit rate"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(rate)}
            className={cn(
              'p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-100/60 transition-colors',
            )}
            title="Delete rate"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}
