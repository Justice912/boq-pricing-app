import { useState } from 'react';
import { Trash2, Copy, GripVertical, ChevronDown } from 'lucide-react';
import { EditableCell } from './EditableCell';
import { MEASUREMENT_UNITS } from '@/data/constants';
import { cn } from '@/lib/utils';
import type { BOQItem } from '@/types';

interface BOQItemRowProps {
  item: BOQItem;
  onUpdate: (data: Partial<BOQItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  currency: string;
  showBreakdown: boolean;
}

export function BOQItemRow({ item, onUpdate, onDelete, onDuplicate, currency, showBreakdown }: BOQItemRowProps) {
  const [showUnitSelect, setShowUnitSelect] = useState(false);

  const numCell = (field: keyof BOQItem, val: string) => {
    const num = parseFloat(val) || 0;
    onUpdate({ [field]: num });
  };

  return (
    <tr className="group border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      {/* Grip handle */}
      <td className="w-8 px-1 text-center">
        <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab mx-auto" />
      </td>

      {/* Item No */}
      <td className="w-20 px-1">
        <EditableCell
          value={item.itemNo}
          onChange={(v) => onUpdate({ itemNo: v })}
          className="text-xs text-slate-500 font-mono"
        />
      </td>

      {/* Description */}
      <td className="min-w-[200px] px-1">
        <EditableCell
          value={item.description}
          onChange={(v) => onUpdate({ description: v })}
          placeholder="Enter description..."
        />
      </td>

      {/* Unit */}
      <td className="w-20 px-1 relative">
        <button
          onClick={() => setShowUnitSelect(!showUnitSelect)}
          className="w-full px-2 py-1.5 text-sm text-left truncate rounded hover:bg-amber-50 transition-colors flex items-center gap-1"
        >
          <span className="truncate">{item.unit}</span>
          <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
        </button>
        {showUnitSelect && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUnitSelect(false)} />
            <div className="absolute top-full left-0 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto w-40">
              {MEASUREMENT_UNITS.map((u) => (
                <button
                  key={u.value}
                  onClick={() => { onUpdate({ unit: u.value }); setShowUnitSelect(false); }}
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left hover:bg-amber-50 transition-colors',
                    item.unit === u.value && 'bg-amber-50 text-amber-700 font-medium',
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </>
        )}
      </td>

      {/* Quantity */}
      <td className="w-24 px-1">
        <EditableCell value={item.quantity} onChange={(v) => numCell('quantity', v)} type="number" align="right" />
      </td>

      {/* Rate Breakdown columns (conditionally shown) */}
      {showBreakdown && (
        <>
          <td className="w-24 px-1">
            <EditableCell value={item.materialsRate} onChange={(v) => numCell('materialsRate', v)} type="number" align="right" />
          </td>
          <td className="w-24 px-1">
            <EditableCell value={item.labourRate} onChange={(v) => numCell('labourRate', v)} type="number" align="right" />
          </td>
          <td className="w-20 px-1">
            <EditableCell value={item.plantRate} onChange={(v) => numCell('plantRate', v)} type="number" align="right" />
          </td>
          <td className="w-24 px-1">
            <EditableCell value={item.subcontractRate} onChange={(v) => numCell('subcontractRate', v)} type="number" align="right" />
          </td>
          <td className="w-16 px-1">
            <EditableCell value={item.overheadsPct} onChange={(v) => numCell('overheadsPct', v)} type="number" align="right" />
          </td>
          <td className="w-16 px-1">
            <EditableCell value={item.profitPct} onChange={(v) => numCell('profitPct', v)} type="number" align="right" />
          </td>
        </>
      )}

      {/* Total Rate (computed, read-only) */}
      <td className="w-28 px-1">
        <EditableCell value={item.totalRate} onChange={() => {}} type="number" align="right" disabled />
      </td>

      {/* Total Amount (computed, read-only) */}
      <td className="w-32 px-1">
        <div className="px-2 py-1.5 text-sm text-right font-financial font-semibold text-navy-900">
          {currency} {item.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </td>

      {/* Actions */}
      <td className="w-16 px-1">
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDuplicate} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600" title="Duplicate">
            <Copy size={14} />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
