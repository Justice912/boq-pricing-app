import { useIndustryStore } from '@/stores/industryStore';
import { INDUSTRIES } from '@/data/industries';
import { Bell, Search } from 'lucide-react';

export function TopBar() {
  const { selectedIndustryId, setSelectedIndustry } = useIndustryStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, items..."
            className="pl-9 pr-4 py-2 w-72 text-sm bg-slate-50 border border-slate-200 rounded-lg
                       placeholder:text-slate-400 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
                       transition-all"
          />
        </div>
      </div>

      {/* Center: Industry Selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</label>
        <select
          value={selectedIndustryId}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="px-3 py-2 text-sm font-medium bg-navy-50 border border-navy-200 rounded-lg
                     text-navy-800 cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
                     transition-all min-w-[240px]"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold">
          QS
        </div>
      </div>
    </header>
  );
}
