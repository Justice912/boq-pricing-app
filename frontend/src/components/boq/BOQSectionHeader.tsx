import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BOQSection } from '@/types';

interface BOQSectionHeaderProps {
  section: BOQSection;
  collapsed: boolean;
  onToggle: () => void;
  onAddItem: () => void;
  onRemove: () => void;
  onUpdate: (data: Partial<Pick<BOQSection, 'name' | 'sectionNo'>>) => void;
  currency: string;
  colSpan: number;
}

export function BOQSectionHeader({
  section,
  collapsed,
  onToggle,
  onAddItem,
  onRemove,
  onUpdate,
  currency,
  colSpan,
}: BOQSectionHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(section.name);
  const sectionTotal = section.items.reduce((sum, it) => sum + it.totalAmount, 0);

  const commitEdit = () => {
    if (draftName.trim() && draftName !== section.name) {
      onUpdate({ name: draftName.trim() });
    }
    setEditing(false);
  };

  return (
    <tr className="bg-navy-50 border-b-2 border-navy-200">
      <td colSpan={colSpan} className="px-2 py-2">
        <div className="flex items-center gap-2">
          {/* Collapse toggle */}
          <button onClick={onToggle} className="p-0.5 rounded hover:bg-navy-200 text-navy-600 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Section number badge */}
          <span className="bg-navy-700 text-white text-xs font-bold px-2 py-0.5 rounded">
            {section.sectionNo}
          </span>

          {/* Section name */}
          {editing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
                className="flex-1 px-2 py-0.5 text-sm font-semibold border border-amber-400 rounded bg-white outline-none ring-2 ring-amber-400/20"
                autoFocus
              />
              <button onClick={commitEdit} className="p-1 rounded hover:bg-emerald-100 text-emerald-600">
                <Check size={14} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-red-100 text-red-600">
                <X size={14} />
              </button>
            </div>
          ) : (
            <span
              className="text-sm font-semibold text-navy-800 cursor-pointer hover:text-amber-700 transition-colors"
              onDoubleClick={() => { setDraftName(section.name); setEditing(true); }}
            >
              {section.name}
            </span>
          )}

          <span className="text-xs text-slate-500 ml-1">
            ({section.items.length} item{section.items.length !== 1 ? 's' : ''})
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Section total */}
          <span className="text-sm font-financial font-bold text-navy-900 mr-4">
            {currency} {sectionTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>

          {/* Actions */}
          <div className={cn('flex items-center gap-1')}>
            {!editing && (
              <button onClick={() => { setDraftName(section.name); setEditing(true); }} className="p-1 rounded hover:bg-navy-200 text-navy-400 hover:text-navy-700" title="Rename">
                <Edit3 size={14} />
              </button>
            )}
            <button onClick={onAddItem} className="p-1 rounded hover:bg-emerald-100 text-navy-400 hover:text-emerald-600" title="Add item">
              <Plus size={14} />
            </button>
            <button onClick={onRemove} className="p-1 rounded hover:bg-red-100 text-navy-400 hover:text-red-600" title="Remove section">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
