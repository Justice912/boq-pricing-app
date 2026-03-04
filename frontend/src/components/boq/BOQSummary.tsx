import { BarChart3, TrendingUp, Layers } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { CURRENCY_SYMBOLS } from '@/data/constants';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface BOQSummaryProps {
  project: Project;
}

export function BOQSummary({ project }: BOQSummaryProps) {
  const vatRate = useSettingsStore((s) => s.settings.defaultVatRate);
  const sym = CURRENCY_SYMBOLS[project.currency] || project.currency;

  const sections = project.boqSections;
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const subtotal = project.totalValue;
  const vatAmount = subtotal * (vatRate / 100);
  const grandTotal = subtotal + vatAmount;

  // Compute breakdown totals
  let totalMaterials = 0;
  let totalLabour = 0;
  let totalPlant = 0;
  let totalSubcontract = 0;

  sections.forEach((sec) => {
    sec.items.forEach((item) => {
      totalMaterials += item.materialsRate * item.quantity;
      totalLabour += item.labourRate * item.quantity;
      totalPlant += item.plantRate * item.quantity;
      totalSubcontract += item.subcontractRate * item.quantity;
    });
  });

  const directCostTotal = totalMaterials + totalLabour + totalPlant + totalSubcontract;
  const overheadsAndProfit = subtotal - directCostTotal;

  const fmt = (n: number) => n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pctBar = (value: number, max: number, color: string) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
        <div className={cn('h-2 rounded-full transition-all', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Overview card */}
      <div className="bg-navy-800 text-white rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-navy-300">Project Summary</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-navy-300">Sections</span>
            <span className="text-sm font-bold">{sections.length}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-navy-300">Items</span>
            <span className="text-sm font-bold">{totalItems}</span>
          </div>
          <div className="border-t border-navy-600 my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-navy-300">Subtotal (Excl. VAT)</span>
            <span className="text-sm font-financial font-bold">{sym} {fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-navy-300">VAT ({vatRate}%)</span>
            <span className="text-sm font-financial">{sym} {fmt(vatAmount)}</span>
          </div>
          <div className="border-t border-navy-600 my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-amber-400 font-semibold">GRAND TOTAL</span>
            <span className="text-lg font-financial font-bold text-amber-400">{sym} {fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {directCostTotal > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-navy-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cost Breakdown</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Materials</span>
                <span className="font-financial font-medium">{sym} {fmt(totalMaterials)}</span>
              </div>
              {pctBar(totalMaterials, subtotal, 'bg-blue-500')}
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Labour</span>
                <span className="font-financial font-medium">{sym} {fmt(totalLabour)}</span>
              </div>
              {pctBar(totalLabour, subtotal, 'bg-emerald-500')}
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Plant</span>
                <span className="font-financial font-medium">{sym} {fmt(totalPlant)}</span>
              </div>
              {pctBar(totalPlant, subtotal, 'bg-orange-500')}
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Subcontract</span>
                <span className="font-financial font-medium">{sym} {fmt(totalSubcontract)}</span>
              </div>
              {pctBar(totalSubcontract, subtotal, 'bg-purple-500')}
            </div>
            <div className="border-t border-slate-100 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">OH & Profit</span>
                <span className="font-financial font-medium">{sym} {fmt(overheadsAndProfit)}</span>
              </div>
              {pctBar(overheadsAndProfit, subtotal, 'bg-amber-500')}
            </div>
          </div>
        </div>
      )}

      {/* Section Totals */}
      {sections.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-navy-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">By Section</span>
          </div>
          <div className="space-y-2">
            {sections.map((sec) => {
              const secTotal = sec.items.reduce((sum, it) => sum + it.totalAmount, 0);
              const pct = subtotal > 0 ? ((secTotal / subtotal) * 100).toFixed(1) : '0.0';
              return (
                <div key={sec.id} className="flex items-center gap-2 text-xs">
                  <span className="bg-navy-100 text-navy-700 font-bold px-1.5 py-0.5 rounded text-[10px]">{sec.sectionNo}</span>
                  <span className="flex-1 text-slate-600 truncate">{sec.name}</span>
                  <span className="text-slate-400">{pct}%</span>
                  <span className="font-financial font-medium text-navy-800 min-w-[80px] text-right">
                    {sym} {fmt(secTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
