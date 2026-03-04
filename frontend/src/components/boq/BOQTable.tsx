import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { BOQSectionHeader } from './BOQSectionHeader';
import { BOQItemRow } from './BOQItemRow';
import { useProjectStore } from '@/stores/projectStore';
import { computeTotalRate } from '@/lib/utils';
import { CURRENCY_SYMBOLS } from '@/data/constants';
import { cn } from '@/lib/utils';
import type { Project, AIPricingSuggestion } from '@/types';

interface BOQTableProps {
  project: Project;
  showBreakdown: boolean;
  suggestions?: AIPricingSuggestion[];
  onAcceptSuggestion?: (id: string) => void;
  onDismissSuggestion?: (id: string) => void;
}

// ── Confidence badge helper ──────────────────────────────────────────────────

interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  confidence: number;
}

function ConfidenceBadge({ level, confidence }: ConfidenceBadgeProps) {
  const styles: Record<string, string> = {
    high: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border border-amber-200',
    low: 'bg-slate-100 text-slate-600 border border-slate-200',
  };
  const labels: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap',
        styles[level],
      )}
    >
      {confidence}% {labels[level]}
    </span>
  );
}

// ── Inline suggestion row ────────────────────────────────────────────────────

interface SuggestionRowProps {
  suggestion: AIPricingSuggestion;
  totalColumns: number;
  onAccept: () => void;
  onDismiss: () => void;
}

function SuggestionRow({ suggestion, totalColumns, onAccept, onDismiss }: SuggestionRowProps) {
  const { suggestedRates } = suggestion;
  const suggestedTotal = computeTotalRate(
    suggestedRates.materialsRate,
    suggestedRates.labourRate,
    suggestedRates.plantRate,
    suggestedRates.subcontractRate,
    10,
    10,
  );

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <td
        colSpan={totalColumns}
        className="px-0 py-0 border-b border-amber-200"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-50/50 border-l-4 border-amber-400">
          {/* Icon */}
          <Sparkles size={14} className="text-amber-500 flex-shrink-0" />

          {/* Confidence badge */}
          <ConfidenceBadge level={suggestion.confidenceLevel} confidence={suggestion.confidence} />

          {/* Suggested rate */}
          <span className="text-sm font-semibold text-navy-900 whitespace-nowrap">
            R {suggestedTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>

          {/* Match reason */}
          <span className="text-xs text-slate-500 truncate min-w-0 flex-1">
            {suggestion.matchReason}
          </span>

          {/* Rate breakdown */}
          <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block flex-shrink-0">
            Mat: R{suggestedRates.materialsRate.toFixed(0)}
            {' | '}
            Lab: R{suggestedRates.labourRate.toFixed(0)}
            {' | '}
            Plant: R{suggestedRates.plantRate.toFixed(0)}
            {' | '}
            Sub: R{suggestedRates.subcontractRate.toFixed(0)}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <button
              onClick={onAccept}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all',
                'bg-emerald-100 text-emerald-700 border border-emerald-200',
                'hover:bg-emerald-200 hover:border-emerald-300',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
              )}
            >
              <Check size={11} />
              Accept
            </button>
            <button
              onClick={onDismiss}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all',
                'text-slate-500 border border-slate-200 bg-white',
                'hover:bg-slate-50 hover:text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-slate-400/30',
              )}
            >
              <X size={11} />
            </button>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

// ── Main BOQTable component ──────────────────────────────────────────────────

export function BOQTable({
  project,
  showBreakdown,
  suggestions = [],
  onAcceptSuggestion,
  onDismissSuggestion,
}: BOQTableProps) {
  const { addItem, removeItem, updateItem, duplicateItem, removeSection, updateSection } = useProjectStore();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const currencySymbol = CURRENCY_SYMBOLS[project.currency] || project.currency;

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // Build a lookup map: boqItemId -> pending suggestion
  const pendingSuggestionByItem = new Map<string, AIPricingSuggestion>();
  for (const s of suggestions) {
    if (s.status === 'pending') {
      pendingSuggestionByItem.set(s.boqItemId, s);
    }
  }

  // Column count for section header colspan
  const baseColumns = 6; // grip + itemNo + desc + unit + qty + totalRate + amount + actions
  const breakdownColumns = showBreakdown ? 6 : 0; // mat + lab + plant + sub + oh + profit
  const totalColumns = baseColumns + breakdownColumns + 3; // +3 for amount, totalRate, actions

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="w-8 px-1 py-2" />
            <th className="w-20 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
            <th className="min-w-[200px] px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
            <th className="w-20 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
            <th className="w-24 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Qty</th>
            {showBreakdown && (
              <>
                <th className="w-24 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Materials</th>
                <th className="w-24 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Labour</th>
                <th className="w-20 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Plant</th>
                <th className="w-24 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Subcon</th>
                <th className="w-16 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">OH%</th>
                <th className="w-16 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">P%</th>
              </>
            )}
            <th className="w-28 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Rate</th>
            <th className="w-32 px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
            <th className="w-16 px-2 py-2" />
          </tr>
        </thead>
        {project.boqSections.length === 0 && (
          <tbody>
            <tr>
              <td colSpan={totalColumns} className="px-4 py-12 text-center text-sm text-slate-400">
                No sections yet. Add a section or load an industry template to get started.
              </td>
            </tr>
          </tbody>
        )}

        {project.boqSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.id);
          return (
            <tbody key={section.id}>
              <BOQSectionHeader
                section={section}
                collapsed={isCollapsed}
                onToggle={() => toggleSection(section.id)}
                onAddItem={() => addItem(project.id, section.id)}
                onRemove={() => removeSection(project.id, section.id)}
                onUpdate={(data) => updateSection(project.id, section.id, data)}
                currency={currencySymbol}
                colSpan={totalColumns}
              />
              {!isCollapsed && (
                <AnimatePresence initial={false}>
                  {section.items.map((item) => {
                    const suggestion = pendingSuggestionByItem.get(item.id);
                    return [
                      <BOQItemRow
                        key={item.id}
                        item={item}
                        onUpdate={(data) => updateItem(project.id, section.id, item.id, data)}
                        onDelete={() => removeItem(project.id, section.id, item.id)}
                        onDuplicate={() => duplicateItem(project.id, section.id, item.id)}
                        currency={currencySymbol}
                        showBreakdown={showBreakdown}
                      />,
                      suggestion ? (
                        <SuggestionRow
                          key={`suggestion-${suggestion.id}`}
                          suggestion={suggestion}
                          totalColumns={totalColumns}
                          onAccept={() => onAcceptSuggestion?.(suggestion.id)}
                          onDismiss={() => onDismissSuggestion?.(suggestion.id)}
                        />
                      ) : null,
                    ];
                  })}
                </AnimatePresence>
              )}
            </tbody>
          );
        })}

        {/* Grand total footer */}
        {project.boqSections.length > 0 && (
          <tfoot>
            <tr className="bg-navy-800 text-white">
              <td colSpan={totalColumns - 2} className="px-4 py-3 text-sm font-bold uppercase tracking-wider">
                Grand Total (Excl. VAT)
              </td>
              <td className="px-2 py-3 text-right">
                <span className="text-sm font-financial font-bold">
                  {currencySymbol} {project.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
