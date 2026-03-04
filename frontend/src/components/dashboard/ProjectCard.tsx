import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { INDUSTRIES } from '@/data/industries';
import { MapPin, Calendar, MoreVertical } from 'lucide-react';
import type { Project } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const { deleteProject, updateProjectStatus } = useProjectStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const industry = INDUSTRIES.find((i) => i.id === project.industryId);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/boq-editor?project=${project.id}`)}
    >
      {/* Color bar at top by status */}
      <div
        className={`h-1 ${
          project.status === 'awarded'
            ? 'bg-emerald-500'
            : project.status === 'submitted'
              ? 'bg-blue-500'
              : project.status === 'priced'
                ? 'bg-amber-500'
                : 'bg-slate-300'
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-heading font-bold text-navy-900 truncate">{project.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{project.client || 'No client'}</p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <StatusBadge status={project.status} />
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  {(['draft', 'priced', 'submitted', 'awarded'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProjectStatus(project.id, s);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 capitalize"
                    >
                      Mark as {s}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Industry tag */}
        {industry && (
          <span className="inline-flex items-center text-[10px] font-medium text-navy-600 bg-navy-50 px-2 py-0.5 rounded mb-3">
            {industry.name}
          </span>
        )}

        {/* Amount */}
        <div className="mb-3">
          <p className="text-lg font-mono font-semibold text-navy-900 tabular-nums">
            {formatCurrency(project.totalValue, project.currency)}
          </p>
        </div>

        {/* Footer meta */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {project.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {project.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(project.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
