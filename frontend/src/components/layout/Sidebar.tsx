import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Table2,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/boq-editor', icon: Table2, label: 'BOQ Editor' },
  { to: '/rate-library', icon: BookOpen, label: 'Rate Library' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-navy-900 text-white flex flex-col z-30',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-navy-700">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-navy-900 font-extrabold text-sm">BQ</span>
          </div>
          {!sidebarCollapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-sm font-heading font-bold text-white tracking-tight">BOQ Pricing</h1>
              <p className="text-[10px] text-navy-300 font-medium tracking-wider uppercase">Professional</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-all duration-200',
                isActive
                  ? 'bg-navy-700 text-amber-400'
                  : 'text-navy-200 hover:bg-navy-800 hover:text-white',
                sidebarCollapsed && 'justify-center px-0',
              )
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-navy-700 text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
