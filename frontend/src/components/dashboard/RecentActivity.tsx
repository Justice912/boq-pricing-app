import { useProjectStore } from '@/stores/projectStore';
import { timeAgo } from '@/lib/utils';
import { Activity } from 'lucide-react';

export function RecentActivity() {
  const activities = useProjectStore((s) => s.activities);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        <Activity size={24} className="mx-auto mb-2 opacity-40" />
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.slice(0, 10).map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700">
              <span className="font-medium text-navy-800">{entry.projectName}</span>
              {' \u2014 '}
              {entry.action}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(entry.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
