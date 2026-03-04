import { useProjectStore } from '@/stores/projectStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, FileSpreadsheet, Clock, Award } from 'lucide-react';

export function QuickStats() {
  const projects = useProjectStore((s) => s.projects);
  const currency = useSettingsStore((s) => s.settings.defaultCurrency);

  const totalValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
  const totalBOQs = projects.length;
  const pendingReview = projects.filter((p) => p.status === 'priced').length;
  const awarded = projects.filter((p) => p.status === 'awarded').length;

  const stats = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(totalValue, currency),
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Active Projects',
      value: totalBOQs.toString(),
      icon: FileSpreadsheet,
      color: 'text-navy-600',
      bg: 'bg-navy-50',
    },
    {
      label: 'Pending Review',
      value: pendingReview.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Awarded',
      value: awarded.toString(),
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon size={20} className={stat.color} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-heading font-bold text-navy-900 mt-1">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
